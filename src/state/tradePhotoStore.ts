import { useSyncExternalStore } from 'react';
import { hasRequiredPhotos, type CapturedPhotos } from '../components/camera/photoPolicy';
import { getRentalState, setRentalStage } from './rentalStore';
import type { Rental } from '../types/rental';

export type Checkpoint = 'handoff' | 'receipt' | 'return';
type PhotoRecord = { photos: CapturedPhotos; savedAt?: number };
let records: Record<string, PhotoRecord> = {};
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const getSnapshot = () => records;
export const useTradePhotos = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
export const photoRecordKey = (id: string, checkpoint: Checkpoint) => `${id}:${checkpoint}`;

export function nextPhotoCheckpoint(rental: Rental, userId: string): Checkpoint | null {
  if (rental.stage === 'accepted' && rental.ownerId === userId) return 'handoff';
  if (rental.stage === 'handed-over' && rental.borrowerId === userId) return 'receipt';
  if (rental.stage === 'received' && rental.borrowerId === userId) return 'return';
  return null;
}
function checkAccess(id: string, checkpoint: Checkpoint) {
  const { rentals, currentUserId } = getRentalState();
  const rental = rentals.find(r => r.id === id);
  if (!rental || nextPhotoCheckpoint(rental, currentUserId) !== checkpoint) throw new Error('현재 계정이나 거래 단계에서 촬영할 수 없어요.');
}
export function saveTradePhotoDraft(id: string, checkpoint: Checkpoint, photos: CapturedPhotos) {
  checkAccess(id, checkpoint);
  records = { ...records, [photoRecordKey(id, checkpoint)]: { photos: { ...photos } } };
  listeners.forEach(fn => fn());
}
export function completeTradePhotos(id: string, checkpoint: Checkpoint, photos: CapturedPhotos) {
  checkAccess(id, checkpoint);
  if (!hasRequiredPhotos(photos)) throw new Error('전면·후면·라벨 사진을 촬영해주세요.');
  records = { ...records, [photoRecordKey(id, checkpoint)]: { photos: { ...photos }, savedAt: Date.now() } };
  listeners.forEach(fn => fn());
  setRentalStage(id, checkpoint === 'handoff' ? 'handed-over' : checkpoint === 'receipt' ? 'received' : 'returned');
}
