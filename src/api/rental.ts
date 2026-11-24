import { apiGet, apiPatch, apiPost } from './client';
import { photoParts, uploadPhoto } from './clothingRegistration';
import type { CapturedPhotos, PhotoPart } from '../components/camera/PhotoCapture';
import type {
  CheckpointStage,
  MyRentalResponse,
  ReceivedRentalRequestResponse,
  RentalCheckpointResponse,
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

/* 내 거래 (MYP-601). BORROWER=빌린 옷, OWNER=빌려준 옷, 최신 신청순 */
export const getMyRentals = (role: 'BORROWER' | 'OWNER') =>
  apiGet<MyRentalResponse[]>('/api/v1/me/rentals', { role });

/* 체크포인트 사진 비교 (TRD-550) */
export const getRentalCheckpoints = (rentalId: number) =>
  apiGet<RentalCheckpointResponse>(`/api/v1/rentals/${rentalId}/checkpoints`);

const STEP_OF = { HANDOVER: 'handover', RECEIVE: 'receipt', RETURN: 'return' } as const;

// 서버가 요구하는 순서: 사진 업로드 → 단계 사진 등록 → 전달·수령·반납 처리. 다시 올리면 서버가 사진을 바꿔서 재시도해도 안전합니다
export async function submitCheckpoint(
  rentalId: number,
  stage: CheckpointStage,
  captured: CapturedPhotos,
) {
  const photos = await Promise.all(
    (Object.entries(captured) as [PhotoPart, string | undefined][])
      .filter((entry): entry is [PhotoPart, string] => !!entry[1])
      .map(async ([part, uri]) => ({
        imageId: await uploadPhoto(uri),
        photoPart: photoParts[part],
      })),
  );
  await apiPost<null>(`/api/v1/rentals/${rentalId}/checkpoints/${stage}/photos`, { photos });
  await advanceRental(rentalId, STEP_OF[stage]);
}
