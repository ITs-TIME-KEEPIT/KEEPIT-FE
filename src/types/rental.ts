import type { DEMO_TRADE_SNAPSHOTS } from '../mocks/demoScenario';

/* 대여 신청 시 대여자가 고르는 거래 방식 */
export type TradeMethod = '직거래' | '택배';

/* 신청·거래 단계. demoScenario의 공통 키를 그대로 쓰고, 거절·취소만 추가 */
export type TradeStage = (typeof DEMO_TRADE_SNAPSHOTS)[number]['key'] | 'rejected' | 'cancelled';

export type LaundryNotice = 'handoff' | 'receipt';

/* 신청 한 건. 수락되면 같은 객체가 거래로 이어집니다 */
export type Rental = {
  id: string;
  clothId: string;
  ownerId: string;
  borrowerId: string;
  start: number; // 받는 날 (timestamp)
  end: number; // 돌려주는 날 (timestamp)
  method: TradeMethod;
  stage: TradeStage;
  createdAt: number;
  rejectReason?: string;
  laundryNoticeSeen?: LaundryNotice[]; // 세탁 안내 팝업은 거래마다 시점별 1회만 노출
  photosReviewed?: boolean; // 등록자가 사진 비교를 마쳐야 거래 완료 가능
  completedAt?: number;
  cancelReason?: string;
  report?: { reason: string; reporterId: string; reportedAt: number }; // 운영자 확인 전까지 거래 진행은 막지 않습니다
};
