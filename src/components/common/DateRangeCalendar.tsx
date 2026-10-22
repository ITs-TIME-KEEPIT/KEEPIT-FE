import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../constants/colors';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// 해당 월을 일요일 시작 주 단위로 나눔 (빈칸은 null)
function getWeeks(year: number, month: number) {
  const offset = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

interface DateRangeCalendarProps {
  start: Date | null;
  end: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  // TODO: API 연동 후 옷별 예약 날짜(택배 버퍼·예약 간격 포함)를 넘겨 취소선으로 표시
  isReserved?: (date: Date) => boolean;
}

export default function DateRangeCalendar({
  start,
  end,
  onChange,
  isReserved,
}: DateRangeCalendarProps) {
  const min = today();
  const initial = start ?? min;
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  const canGoPrev = year > min.getFullYear() || month > min.getMonth();

  const moveMonth = (diff: number) => {
    const next = new Date(year, month + diff, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  // 첫 탭 = 받는 날, 두 번째 탭 = 돌려주는 날. 받는 날보다 앞을 누르면 받는 날을 다시 고름
  const onPressDay = (date: Date) => {
    if (!start || end || date < start) onChange(date, null);
    else onChange(start, date);
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <Pressable
          onPress={() => moveMonth(-1)}
          disabled={!canGoPrev}
          accessibilityRole="button"
          accessibilityLabel="이전 달"
          hitSlop={8}
        >
          <Image
            source={require('../../../assets/icons/chevron-left.png')}
            style={[styles.arrow, !canGoPrev && styles.arrowDisabled]}
            resizeMode="contain"
          />
        </Pressable>
        <Text style={styles.month}>
          {year}년 {month + 1}월
        </Text>
        <Pressable
          onPress={() => moveMonth(1)}
          accessibilityRole="button"
          accessibilityLabel="다음 달"
          hitSlop={8}
        >
          <Image
            source={require('../../../assets/icons/chevron-right.png')}
            style={styles.arrow}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={styles.row}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      {getWeeks(year, month).map((week, w) => (
        <View key={w} style={styles.row}>
          {week.map((date, col) => {
            if (!date) return <View key={col} style={styles.cell} />;
            const disabled = date < min || !!isReserved?.(date);
            const isStart = start?.getTime() === date.getTime();
            const isEnd = end?.getTime() === date.getTime();
            const hasRange = !!start && !!end && start < end;
            const inRange = hasRange && date >= start && date <= end;
            const isSunday = col === 0;

            return (
              <Pressable
                key={col}
                onPress={() => onPressDay(date)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`${month + 1}월 ${date.getDate()}일`}
                accessibilityState={{ disabled, selected: isStart || isEnd }}
                style={[
                  styles.cell,
                  inRange && styles.band,
                  inRange && (isStart || col === 0) && styles.bandLeft,
                  inRange && (isEnd || col === 6) && styles.bandRight,
                ]}
              >
                {isStart || isEnd ? (
                  <View style={styles.circle}>
                    <Text style={styles.dayOnCircle}>{date.getDate()}</Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.day,
                      inRange && styles.dayInRange,
                      isSunday && styles.daySunday,
                      disabled && styles.dayDisabled,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>선택</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.line }]} />
          <Text style={styles.legendText}>예약됨·대여 불가</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 4,
  },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },

  arrow: {
    width: 24,
    height: 24,
    tintColor: COLORS.textSub,
  },

  arrowDisabled: {
    opacity: 0.3,
  },

  month: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  row: {
    flexDirection: 'row',
  },

  weekday: {
    flex: 1,
    height: 24,
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 17.4,
    letterSpacing: 0,
    color: COLORS.textPlaceholder,
    includeFontPadding: false,
  },

  cell: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 받는 날 ~ 돌려주는 날 사이 띠
  band: {
    backgroundColor: COLORS.primaryLight,
  },

  bandLeft: {
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },

  bandRight: {
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },

  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },

  day: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.text,
    includeFontPadding: false,
  },

  dayInRange: {
    fontFamily: 'Pretendard-SemiBold',
  },

  daySunday: {
    color: COLORS.alert,
  },

  dayDisabled: {
    color: COLORS.textPlaceholder,
    textDecorationLine: 'line-through',
  },

  dayOnCircle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 15,
    lineHeight: 21.75,
    letterSpacing: 0,
    color: COLORS.white,
    includeFontPadding: false,
  },

  legend: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 8,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },

  legendText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    lineHeight: 17.4,
    letterSpacing: 0,
    color: COLORS.textSub,
    includeFontPadding: false,
  },
});