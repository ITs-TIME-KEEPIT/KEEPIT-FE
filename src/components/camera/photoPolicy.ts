export const PHOTO_PARTS = ['전면', '후면', '라벨', '디테일'] as const;
export type PhotoPart = typeof PHOTO_PARTS[number];
export type CapturedPhotos = Partial<Record<PhotoPart, string>>;
export const REQUIRED_PHOTO_PARTS = ['전면', '후면', '라벨'] as const;
export const PHOTO_STEP: Record<PhotoPart, number> = {전면: 1, 후면: 2, 라벨: 3, 디테일: 3};
export const PHOTO_GUIDES: Record<PhotoPart, string> = {
  전면: '옷 전체가 테두리 안에 들어오게\n앞면을 찍어주세요',
  후면: '옷 전체가 테두리 안에 들어오게\n뒷면을 찍어주세요',
  라벨: '소재와 세탁 방법이 잘 보이게\n라벨을 찍어주세요',
  디테일: '기록하고 싶은 부분이나 하자를\n가까이에서 찍어주세요 (선택)',
};
export function hasRequiredPhotos(photos: CapturedPhotos) {
  return REQUIRED_PHOTO_PARTS.every(part => Boolean(photos[part]?.trim()));
}
