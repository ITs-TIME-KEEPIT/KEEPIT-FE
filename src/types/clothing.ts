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
  originalPrice?: number;
  ownerId?: string;
  sourceCategory?: string;
  colorLabel?: string;
  sizeLabel?: string;
  laundryIncluded: boolean; // '세탁 포함' 뱃지
  shippingAvailable: boolean; // '택배 가능' 뱃지
  imageUrl?: string;
  // UI 시연용 상세 데이터. API 연동 때 서버 응답으로 교체합니다.
  detail?: {
    ownerName: string;
    postedLabel?: string;
    description?: string;
    shippingFee?: number;
    laundry?: string;
    availablePeriod?: string;
    measurements?: Record<string, number>;
    region?: {sido: string; district: string};
    unavailablePeriod?: {start: number; end: number};
    photoUris?: string[];
    photos?: { part: '전면' | '후면' | '라벨' | '디테일'; uri?: string }[];
    views?: number;
    defect?: { count: number; description: string; photoUris?: string[] };
  };
};
