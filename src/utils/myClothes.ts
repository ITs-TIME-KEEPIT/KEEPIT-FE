import type { ClothItem } from '../types/clothing';
import type { Rental } from '../types/rental';
import { hoursLeft } from '../state/rentalStore';

export const hasActiveTrade = (rentals: Rental[], clothId: string) =>
  rentals.some(r => r.clothId === clothId && ['accepted', 'handed-over', 'received', 'returned'].includes(r.stage));

export function clothingStatus(cloth: ClothItem, rentals: Rental[]) {
  const related = rentals.filter(r => r.clothId === cloth.id);
  const pending = related.filter(r => r.stage === 'requested' && hoursLeft(r) > 0);
  if (hasActiveTrade(related, cloth.id)) return { label: '거래 중', tone: 'primary' as const, count: pending.length };
  if (cloth.hidden) return { label: '대여 중지', tone: 'gray' as const, count: pending.length };
  if (pending.length) return { label: `신청 · 응답 대기 ${Math.min(...pending.map(r => hoursLeft(r)))}시간`, tone: 'alert' as const, count: pending.length };
  return { label: '대여 가능', tone: 'primary' as const, count: 0 };
}
