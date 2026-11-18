import type { Category } from '../constants/clothing';
import type { Region } from '../constants/regions';
import type { ClothItem } from '../types/clothing';
import type { DetailFilter } from '../types/filter';

// 항목끼리는 AND, 같은 항목 안의 여러 선택은 OR
export function filterClothItems(
  items: ClothItem[],
  category: Category | '전체',
  filter: DetailFilter,
  region: Region = null,
) {
  return items.filter((item) => {
    // shortcut: 옷 데이터에 시/도가 없어 구 이름만 비교 (서울, 인천 '서구' 구분 불가), API 연동 시 시/도까지 비교
    if (region && item.region !== region.district) return false;
    if (category !== '전체' && item.category !== category) return false;
    if (item.price < filter.price.min) return false;
    if (filter.price.max !== null && item.price > filter.price.max) return false;
    if (filter.sizes.length && !filter.sizes.includes(item.size)) return false;
    if (filter.colors.length && !item.colors.some((c) => filter.colors.includes(c))) return false;
    return true;
  });
}

export const isFilterActive = ({ price, sizes, colors }: DetailFilter) =>
  price.min > 0 || price.max !== null || sizes.length > 0 || colors.length > 0;

// shortcut: 옷 이름·카테고리에 검색어가 들어있는지만 봄 (띄어쓰기·오타 무시 안 함), 검색 API 연동 시 교체
export const matchesQuery = (item: ClothItem, query: string) => {
  const keyword = query.trim().toLowerCase();
  return [item.title, item.category].some((text) => text.toLowerCase().includes(keyword));
};

// 옷 카드 공통 뱃지 (세탁 포함 · 택배 가능)
export const clothBadges = (item: ClothItem) => [
  ...(item.laundryIncluded ? [{ label: '세탁 포함' }] : []),
  ...(item.shippingAvailable ? [{ label: '택배 가능', tone: 'gray' as const }] : []),
];
