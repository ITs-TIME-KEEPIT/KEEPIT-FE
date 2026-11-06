import type { TradeStep } from '../components/common/TradeStepper';
import type { Rental } from '../types/rental';
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
export function stageBadge(rental: Rental, isOwner: boolean): { label: string; tone: 'primary' | 'gray' } {
  switch (rental.stage) {
    case 'requested':
      return { label: isOwner ? '신청 · 응답하기' : `신청 · 응답 대기 ${hoursLeft(rental)}시간`, tone: 'primary' };
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
