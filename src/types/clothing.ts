import type { Category, ColorKey, Size } from '../constants/clothing';

/* 홈 목록·검색 결과·프로필 목록에 쓰이는 옷 정보 */
export type ClothItem = {
  id: string;
  title: string;
  region: string; // 거래 지역 (구 단위, 예: '마포구')
  category: Category;
  size: Size;
  colors: ColorKey[]; // 등록 시 컬러는 다중 선택
  price: number; // 대여료 (직거래 기준, 택배비 제외)
  laundryIncluded: boolean; // '세탁 포함' 뱃지
  shippingAvailable: boolean; // '택배 가능' 뱃지
  imageUrl?: string;
};
