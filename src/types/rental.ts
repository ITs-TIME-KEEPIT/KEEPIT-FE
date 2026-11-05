import type { DEMO_TRADE_SNAPSHOTS } from '../mocks/demoScenario';

/* 대여 신청 시 대여자가 고르는 거래 방식 */
export type TradeMethod = '직거래' | '택배';

/* 신청·거래 단계. demoScenario의 공통 키를 그대로 쓰고, 거절만 추가 */
export type TradeStage = (typeof DEMO_TRADE_SNAPSHOTS)[number]['key'] | 'rejected';

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
};
