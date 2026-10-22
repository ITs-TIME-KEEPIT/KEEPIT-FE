# KEEPIT Frontend

한 번 입을 옷, 사지 말고 빌려 입자 — C2C 의류 대여 서비스의 React Native 앱입니다.

## 기술 및 범위

- React Native + Expo + TypeScript
- 하나의 코드베이스로 Android / iOS 개발
- 중간평가 전: Figma를 바탕으로 페이지별 UI 틀 우선 구현
- 중간평가 이후: API 연결과 실제 기능 구현
- 이 저장소는 프론트엔드 전용이며, 백엔드는 추후 합의한 API 명세로 연동합니다.

## 시작하기

Node.js LTS와 npm 설치 후 저장소 루트에서 실행합니다.

```bash
npm install
npm start
```

Expo Go에서 QR 코드를 열어 확인합니다.

타입 검사는 다음 명령어로 진행합니다.

```bash
npm run typecheck
```

해당 npm 스크립트가 없는 경우 아래 명령어로 확인합니다.

```bash
npx tsc --noEmit
```

- 패키지 설치 시 `package-lock.json`을 함께 관리합니다.
- 화면 이동은 React Navigation 기반으로 구성합니다.
- 현재 로그인 인증이나 백엔드 연동은 구현되지 않았습니다.

## 폴더 구조

```text
KEEPIT-FE/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── assets/
│   ├── fonts/
│   │   └── Pretendard-*.otf
│   └── icons/
│       └── *.png
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── clothing/
│   │   │   ├── ClothCard.tsx
│   │   │   ├── ColorChip.tsx
│   │   │   └── ColorChipGroup.tsx
│   │   └── bottomsheet/
│   │       ├── BottomSheet.tsx
│   │       ├── FilterSheet.tsx
│   │       ├── RegionSheet.tsx
│   │       ├── DateRangeSheet.tsx
│   │       └── filter/
│   │           ├── PriceTab.tsx
│   │           ├── SizeTab.tsx
│   │           ├── ColorTab.tsx
│   │           └── RangeSlider.tsx
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── clothing.ts
│   │   └── regions.ts
│   │
│   ├── types/
│   │   ├── clothing.ts
│   │   └── filter.ts
│   │
│   ├── mocks/
│   │   └── clothItems.ts
│   │
│   ├── utils/
│   │   └── filterClothItems.ts
│   │
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   │
│   └── screens/
│       ├── Auth/
│       │   ├── LoginScreen.tsx
│       │   ├── SignupScreen.tsx
│       │   └── ProfileSetupScreen.tsx
│       └── Home/
│           └── HomeScreen.tsx
│
├── App.tsx
├── app.json
├── package.json
├── package-lock.json
└── README.md
```

폴더별 역할:

- `components/common/`: 버튼, 입력창, 체크박스, 기간 선택 달력(`DateRangeCalendar`) 등 공통 UI
- `components/clothing/`: 의류 관련 공통 UI (옷 카드, 컬러칩)
- `components/bottomsheet/`: 바텀시트 공통 틀과 화면별 시트 (상세 필터, 지역 선택, 날짜 선택)
  - `filter/`: 홈 상세 필터 시트 전용 탭·슬라이더
- `constants/`: 디자인 컬러, 옷 카테고리·사이즈·컬러 목록, 지역 목록 등 공통 상수
- `types/`: 공통 TypeScript 타입
- `mocks/`: 백엔드 연동 전 UI 확인용 임시 데이터
- `utils/`: 공통 함수 (필터링 등)
- `navigation/`: 화면 이동 및 네비게이션
- `screens/`: 실제 페이지 단위 화면
- `assets/fonts/`: Pretendard 폰트 파일
- `assets/icons/`: Figma 아이콘 에셋

현재 사용하지 않는 폴더는 미리 만들지 않습니다. 검색·대여·마이페이지, API 통신, 공통 훅 등은 해당 작업을 시작할 때 추가합니다.

빈 폴더에 있는 `.gitkeep`은 Git에서 폴더 구조를 유지하기 위한 파일입니다.

## 디자인 시스템

공통 UI는 디자인팀 Figma를 기준으로 구현합니다.

페이지별로 동일한 버튼이나 입력창을 새로 만드는 대신, 기존 공통 컴포넌트를 재사용하는 것을 원칙으로 합니다.

