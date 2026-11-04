/*
 * 중간발표 시연용 대여 신청 더미 데이터 (라벤더 쉬폰 롱원피스, 등록자 수빈)
 * API 연동 후에는 옷 상세 응답을 사용합니다.
 */

export const MOCK_RENTAL_CLOTH = {
  id: 'lavender-dress',
  title: '라벤더 쉬폰 롱원피스',
  price: 25000,
  ownerNickname: '옷장정리중',
  region: '마포구',
  shippingAvailable: true,
  laundryByRenter: true, // 빌린 사람이 드라이클리닝 후 반납
  availableFrom: new Date(2026, 10, 1),
  availableTo: new Date(2026, 11, 31),
  reservedDates: [6, 7, 8, 21, 22].map((day) => new Date(2026, 10, day)),
};

/*
 * 연휴 택배 안내 팝업용 연휴 일정 (Figma 시안 데이터)
 * 실제로는 운영자가 연휴 일정·택배 접수 마감일을 미리 등록합니다.
 */
export const MOCK_HOLIDAY = {
  name: '성탄절',
  start: new Date(2026, 11, 25),
  end: new Date(2026, 11, 27),
  shippingDeadline: new Date(2026, 11, 23),
};
