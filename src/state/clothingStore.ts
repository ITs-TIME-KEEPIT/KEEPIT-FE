import { useSyncExternalStore } from 'react';
import { MOCK_CLOTH_ITEMS } from '../mocks/clothItems';
import type { ClothItem } from '../types/clothing';

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
