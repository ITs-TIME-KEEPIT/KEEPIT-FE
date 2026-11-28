import { useEffect, useState } from 'react';
import { API_DEMO_MODE } from '../constants/demoMode';
import { getRentalState } from '../state/rentalStore';
import { apiGet } from './client';
import { MOCK_CLOTH_ITEMS } from '../mocks/clothItems';
import { useClothingItems } from '../state/clothingStore';
import type { ClothItem } from '../types/clothing';
import type { Region, Sido } from '../constants/regions';
import type { ColorKey, Size } from '../constants/clothing';

const categories = {
  TOP: '상의',
  BOTTOM: '하의',
  DRESS: '원피스',
  OUTER: '아우터',
  ACC: '잡화',
} as const;

const measurementLabels = {
  totalLength: '총장',
  shoulderWidth: '어깨너비',
  chestWidth: '가슴단면',
  sleeveLength: '소매길이',
  waistWidth: '허리단면',
  hipWidth: '엉덩이단면',
  thighWidth: '허벅지단면',
  hemWidth: '밑단단면',
} as const;

type Card = {
  clothesId: number;
  thumbnailUrl?: string;
  title: string;
  category: keyof typeof categories;
  size: Size;
  region: { regionId: number; sido: string; sigungu: string };
  rentalFee: number;
  laundryBy: 'BORROWER' | 'OWNER';
  deliveryAvailable: boolean;
  createdAt?: string;
};

type Detail = Omit<Card, 'thumbnailUrl'> & {
  status: 'AVAILABLE' | 'PAUSED';
  description?: string;
  measurement?: Partial<Record<keyof typeof measurementLabels, number | null>>;
  colors?: Uppercase<ColorKey>[];
  hasDefect: boolean;
  defectDescription?: string;
  deliveryFee?: number | null;
  laundryMethod?: 'DRY_CLEAN' | 'DISCUSS';
  unavailablePeriods?: { startDate: string; endDate: string }[];
  photos?: {
    photoPart: 'FRONT' | 'BACK' | 'LABEL' | 'DETAIL' | 'DEFECT';
    sortOrder: number;
    imageUrl: string;
  }[];
  owner: { nickname: string };
};

type Availability = {
  from: string;
  to: string;
  rentable: boolean;
  deliveryAvailable: boolean;
  maxRentalDays: number;
  directUnavailableDates: { date: string }[];
  deliveryUnavailableDates: { date: string }[];
};

export const serverClothesId = (id: string) => /^server-clothes:([1-9]\d*)$/.exec(id)?.[1];

const provinceAliases: Record<Sido, string[]> = {
  서울: ['서울', '서울시', '서울특별시'],
  경기: ['경기', '경기도'],
  인천: ['인천', '인천시', '인천광역시'],
};
const regionIds = new Map<string, Set<number>>();

function rememberRegion(region: Card['region']) {
  const sido = (Object.keys(provinceAliases) as Sido[]).find((key) =>
    provinceAliases[key].includes(region.sido),
  );
  if (!sido || !Number.isSafeInteger(region.regionId) || region.regionId <= 0) return;
  const key = sido + '/' + region.sigungu;
  const ids = regionIds.get(key) ?? new Set<number>();
  ids.add(region.regionId);
  regionIds.set(key, ids);
}

export async function findClothingRegionId(region: NonNullable<Region>) {
  const key = region.sido + '/' + region.district;
  const config = process.env.EXPO_PUBLIC_CLOTHING_REGION_IDS;
  if (config) {
    let configured: unknown;
    try {
      configured = (JSON.parse(config) as Record<string, unknown>)?.[key];
    } catch {
      throw new Error('서버 지역 ID 설정이 올바른 JSON이 아니에요.');
    }
    if (
      typeof configured === 'number' &&
      Number.isSafeInteger(configured) &&
      configured > 0 &&
      configured <= 2147483647
    ) {
      return configured;
    }
  }
  if (!regionIds.has(key)) await (catalogRequest ?? getCatalog());
  const ids = regionIds.get(key);
  if (ids?.size === 1) return [...ids][0];
  throw new Error('선택한 지역의 서버 ID를 확인할 수 없어요. 서버 지역 ID 목록을 확인해주세요.');
}

function toCard(card: Card): ClothItem {
  return {
    id: 'server-clothes:' + card.clothesId,
    title: card.title,
    region: card.region.sigungu,
    category: categories[card.category],
    size: card.size,
    colors: [],
    price: card.rentalFee,
    laundryIncluded: card.laundryBy === 'OWNER',
    shippingAvailable: card.deliveryAvailable,
    imageUrl: card.thumbnailUrl || undefined,
    detail: {
      ownerName: '',
      postedLabel: card.createdAt?.slice(0, 10),
      region: { sido: card.region.sido, district: card.region.sigungu },
    },
  };
}