### 1. 컬러 토큰

경로: `src/constants/colors.ts`

Figma에서 확인된 주요 컬러:

| Figma Token | HEX |
|---|---|
| primary | #5AA9E6 |
| primary-light | #EAF4FC |
| white | #FFFFFF |
| text | #1F2937 |
| text-sub | #6B7280 |
| text-placeholder | #9CA3AF |
| bg-gray | #F3F4F6 |
| border | #D1D5DB |
| line | #E5E7EB |
| alert | #EF4444 |
| danger-bg | #FCA5A5 |
| danger-text | #7F1D1D |

컴포넌트 작성 시 HEX 값을 직접 반복해서 작성하지 않고 `colors.ts`의 컬러 토큰을 import하여 사용합니다.

실제 TypeScript 속성명은 `colors.ts`에 정의된 이름을 따릅니다.

새로운 색상이 필요할 경우 기존 토큰에 동일한 색상이 있는지 먼저 확인하고, 없는 경우 Figma 디자인을 확인한 뒤 추가합니다.

### 2. 폰트 설정

사용 폰트: Pretendard

폰트 파일 경로: `assets/fonts/`

현재 준비된 폰트:

- Pretendard-Thin
- Pretendard-ExtraLight
- Pretendard-Light
- Pretendard-Regular
- Pretendard-Medium
- Pretendard-SemiBold
- Pretendard-Bold
- Pretendard-ExtraBold
- Pretendard-Black

`App.tsx`에서 `expo-font`의 `useFonts`를 사용해 폰트를 공통으로 로딩합니다.

개별 컴포넌트를 추가할 때마다 `App.tsx`에 같은 폰트를 중복 등록할 필요는 없습니다.

각 컴포넌트에서는 Figma의 Weight 값에 맞는 `fontFamily`를 지정합니다.

| Weight | Font |
|---|---|
| 400 | Pretendard-Regular |
| 500 | Pretendard-Medium |
| 600 | Pretendard-SemiBold |
| 700 | Pretendard-Bold |
| 800 | Pretendard-ExtraBold |

그 외 굵기도 필요한 경우 App.tsx에 등록된 fontFamily 이름을 사용합니다.

### 3. 공통 컴포넌트

경로: `src/components/common/`

Figma Variant를 기준으로 컴포넌트를 분리하여 관리합니다.

**Button**

- Default / DefaultActive
- Primary / Secondary
- Danger
- Chip / ChipActive
- CTA / CTA Secondary / CTA Disabled

**Input**

- TextInputField
- AreaInputField
- SelectInputField
- SearchInputField
- Check / CheckOn
- Radio / RadioOn
- Toggle / ToggleOn

**Image**

- SquareImage
- RoundImage

컴포넌트 파일명은 PascalCase를 사용합니다.

Figma Variant 명칭과 컴포넌트 파일명을 최대한 일관되게 관리합니다.

화면 개발 시 기존 공통 컴포넌트를 우선 import하여 사용합니다.

단, 실제 사용 가능한 컴포넌트와 Props는 해당 TSX 파일의 export 및 타입 정의를 기준으로 확인합니다.

### 4. 아이콘 관리

Figma 디자인 시스템의 Icon을 기준으로 사용합니다.

- 아이콘의 크기와 형태는 Figma 속성을 따릅니다.
- 동일한 아이콘을 화면별로 중복 생성하지 않습니다.
- 아이콘 에셋은 투명 배경과 실제 크기를 확인합니다.
- 아이콘 색상은 가능한 기존 컬러 토큰과 일치하도록 관리합니다.
- 아이콘 경로 및 파일명은 실제 저장소에 추가된 에셋을 기준으로 합니다.

### 5. 컴포넌트 개발 규칙

1. 공통 컴포넌트는 `src/components/common/`에서 관리합니다.
2. Figma의 크기, Radius, Padding, Border, Typography를 확인하여 구현합니다.
3. 기존 공통 컴포넌트와 중복되는 파일은 새로 만들지 않습니다.
4. 컴포넌트 수정 시 사용 중인 다른 화면에 영향이 없는지 확인합니다.
5. 공통 디자인 수정 사항은 PR에 명시합니다.
6. 새 컬러 토큰과 폰트가 필요한 경우 기존 설정을 먼저 확인합니다.

