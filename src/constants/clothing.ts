/*
 * 옷 관련 공용 상수
 * 홈 카테고리 칩, 상세 필터, 옷 등록(REG-320)에서 같은 목록을 사용합니다.
 */

export const CATEGORIES = ['상의', '하의', '원피스', '아우터', '잡화'] as const;
export type Category = (typeof CATEGORIES)[number];

// 10/17 숫자 사이즈 삭제. 잡화는 FREE로 저장됩니다.
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'FREE'] as const;
export type Size = (typeof SIZES)[number];

export const COLORS = [
  { key: 'black', label: '블랙', hex: '#222222' },
  { key: 'white', label: '화이트', hex: '#FFFFFF' },
  { key: 'gray', label: '그레이', hex: '#9CA3AF' },
  { key: 'beige', label: '베이지', hex: '#E8DCC4' },
  { key: 'brown', label: '브라운', hex: '#8B5E3C' },
  { key: 'navy', label: '네이비', hex: '#1E3A5F' },
  { key: 'blue', label: '블루', hex: '#3B82F6' },
  { key: 'green', label: '그린', hex: '#4CAF50' },
  { key: 'red', label: '레드', hex: '#E53935' },
  { key: 'pink', label: '핑크', hex: '#F8A5C2' },
  { key: 'yellow', label: '옐로우', hex: '#FDD835' },
  { key: 'purple', label: '퍼플', hex: '#9575CD' },
  { key: 'etc', label: '기타', hex: null }, // assets/icons/color-etc.png 사용
] as const;
export type ColorKey = (typeof COLORS)[number]['key'];
