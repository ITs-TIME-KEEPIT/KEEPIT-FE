import { useSyncExternalStore } from 'react';
import { DEMO_ACTIVE_ROLE, DEMO_IDS, DEMO_USERS } from '../mocks/demoScenario';
import type { LaundryNotice, Rental, TradeMethod, TradeStage } from '../types/rental';

// 백엔드 연동 전 앱 실행 중의 신청·거래와 현재 계정을 여러 화면에서 함께 사용합니다.
type RentalState = { currentUserId: string; rentals: Rental[] };

const initialState = (): RentalState => ({ currentUserId: DEMO_USERS[DEMO_ACTIVE_ROLE].id, rentals: [] });

let state = initialState();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {listeners.add(listener); return () => {listeners.delete(listener);};};
const getSnapshot = () => state;
const setState = (next: RentalState) => {state = next; listeners.forEach(listener => listener());};

export function useRentalState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const getRentalState = () => state;

export function createRental(input: {clothId: string; ownerId: string; start: number; end: number; method: TradeMethod}) {
  const rental: Rental = {
    ...input, id: `local-rental-${Date.now()}`, borrowerId: state.currentUserId, stage: 'requested', createdAt: Date.now(),
  };
  setState({...state, rentals: [rental, ...state.rentals]});
  return rental;
}

export function setRentalStage(id: string, stage: TradeStage, rejectReason?: string) {
  if (!state.rentals.some(rental => rental.id === id)) throw new Error('신청을 찾을 수 없어요.');
  setState({...state, rentals: state.rentals.map(rental => rental.id === id ? {...rental, stage, rejectReason} : rental)});
}

// 수락하면 같은 옷의 기간이 겹치는 다른 신청은 자동으로 무효
export function acceptRental(id: string) {
  const target = state.rentals.find(rental => rental.id === id);
  if (!target || target.stage !== 'requested') throw new Error('이미 처리된 신청이에요.');
  setState({...state, rentals: state.rentals.map(rental => {
    if (rental.id === id) return {...rental, stage: 'accepted'};
    if (rental.clothId === target.clothId && rental.stage === 'requested' && overlaps(rental, target)) {
      return {...rental, stage: 'rejected', rejectReason: '다른 신청이 먼저 수락됐어요'};
    }
    return rental;
  })});
}

const patchRental = (id: string, patch: Partial<Rental>) =>
  setState({...state, rentals: state.rentals.map(rental => rental.id === id ? {...rental, ...patch} : rental)});

export function markLaundryNoticeSeen(id: string, notice: LaundryNotice) {
  const seen = state.rentals.find(rental => rental.id === id)?.laundryNoticeSeen ?? [];
  if (!seen.includes(notice)) patchRental(id, {laundryNoticeSeen: [...seen, notice]});
}

export const markPhotosReviewed = (id: string) => patchRental(id, {photosReviewed: true});

export function completeRental(id: string) {
  const target = state.rentals.find(rental => rental.id === id);
  if (!target || target.stage !== 'returned' || target.ownerId !== state.currentUserId) throw new Error('등록자만 반납 확인 단계에서 완료할 수 있어요.');
  if (!target.photosReviewed) throw new Error('사진을 비교한 뒤 완료해주세요.');
  patchRental(id, {stage: 'completed', completedAt: Date.now()});
}

// RENT-450 수락 전: 대여자만 사유 없이. 수락 후 ~ 전달 전: 양쪽 모두 사유 필수. 전달 이후엔 취소 불가
export function cancelRental(id: string, reason?: string) {
  const target = state.rentals.find(rental => rental.id === id);
  if (target?.stage === 'requested' && target.borrowerId === state.currentUserId) return patchRental(id, {stage: 'cancelled'});
  if (target?.stage !== 'accepted' || ![target.ownerId, target.borrowerId].includes(state.currentUserId)) throw new Error('지금은 취소할 수 없어요.');
  if (!reason?.trim()) throw new Error('취소 사유를 입력해주세요.');
  patchRental(id, {stage: 'cancelled', cancelReason: reason.trim()});
}

// TRD-580 옷이 전달된 뒤 ~ 거래 완료 전까지 신고할 수 있습니다.
export function reportRental(id: string, reason: string) {
  const target = state.rentals.find(rental => rental.id === id);
  if (!target || !['handed-over', 'received', 'returned'].includes(target.stage)) throw new Error('지금은 신고할 수 없어요.');
  patchRental(id, {report: {reason, reporterId: state.currentUserId, reportedAt: Date.now()}});
}

// 시연용: 폰 한 대에서 등록자 <-> 대여자를 오갑니다 (발표 시연 후 삭제)
export function switchDemoUser() {
  setState({...state, currentUserId: state.currentUserId === DEMO_IDS.owner ? DEMO_IDS.borrower : DEMO_IDS.owner});
}

export function resetRentals() {
  setState({...initialState(), currentUserId: state.currentUserId});
}

export const findDemoUser = (id: string) => Object.values(DEMO_USERS).find(user => user.id === id);

// 48시간 안에 응답해야 하는 신청의 남은 시간 (시간 단위, 최소 0)
export const hoursLeft = (rental: Rental, now = Date.now()) =>
  Math.max(0, 48 - Math.floor((now - rental.createdAt) / (60 * 60 * 1000)));

export const overlaps = (a: Rental, b: Rental) => a.start <= b.end && b.start <= a.end;
