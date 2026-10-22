import type { Category } from '../constants/clothing';
import type { ClothItem } from '../types/clothing';
import type { DetailFilter } from '../types/filter';

// 항목끼리는 AND, 같은 항목 안의 여러 선택은 OR
export function filterClothItems(
  items: ClothItem[],
  category: Category | '전체',
  filter: DetailFilter,
) {
  return items.filter((item) => {
    if (category !== '전체' && item.category !== category) return false;
    if (item.price < filter.price.min) return false;
    if (filter.price.max !== null && item.price > filter.price.max) return false;
    if (filter.sizes.length && !filter.sizes.includes(item.size)) return false;
    if (filter.colors.length && !item.colors.some((c) => filter.colors.includes(c))) return false;
    return true;
  });
}
