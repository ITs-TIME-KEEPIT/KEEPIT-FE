import type { ColorKey, Size } from '../constants/clothing';

/** 홈 상세 필터 (가격·사이즈·컬러) */
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
