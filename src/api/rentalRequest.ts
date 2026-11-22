import { apiPost } from './client';
import { toApiDate } from '../utils/formatDate';
import type { TradeMethod } from '../types/rental';

type RentalSelection = { start: number; end: number; method: TradeMethod };

export type RentalQuote = {
  rentalFee: number;
  deliveryFee: number | null;
  totalFee: number;
  rentalDays: number;
  returnDeliveryPaidByBorrower: boolean;
  laundryBy: 'BORROWER' | 'OWNER';
  laundryMethod: 'DRY_CLEAN' | 'DISCUSS';
};

function selectionPayload({ start, end, method }: RentalSelection) {
  return {
    startDate: toApiDate(new Date(start)),
    endDate: toApiDate(new Date(end)),
    tradeMethod: method === '직거래' ? 'DIRECT' : 'DELIVERY',
  };
}

export const getRentalQuote = (id: string, selection: RentalSelection) =>
  apiPost<RentalQuote>(`/api/v1/clothes/${id}/rental-quotes`, selectionPayload(selection));

export async function requestServerRental(
  id: string,
  selection: RentalSelection,
  rulesAgreed: boolean,
) {
  const { rentalId } = await apiPost<{ rentalId: number }>(`/api/v1/clothes/${id}/rentals`, {
    ...selectionPayload(selection),
    rulesAgreed,
  });
  if (!Number.isSafeInteger(rentalId) || rentalId <= 0)
    throw new Error('신청 결과에서 대여 ID를 확인할 수 없어요.');
  return rentalId;
}