## 화면 개발 및 작업 인계

현재 공통 UI 컴포넌트와 디자인 시스템을 우선 구성하고 있습니다.

화면 개발은 공통 컴포넌트를 재사용하는 방식으로 진행합니다.

### 화면별 작업

| 화면 | 작업 내용 |
|---|---|
| 로그인 | Figma 기반 UI 및 프로필 설정 화면 이동 |
| 프로필 설정 | 닉네임, 휴대폰 번호 등 프로필 정보 입력 UI |
| 홈 | Figma 기반 홈 화면 UI |

로그인/프로필 설정 화면은 공통 컴포넌트 작업 완료 후 이어서 진행합니다.

기존 `LoginScreen.tsx`, `SignupScreen.tsx`, `HomeScreen.tsx`는 실제 구현 상태를 확인한 후 수정합니다.

### 화면 구현 시 확인 사항

- 공통 컴포넌트 재사용 여부
- Figma와 화면 크기 및 간격 비교
- 폰트와 컬러 토큰 적용 여부
- Android / iOS 화면 확인
- 화면 이동 동작 확인
- TypeScript 오류 여부

백엔드 연동 전에는 UI 동작 확인용 임시 데이터를 사용합니다.

## GitHub 템플릿

- `.github/ISSUE_TEMPLATE/ISSUE_TEMPLATE.md`: UI·기능·오류 수정 등 모든 프론트 작업에 사용하는 공통 이슈 양식
- `.github/PULL_REQUEST_TEMPLATE.md`: 변경 사항·실행 결과·Figma 비교
- Issue/PR 템플릿이 GitHub 작성 화면에 표시되려면 기본 브랜치에도 해당 파일이 반영되어야 합니다.

## Git 협업 규칙

1. Issue 생성 → `develop` 최신화 → 작업 브랜치 생성 → 작업·테스트 → PR → 리뷰 후 `develop` 병합.
2. `main`은 평가·발표용 안정 버전이며 직접 작업하지 않습니다. `develop`은 통합 브랜치이며 직접 push하지 않습니다.
3. 브랜치는 `feat/3-home-page`, `fix/7-login-error`, `chore/1-project-setup`처럼 **유형/이슈번호-작업명**을 사용합니다. 중간평가 전에는 페이지 단위, 이후에는 기능 단위로 구분합니다.
4. PR은 `develop` 대상으로 생성하고, 리뷰 후 병합합니다. 병합된 작업 브랜치는 정리합니다.
5. 커밋/PR 제목 형식: `[#이슈번호] 유형 : 한글 작업 요약` (예: `[#3] feat : 홈 화면 UI 구현`). 유형: `feat`, `fix`, `style`, `docs`, `refactor`, `chore`, `deps`.
6. UI 작업 시 Figma 링크와 전후 화면 캡처를 PR에 첨부합니다. 공통 컴포넌트 변경은 다른 화면에 미치는 영향도 확인합니다.

### 공통 컴포넌트 작업 PR

공통 컴포넌트 또는 디자인 시스템 관련 PR 작성 시 다음 항목을 함께 기록합니다.

- 구현 및 수정한 컴포넌트 목록
- 추가하거나 수정한 컬러 토큰
- 폰트 및 아이콘 에셋 변경 사항
- Figma와 비교한 결과
- 화면 동작 및 타입 검사 결과
- 다른 프론트 팀원이 이어서 진행해야 할 작업

## 개발 시 유의사항

- 패키지 변경 시 `package.json`과 `package-lock.json`을 함께 반영합니다.
- `node_modules`, `.expo`, `.env` 및 개인 비밀값은 커밋하지 않습니다.
- 백엔드가 준비되기 전에는 임시 데이터로 UI를 구현하고, 데이터 필드·인증·이미지 업로드 방식은 백엔드 팀과 합의 후 연결합니다.
- 실제 화면 배치, 색상과 메뉴 구성은 디자인팀 Figma를 기준으로 합니다.
- 공통 컴포넌트는 다른 팀원과 공유되는 코드이므로 임의로 삭제하거나 이름을 변경하지 않습니다.
- 공통 컴포넌트 및 디자인 토큰 변경 사항은 PR을 통해 공유합니다.
