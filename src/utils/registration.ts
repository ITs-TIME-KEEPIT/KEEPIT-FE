import { DEMO_CLOTH_ITEMS, DEMO_IDS, DEMO_USERS } from '../mocks/demoScenario';
import { hasRequiredPhotos, PHOTO_PARTS } from '../components/camera/photoPolicy';
import { REGIONS } from '../constants/regions';
import type { RegistrationDraft } from '../types/registration';
import type { ClothItem } from '../types/clothing';

export const MEASUREMENT_LABELS = {
  상의: ['총장', '어깨너비', '가슴단면', '소매길이'],
  하의: ['총장', '허리단면', '엉덩이단면', '허벅지단면', '밑단단면'],
  원피스: ['총장', '어깨너비', '가슴단면', '허리단면'],
  아우터: ['총장', '어깨너비', '가슴단면', '소매길이'],
  잡화: [],
} as const;
export function createRegistrationDraft(): RegistrationDraft {
  return {id:`local-cloth-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,photos:{},title:'',category:null,size:null,colors:[],measurements:{},hasDefect:null,defectDescription:'',description:'',region:null,unavailable:null,unavailableConfirmed:false,price:'',shippingAvailable:false,shippingFee:'',laundryBy:'borrower'};
}
export function fillScenario(draft: RegistrationDraft): RegistrationDraft {
  const item = DEMO_CLOTH_ITEMS.find(item => item.id === DEMO_IDS.cloth)!;
  return {...draft,title:item.title,category:item.category,size:item.size,colors:[...item.colors],
    description:item.detail?.description ?? '',region:{...DEMO_USERS.owner.region},price:String(item.price),
    hasDefect:true,defectDescription:item.detail?.defect?.description ?? '',laundryBy:'borrower',
    // 아래는 기획 문서 원문이 아닌 프론트 입력 시연용 보완값입니다.
    measurements:{총장:'118',어깨너비:'36',가슴단면:'44',허리단면:'35'},
    unavailable:null,unavailableConfirmed:true,shippingAvailable:item.shippingAvailable,shippingFee:'3500'};
}
const positive = (value: string) => /^\d+(\.\d{1,2})?$/.test(value.trim()) && Number(value) > 0 && Number(value) <= 999;
const money = (value: string, allowZero = false) => /^\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value)) && Number(value) >= (allowZero ? 0 : 1) && Number(value) <= 10000000;
export function registrationErrors(d: RegistrationDraft): string[] {
  const errors: string[] = [];
  if (!hasRequiredPhotos(d.photos)) errors.push('전면·후면·라벨 사진을 촬영해주세요.');
  if (d.title.trim().length < 2 || d.title.trim().length > 30) errors.push('제목은 2~30자로 입력해주세요.');
  if (!d.category) errors.push('카테고리를 선택해주세요.');
  if (d.category !== '잡화' && !d.size) errors.push('표기 사이즈를 선택해주세요.');
  if (d.colors.length < 1 || d.colors.length > 2) errors.push('컬러는 1~2개 선택해주세요.');
  if (d.category && d.category !== '잡화') {
    if (!positive(d.measurements.총장 ?? '')) errors.push('총장을 0보다 큰 숫자로 입력해주세요.');
    if (MEASUREMENT_LABELS[d.category].some(label => d.measurements[label]?.trim() && !positive(d.measurements[label]))) errors.push('실측은 999cm 이하의 양수로 입력해주세요.');
  }
  if (d.hasDefect === null) errors.push('하자 여부를 선택해주세요.');
  if (d.hasDefect && !d.defectDescription.trim()) errors.push('하자 설명을 입력해주세요.');
  if (!d.region || !REGIONS[d.region.sido].some(district => district === d.region?.district)) errors.push('거래 가능 지역을 선택해주세요.');
  if (!d.unavailableConfirmed) errors.push('대여 불가능 기간을 정하거나 없음을 선택해주세요.');
  if (d.unavailable && (!Number.isFinite(d.unavailable.start) || !Number.isFinite(d.unavailable.end) || d.unavailable.start > d.unavailable.end)) errors.push('대여 불가능 기간을 확인해주세요.');
  if (!money(d.price)) errors.push('대여료를 1~10,000,000원으로 입력해주세요.');
  if (d.shippingAvailable && !money(d.shippingFee,true)) errors.push('택배비를 0~10,000,000원으로 입력해주세요.');
  return errors;
}
export function buildRegisteredCloth(d: RegistrationDraft): ClothItem {
  const errors = registrationErrors(d);
  if (errors.length || !d.category || !d.region) throw new Error(errors[0] ?? '등록 정보를 확인해주세요.');
  const photos = PHOTO_PARTS.flatMap(part => d.photos[part] ? [{part,uri:d.photos[part]!}] : []);
  return {id:d.id,title:d.title.trim(),ownerId:DEMO_IDS.owner,category:d.category,size:d.category === '잡화' ? 'FREE' : d.size!,colors:[...d.colors],region:d.region.district,
    price:Number(d.price),shippingAvailable:d.shippingAvailable,laundryIncluded:d.laundryBy === 'owner',imageUrl:d.photos.전면,
    detail:{ownerName:DEMO_USERS.owner.name,postedLabel:'방금 전',description:d.description.trim(),photos,
      shippingFee:d.shippingAvailable ? Number(d.shippingFee) : undefined,laundry:d.laundryBy === 'owner' ? '등록자가 직접 세탁 · 대여료에 포함' : '빌린 사람이 세탁 후 반납',
      measurements:d.category === '잡화' ? undefined : Object.fromEntries(MEASUREMENT_LABELS[d.category].filter(label => d.measurements[label]?.trim()).map(label => [label,Number(d.measurements[label])])),
      region:{...d.region},unavailablePeriod:d.unavailable ?? undefined,
      defect:d.hasDefect ? {count:1,description:d.defectDescription.trim(),photoUris:d.photos.디테일 ? [d.photos.디테일] : []} : undefined}};
}
