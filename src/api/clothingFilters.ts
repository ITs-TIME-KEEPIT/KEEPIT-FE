import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { getClothingAvailability, getClothingDetail, serverClothesId } from './clothing';
import type { ClothItem } from '../types/clothing';
import type { DateRange } from '../types/filter';
import { rentalDays, toApiDate } from '../utils/formatDate';

type Match = { colors?: ClothItem['colors']; available: boolean };

export function useClothingFilterData(items: ClothItem[], range: DateRange, loadColors: boolean) {
  const focused = useIsFocused();
  const from = range ? toApiDate(range.start) : undefined;
  const to = range ? toApiDate(range.end) : undefined;
  const days = range ? rentalDays(range.start, range.end) : 0;
  const ids =
    range || loadColors
      ? items
          .map((item) => serverClothesId(item.id))
          .filter(Boolean)
          .join(',')
      : '';
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([ids, from, to, days, loadColors, attempt]);
  const [result, setResult] = useState<{
    key: string;
    matches: Map<string, Match>;
    error: boolean;
  }>();

  useEffect(() => {
    if (!ids || !focused) return;
    let active = true;

    async function load() {
      const matches = new Map<string, Match>();
      let error = false;
      const candidates = ids.split(',');
      // 한 번에 확인하는 옷의 수를 제한합니다.
      for (let offset = 0; active && offset < candidates.length; offset += 5) {
        await Promise.all(
          candidates.slice(offset, offset + 5).map(async (id) => {
            const [detail, schedule] = await Promise.allSettled([
              loadColors ? getClothingDetail(id) : undefined,
              from && to ? getClothingAvailability(id, { from, to }) : undefined,
            ]);
            const availability = schedule.status === 'fulfilled' ? schedule.value : undefined;
            error ||= detail.status === 'rejected' || schedule.status === 'rejected';
            matches.set(id, {
              colors: detail.status === 'fulfilled' ? detail.value?.colors : undefined,
              available:
                !from ||
                (!!availability &&
                  availability.rentable &&
                  days <= availability.maxRentalDays &&
                  (!availability.directUnavailableDates.length ||
                    (availability.deliveryAvailable &&
                      !availability.deliveryUnavailableDates.length))),
            });
          }),
        );
      }
      if (active) setResult({ key, matches, error });
    }

    void load();
    return () => {
      active = false;
    };
  }, [days, focused, from, ids, key, loadColors, to]);

  const current = result?.key === key ? result : undefined;
  const filteredItems = items.flatMap((item) => {
    const id = serverClothesId(item.id);
    if (id) {
      const match = current?.matches.get(id);
      if (range && !match?.available) return [];
      return [match?.colors ? { ...item, colors: match.colors } : item];
    }
    if (from && to) {
      const period = item.detail?.unavailablePeriod;
      const periods =
        item.detail?.unavailablePeriods ??
        (period
          ? [
              {
                startDate: toApiDate(new Date(period.start)),
                endDate: toApiDate(new Date(period.end)),
              },
            ]
          : []);
      if (periods.some(({ startDate, endDate }) => startDate <= to && from <= endDate)) return [];
    }
    return [item];
  });

  return {
    filteredItems,
    loading: !!ids && !current,
    error: current?.error,
    retry: () => setAttempt((value) => value + 1),
  };
}
