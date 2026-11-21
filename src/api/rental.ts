import { apiGet, TEMP_USER_ID } from './client';
import type {
  ReceivedRentalRequestResponse,
  RentalDetailResponse,
  RentalStatus,
} from '../types/rental';

/* 받은 대여 신청 목록 (RENT-420). 최신순 */
export const getReceivedRentalRequests = (
  filter: { clothesId?: number; status?: RentalStatus } = {},
) => apiGet<ReceivedRentalRequestResponse[]>('/api/v1/me/rental-requests', filter);

/* 거래 상세 (TRD-501). 거래 당사자만 조회 가능 */
export const getRentalDetail = (rentalId: number, viewerId = TEMP_USER_ID) =>
  apiGet<RentalDetailResponse>(`/api/v1/rentals/${rentalId}`, { viewerId });