async function getCatalog() {
  const demoUserId = API_DEMO_MODE ? getRentalState().currentUserId : undefined;
  const items = new Map<string, ClothItem>();
  // Swagger 기준 cursor 방식: 처음엔 cursor 없이, 다음 묶음은 응답의 nextCursor로 요청합니다
  let cursor: number | undefined;
  let hasNext: boolean;
  do {
    const result = await apiGet<{ content: Card[]; nextCursor?: number; hasNext: boolean }>(
      '/api/v1/clothes',
      { cursor, size: 50 },
    );
    if (demoUserId && demoUserId !== getRentalState().currentUserId) return [];
    if (result.hasNext && (!result.content.length || result.nextCursor === undefined)) {
      throw new Error('옷 목록 페이지 정보가 올바르지 않습니다.');
    }
    for (const card of result.content) {
      rememberRegion(card.region);
      const item = toCard(card);
      if (!items.has(item.id)) items.set(item.id, item);
    }
    cursor = result.nextCursor;
    hasNext = result.hasNext;
  } while (hasNext);
  return [...items.values()];
}

let catalogRequest: Promise<ClothItem[]> | undefined;

const mockIds = new Set(MOCK_CLOTH_ITEMS.map((item) => item.id));

export function useClothingCatalog() {
  const local = useClothingItems();
  const [catalog, setCatalog] = useState<ClothItem[]>();
  const [catalogError, setCatalogError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const request = API_DEMO_MODE
      ? getCatalog()
      : (catalogRequest ??= getCatalog().finally(() => {
          catalogRequest = undefined;
        }));
    request.then(
      (items) => {
        if (active) setCatalog(items);
      },
      () => {
        if (active) setCatalogError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const items = API_DEMO_MODE ? catalog ?? [] : catalog ? [...local.filter((item) => !mockIds.has(item.id)), ...catalog] : local;
  return {
    items,
    catalog,
    catalogError,
    retryCatalog: () => {
      setCatalogError(false);
      setAttempt((value) => value + 1);
    },
  };
}

export async function getClothingDetail(id: string): Promise<ClothItem> {
  const clothing = await apiGet<Detail>('/api/v1/clothes/' + id);
  const card = toCard(clothing);
  const photos = [...(clothing.photos ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const defectPhotos = photos.filter((photo) => photo.photoPart === 'DEFECT');
  const measurements: Record<string, number> = {};
  for (const [field, label] of Object.entries(measurementLabels)) {
    const value = clothing.measurement?.[field as keyof typeof measurementLabels];
    if (typeof value === 'number') measurements[label] = value;
  }

  return {
    ...card,
    colors: (clothing.colors ?? []).map((color) => color.toLowerCase() as ColorKey),
    hidden: clothing.status === 'PAUSED',
    detail: {
      ...card.detail,
      ownerName: clothing.owner.nickname,
      description: clothing.description,
      shippingFee: clothing.deliveryFee ?? undefined,
      laundry:
        clothing.laundryBy === 'OWNER'
          ? '등록자 세탁'
          : clothing.laundryMethod === 'DRY_CLEAN'
            ? '대여자 드라이클리닝'
            : '대여자 세탁 · 협의',
      measurements,
      unavailablePeriods: clothing.unavailablePeriods ?? [],
      photoUris: photos
        .filter((photo) => photo.photoPart !== 'DEFECT')
        .map((photo) => photo.imageUrl),
      defect: clothing.hasDefect
        ? {
            description: clothing.defectDescription ?? '',
            photoUris: defectPhotos.map((photo) => photo.imageUrl),
          }
        : undefined,
    },
  };
}

export const getClothingAvailability = (id: string, range?: { from: string; to: string }) =>
  apiGet<Availability>('/api/v1/clothes/' + id + '/availability', range);

export function useServerClothing(id: string | undefined, loadSchedule = true) {
  const [detail, setDetail] = useState<{ id: string; item?: ClothItem }>();
  const [availability, setAvailability] = useState<{ id: string; data?: Availability }>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getClothingDetail(id).then(
      (item) => {
        if (active) setDetail({ id, item });
      },
      () => {
        if (active) setDetail({ id });
      },
    );
    if (loadSchedule)
      getClothingAvailability(id).then(
        (data) => {
          if (active) setAvailability({ id, data });
        },
        () => {
          if (active) setAvailability({ id });
        },
      );
    return () => {
      active = false;
    };
  }, [id, attempt, loadSchedule]);

  const current = detail?.id === id ? detail : undefined;
  const schedule = availability?.id === id ? availability : undefined;
  return {
    item: current?.item,
    detailError: !!current && !current.item,
    schedule: schedule?.data,
    scheduleError: !!schedule && !schedule.data,
    retry: () => {
      setDetail(undefined);
      setAvailability(undefined);
      setAttempt((value) => value + 1);
    },
  };
}
