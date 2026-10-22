import type { ColorKey, Size } from '../constants/clothing';

/* 홈 상세 필터 (가격·사이즈·컬러) */
export type DetailFilter = {
  price: { min: number; max: number | null }; // max null = 5만원 이상(상한 없음)
  sizes: Size[];
  colors: ColorKey[];
};

export const INITIAL_FILTER: DetailFilter = {
  price: { min: 0, max: null },
  sizes: [],
  colors: [],
};

/* 홈 날짜 필터 (받는 날 ~ 돌려주는 날). null = 날짜 미선택 */
export type DateRange = { start: Date; end: Date } | null;
