import { apiGet, apiPatch } from './client';
import type {
  ReceivedRentalRequestResponse,
  RejectReason,
  RentalDetailResponse,
  RentalStatus,
} from '../types/rental';

/* 받은 대여 신청 목록 (RENT-420). 최신순 */
export const getReceivedRentalRequests = (
  filter: { clothesId?: number; status?: RentalStatus } = {},
) => apiGet<ReceivedRentalRequestResponse[]>('/api/v1/me/rental-requests', filter);

/* 거래 상세 (TRD-501). 거래 당사자만 조회 가능 */
export const getRentalDetail = (rentalId: number) =>
  apiGet<RentalDetailResponse>(`/api/v1/rentals/${rentalId}`);

/* 신청 취소 (RENT-450). 수락 전, 신청자만 */
export const cancelRentalRequest = (rentalId: number) =>
  apiPatch<null>(`/api/v1/rentals/${rentalId}/cancel`);

/* 신청 수락 (RENT-430, RENT-440). 기간이 겹치는 다른 신청은 서버가 무효 처리 */
export const acceptRentalRequest = (rentalId: number) =>
  apiPatch<{ rentalId: number; invalidatedRentalIds: number[] }>(
    `/api/v1/rentals/${rentalId}/accept`,
  );

/* 신청 거절 (RENT-430). ETC면 reasonDetail 필수, 255자까지 */
export const rejectRentalRequest = (
  rentalId: number,
  body: { reason: RejectReason; reasonDetail?: string },
) => apiPatch<null>(`/api/v1/rentals/${rentalId}/reject`, body);

/* 거래 진행 (TRD-510~540). 전달, 수령, 반납, 완료 순서로 한 단계씩만 가능 */
export const advanceRental = (
  rentalId: number,
  step: 'handover' | 'receipt' | 'return' | 'complete',
) => apiPatch<null>(`/api/v1/rentals/${rentalId}/${step}`);
