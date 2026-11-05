import { DEMO_IDS } from './demoScenario';

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

// shortcut: 기획 문서에 연락처가 없어 전화·문자 버튼 시연용 가짜 번호를 사용, 프로필 API 연동 시 교체
export const DEMO_PHONES: Record<string, string> = {
  [DEMO_IDS.owner]: '010-0000-0001',
  [DEMO_IDS.borrower]: '010-0000-0002',
};
