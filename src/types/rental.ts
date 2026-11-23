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

/* ---- 서버 응답 (Swagger 기준) ---- */

export type RentalStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'HANDED_OVER'
  | 'RECEIVED'
  | 'RETURNED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'INVALIDATED'
  | 'CANCELED';

export type ApiTradeMethod = 'DIRECT' | 'DELIVERY';

export type RejectReason = 'OWNER_USE' | 'BAD_CONDITION' | 'TOO_FAR' | 'ETC';

export type RentalActor = 'BORROWER' | 'OWNER' | 'ADMIN' | 'SYSTEM';

export type RentalNextAction =
  'WAIT_RESPONSE' | 'HANDOVER' | 'RECEIVE' | 'RETURN' | 'COMPLETE' | 'NONE';

// 날짜는 서버 문자열 그대로 둡니다. date는 'YYYY-MM-DD', date-time은 시간대 없는 'YYYY-MM-DDTHH:mm:ss'
export type ReceivedRentalRequestResponse = {
  rentalId: number;
  status: RentalStatus;
  clothingId: number;
  clothingTitle: string;
  borrowerId: number;
  borrowerNickname: string;
  borrowerProfileImageKey: string | null;
  startDate: string;
  endDate: string;
  tradeMethod: ApiTradeMethod;
  requestedAt: string;
  expiresAt: string; // 응답 기한 (신청 + 48시간)
};

export type RentalDetailResponse = {
  rentalId: number;
  status: RentalStatus;
  nextAction: RentalNextAction;
  nextActionBy: RentalActor | null; // nextAction이 NONE이면 null
  viewerRole: RentalActor;
  clothingId: number;
  clothingTitle: string;
  ownerId: number;
  ownerNickname: string;
  borrowerId: number;
  borrowerNickname: string;
  startDate: string;
  endDate: string;
  tradeMethod: ApiTradeMethod;
  rentalFee: number;
  deliveryFee: number | null; // 직거래면 null
  laundryBy: 'BORROWER' | 'OWNER';
  laundryMethod: 'DRY_CLEAN' | 'DISCUSS';
  rejectReason?: RejectReason;
  rejectReasonDetail?: string;
  cancelReason?: string;
  canceledBy?: RentalActor;
  requestedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  handedOverAt?: string;
  receivedAt?: string;
  returnedAt?: string;
  completedAt?: string;
};
