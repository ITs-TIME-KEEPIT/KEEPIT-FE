import type { TradeStep } from '../components/common/TradeStepper';
import type { ApiTradeMethod, Rental, RentalStatus, TradeMethod } from '../types/rental';
import { hoursLeft } from '../state/rentalStore';

// demoScenario 공통 키 -> 화면 스테퍼 단계. 거절·취소는 신청 단계에서 멈춘 것으로 표시
export const STAGE_STEP: Record<Rental['stage'], TradeStep> = {
  requested: '신청',
  accepted: '수락',
  'handed-over': '전달',
  received: '수령',
  returned: '반납',
  completed: '완료',
  rejected: '신청',
  cancelled: '신청',
};

// 내 거래 카드 상태 뱃지 문구
export function stageBadge(
  rental: Rental,
  isOwner: boolean,
): { label: string; tone: 'primary' | 'gray' } {
  switch (rental.stage) {
    case 'requested':
      return {
        label: isOwner ? '신청 · 응답하기' : `신청 · 응답 대기 ${hoursLeft(rental)}시간`,
        tone: 'primary',
      };
    case 'accepted':
      return { label: '수락 · 연락해서 약속 잡기', tone: 'primary' };
    case 'handed-over':
      return { label: '전달 완료 · 수령 대기', tone: 'primary' };
    case 'received':
      return { label: '수령 완료 · 반납 대기', tone: 'primary' };
    case 'returned':
      return { label: '반납 완료 · 확인 대기', tone: 'primary' };
    case 'completed':
      return { label: '거래 완료', tone: 'gray' };
    case 'rejected':
      return { label: '거절됨', tone: 'gray' };
    case 'cancelled':
      return { label: '거래 취소', tone: 'gray' };
  }
}

// 서버 status -> 화면 단계. 만료(48시간 무응답)와 무효(다른 신청 수락)는 수락되지 못한 신청이라 거절로 표시
export const STATUS_STAGE: Record<RentalStatus, Rental['stage']> = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  HANDED_OVER: 'handed-over',
  RECEIVED: 'received',
  RETURNED: 'returned',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  EXPIRED: 'rejected',
  INVALIDATED: 'rejected',
  CANCELED: 'cancelled',
};

export const TRADE_METHOD: Record<ApiTradeMethod, TradeMethod> = {
  DIRECT: '직거래',
  DELIVERY: '택배',
};

// expiresAt까지 남은 시간(시간 단위, 내림). 서버가 시간대 없이 주므로 기기 시간대(KST) 기준으로 읽습니다
export const hoursUntil = (expiresAt: string, now = Date.now()) =>
  Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / (60 * 60 * 1000)));
