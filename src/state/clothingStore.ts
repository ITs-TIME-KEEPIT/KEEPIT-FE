import { useSyncExternalStore } from 'react';
import { MOCK_CLOTH_ITEMS } from '../mocks/clothItems';
import type { ClothItem } from '../types/clothing';
import { getRentalState } from './rentalStore';
import { hasActiveTrade } from '../utils/myClothes';

// 백엔드 연동 전 앱 실행 중의 등록 결과를 홈·상세에서 함께 사용합니다.
let items: ClothItem[] = [...MOCK_CLOTH_ITEMS];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {listeners.add(listener); return () => {listeners.delete(listener);};};
const getSnapshot = () => items;
export function useClothingItems() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
export function saveClothing(item: ClothItem) {
  if (items.some(existing => existing.id === item.id)) throw new Error('이미 등록된 옷입니다.');
  items = [item, ...items];
  listeners.forEach(listener => listener());
}

function requireOwner(id: string, ownerId: string) {
  const item = items.find(c => c.id === id && !c.deleted);
  if (!item || item.ownerId !== ownerId) throw new Error('내가 등록한 옷만 관리할 수 있어요.');
  return item;
}
function notify() { listeners.forEach(listener => listener()); }
export function updateClothing(item: ClothItem, ownerId: string) {
  const original = requireOwner(item.id, ownerId);
  if (hasActiveTrade(getRentalState().rentals, item.id)) throw new Error('진행 중인 거래가 있어 수정할 수 없어요.');
  items = items.map(c => c.id === item.id ? { ...item, ownerId: original.ownerId, hidden: original.hidden } : c);
  notify();
}
export function setClothingHidden(id: string, hidden: boolean, ownerId: string) {
  requireOwner(id, ownerId);
  items = items.map(c => c.id === id ? { ...c, hidden } : c);
  notify();
}
export function deleteClothing(id: string, ownerId: string) {
  requireOwner(id, ownerId);
  const rentals = getRentalState().rentals;
  if (hasActiveTrade(rentals, id)) throw new Error('진행 중인 거래가 있어 삭제할 수 없어요.');
  if (rentals.some(r => r.clothId === id && r.stage === 'requested')) throw new Error('받은 신청을 먼저 처리해주세요.');
  // 완료된 거래의 옷 정보는 유지하고, 탐색·관리 목록에서만 제거합니다.
  items = items.map(c => c.id === id ? { ...c, deleted: true, hidden: true } : c);
  notify();
}
