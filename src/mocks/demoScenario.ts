import type { ClothItem } from '../types/clothing';

// 프론트 공용 시연 fixture. API 응답 규격/실제 계정이 아닙니다.
// 출처: KEEPIT 중간발표 시연 시나리오 (2026-11-03 읽기 전용 확인)
// https://eschoi20030316.atlassian.net/wiki/spaces/4/pages/13729793/KEEPIT
export const DEMO_IDS = {
  owner: 'demo-user-subin', borrower: 'demo-user-jimin',
  cloth: 'lavender-dress', request: 'demo-request-lavender', trade: 'demo-trade-lavender',
} as const;

export const DEMO_USERS = {
  owner: { id:DEMO_IDS.owner, name:'한수빈', age:26, occupation:'회사원', region:{sido:'서울',district:'마포구'}, role:'owner' },
  borrower: { id:DEMO_IDS.borrower, name:'이지민', age:23, occupation:'대학생', region:{sido:'서울',district:'서대문구'}, role:'borrower' },
} as const;
export type DemoRole = keyof typeof DEMO_USERS;
// 기본 탐색은 지민. 등록 시연은 'owner'로 바꾸고 다시 실행합니다.
export const DEMO_ACTIVE_ROLE: DemoRole = 'borrower';
export const DEMO_LOGIN_MODE: 'existing' | 'new' = 'existing';
// Expo 카메라 수동 점검 때만 'camera'로 바꿉니다. 앱 등록 흐름과는 분리합니다.
export const DEMO_START_SCREEN: 'login' | 'camera' = 'login';

export const DEMO_PHOTO_SLOTS = [
  {part:'전면'}, {part:'후면'}, {part:'라벨'}, {part:'디테일'},
] satisfies NonNullable<NonNullable<ClothItem['detail']>['photos']>;
// 사진 파일/실측/정확한 택배비/연락처/가입일은 문서에 없어 값을 만들지 않습니다.
export const DEMO_CLOTH_ITEMS: ClothItem[] = [
  {
    id:DEMO_IDS.cloth, ownerId:DEMO_IDS.owner,
    title:'라벤더 쉬폰 롱원피스', category:'원피스', sourceCategory:'원피스',
    region:'마포구', size:'M', sizeLabel:'M (55)', colors:['purple'], colorLabel:'라벤더',
    originalPrice:198000, price:25000, laundryIncluded:false, shippingAvailable:true,
    detail:{
      ownerName:DEMO_USERS.owner.name,
      description:'디자이너 브랜드 원피스예요. 작년 친구 결혼식 때 한 번 입고 보관 중이에요.',
      laundry:'빌린 사람 · 드라이클리닝', photos:DEMO_PHOTO_SLOTS,
      defect:{count:1,description:'오른쪽 밑단 안쪽에 작은 올 풀림 있음'},
    },
  },
  {id:'demo-cloth-tweed',title:'아이보리 트위드 자켓',category:'상의',sourceCategory:'상의',region:'성동구',size:'S',colors:['white'],colorLabel:'아이보리',originalPrice:239000,price:28000,laundryIncluded:false,shippingAvailable:false},
  {id:'demo-cloth-slacks',title:'블랙 와이드 슬랙스',category:'하의',sourceCategory:'하의',region:'수원시',size:'M',colors:['black'],originalPrice:79000,price:9000,laundryIncluded:false,shippingAvailable:false},
  // 기획 원문 '치마'는 기존 디자인의 '하의' 필터에 연결. 원문 값 보존.
  {id:'demo-cloth-skirt',title:'네이비 플리츠 미디스커트',category:'하의',sourceCategory:'치마',region:'부천시',size:'L',colors:['navy'],originalPrice:99000,price:12000,laundryIncluded:false,shippingAvailable:false},
  {id:'demo-cloth-beige',title:'베이지 셋업 원피스',category:'원피스',sourceCategory:'원피스',region:'강남구',size:'S',colors:['beige'],originalPrice:259000,price:30000,laundryIncluded:false,shippingAvailable:false},
  {id:'demo-cloth-blouse',title:'화이트 블라우스',category:'상의',sourceCategory:'상의',region:'연수구',size:'FREE',colors:['white'],originalPrice:69000,price:8000,laundryIncluded:false,shippingAvailable:false},
];

// B 담당 화면에서 동일 ID를 쓰기 위한 자료. 상태 전환/서버를 구현하지 않습니다.
export const DEMO_RENTAL_REQUEST = {
  id:DEMO_IDS.request, clothId:DEMO_IDS.cloth, ownerId:DEMO_IDS.owner, borrowerId:DEMO_IDS.borrower,
  receiveDate:'2026-11-13', returnDate:'2026-11-15', eventDate:'2026-11-14',
  method:'direct', meetingPlace:'2호선 합정역', meetingAt:'2026-11-13T19:00:00+09:00',
  rentalFee:25000, shippingFee:0, laundryBy:'borrower', laundryMethod:'dry-cleaning',
} as const;

export const DEMO_TRADE = {
  id:DEMO_IDS.trade, requestId:DEMO_IDS.request, clothId:DEMO_IDS.cloth,
  ownerId:DEMO_IDS.owner, borrowerId:DEMO_IDS.borrower,
  receiveDate:DEMO_RENTAL_REQUEST.receiveDate, returnDate:DEMO_RENTAL_REQUEST.returnDate,
  method:DEMO_RENTAL_REQUEST.method, meetingPlace:DEMO_RENTAL_REQUEST.meetingPlace,
} as const;

// 같은 거래의 각 시점. 여러 거래로 한 목록에 동시에 표시하지 않습니다.
export const DEMO_TRADE_SNAPSHOTS = [
  {key:'requested',label:'신청 대기',requestStatus:'pending',tradeStage:null,completedCheckpoints:['registration']},
  {key:'accepted',label:'수락 · 전달 준비',requestStatus:'accepted',tradeStage:'handoff',completedCheckpoints:['registration']},
  {key:'handed-over',label:'전달 완료 · 수령 대기',requestStatus:'accepted',tradeStage:'receipt',completedCheckpoints:['registration','handoff']},
  {key:'received',label:'수령 완료 · 반납 대기',requestStatus:'accepted',tradeStage:'return',completedCheckpoints:['registration','handoff','receipt']},
  {key:'returned',label:'반납 완료 · 등록자 확인 대기',requestStatus:'accepted',tradeStage:'confirmation',completedCheckpoints:['registration','handoff','receipt','return']},
  {key:'completed',label:'거래 완료',requestStatus:'accepted',tradeStage:'completed',completedCheckpoints:['registration','handoff','receipt','return']},
] as const;

export const DEMO_CHECKPOINTS = [
  {key:'registration',label:'등록 시',actorId:DEMO_IDS.owner,parts:['전면','후면','라벨','디테일']},
  {key:'handoff',label:'전달 직전',actorId:DEMO_IDS.owner,parts:['전면','후면']},
  {key:'receipt',label:'수령 시',actorId:DEMO_IDS.borrower,parts:[]},
  {key:'return',label:'반납 시',actorId:DEMO_IDS.borrower,parts:[],laundryCompleted:true},
] as const;
// parts는 문서 예시이며 필수 촬영 장수 정책이 아닙니다. 미기재 부위는 빈 배열.
// 촬영 시각과 URI는 서버 기록으로 가장하지 않도록 비워 두었습니다.
