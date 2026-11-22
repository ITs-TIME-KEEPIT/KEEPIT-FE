import { Platform } from 'react-native';
import { PHOTO_PARTS, type PhotoPart } from '../components/camera/photoPolicy';
import type { RegistrationDraft } from '../types/registration';
import { MEASUREMENT_LABELS, registrationErrors } from '../utils/registration';
import { apiPost } from './client';
import { findClothingRegionId } from './clothing';
import { toApiDate } from '../utils/formatDate';

const categories = { 상의: 'TOP', 하의: 'BOTTOM', 원피스: 'DRESS', 아우터: 'OUTER', 잡화: 'ACC' };
const measurementFields: Record<string, string> = {
  총장: 'totalLength',
  어깨너비: 'shoulderWidth',
  가슴단면: 'chestWidth',
  소매길이: 'sleeveLength',
  허리단면: 'waistWidth',
  엉덩이단면: 'hipWidth',
  허벅지단면: 'thighWidth',
  밑단단면: 'hemWidth',
};
const photoParts = { 전면: 'FRONT', 후면: 'BACK', 라벨: 'LABEL', 디테일: 'DETAIL' };

async function uploadPhoto(uri: string) {
  const form = new FormData();
  const png = /^data:image\/png[;,]/i.test(uri) || /\.png(?:[?#]|$)/i.test(uri);
  const filename = png ? 'clothing.png' : 'clothing.jpg';
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) throw new Error('촬영 사진 파일을 읽을 수 없어요. 사진을 다시 촬영해주세요.');
    const blob = await response.blob();
    const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/jpeg' ? 'jpg' : null;
    if (!extension) throw new Error('JPEG 또는 PNG 사진만 올릴 수 있어요.');
    form.append('file', blob, 'clothing.' + extension);
  } else {
    // React Native FormData accepts native file descriptors.
    form.append('file', {
      uri,
      name: filename,
      type: png ? 'image/png' : 'image/jpeg',
    } as unknown as Blob);
  }
  const { imageId } = await apiPost<{ imageId: number }>('/api/v1/images', form);
  if (!Number.isSafeInteger(imageId) || imageId <= 0)
    throw new Error('업로드된 사진 ID를 확인할 수 없어요.');
  return imageId;
}

export async function registerServerClothing(
  draft: RegistrationDraft,
  uploaded: Map<string, number>,
) {
  const errors = registrationErrors(draft, true);
  const { category, region } = draft;
  if (errors.length || !category || !region)
    throw new Error(errors[0] ?? '등록 정보를 확인해주세요.');
  const measurements = MEASUREMENT_LABELS[category].flatMap((label) => {
    const value = draft.measurements[label]?.trim();
    return value ? [[measurementFields[label], Number(value)] as const] : [];
  });
  if (measurements.some(([, value]) => value < 0.1))
    throw new Error('실측은 0.1cm 이상으로 입력해주세요.');

  const regionId = await findClothingRegionId(region);
  const photos = [];
  for (const part of PHOTO_PARTS) {
    const uri = draft.photos[part];
    if (!uri) continue;
    const key = part + ':' + uri;
    let imageId = uploaded.get(key);
    if (imageId === undefined) {
      imageId = await uploadPhoto(uri);
      uploaded.set(key, imageId);
    }
    photos.push({
      imageId,
      photoPart: serverPhotoPart(part, draft.hasDefect),
      sortOrder: photos.length,
    });
  }
  const { clothesId } = await apiPost<{ clothesId: number }>('/api/v1/clothes', {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: categories[category],
    size: category === '잡화' ? 'FREE' : draft.size,
    colors: draft.colors.map((color) => color.toUpperCase()),
    measurement: category === '잡화' ? undefined : Object.fromEntries(measurements),
    hasDefect: draft.hasDefect,
    defectDescription: draft.hasDefect ? draft.defectDescription.trim() : undefined,
    regionId,
    rentalFee: Number(draft.price),
    deliveryAvailable: draft.shippingAvailable,
    deliveryFee: draft.shippingAvailable ? Number(draft.shippingFee) : undefined,
    laundryBy: draft.laundryBy === 'owner' ? 'OWNER' : 'BORROWER',
    unavailablePeriods: draft.unavailable
      ? [
          {
            startDate: toApiDate(new Date(draft.unavailable.start)),
            endDate: toApiDate(new Date(draft.unavailable.end)),
          },
        ]
      : [],
    photos,
  });
  if (!Number.isSafeInteger(clothesId) || clothesId <= 0)
    throw new Error('등록 결과에서 옷 ID를 확인할 수 없어요.');
  return 'server-clothes:' + clothesId;
}

function serverPhotoPart(part: PhotoPart, hasDefect: boolean | null) {
  return part === '디테일' && hasDefect ? 'DEFECT' : photoParts[part];
}
