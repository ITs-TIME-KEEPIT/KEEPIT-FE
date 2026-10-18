# KEEPIT Frontend

한 번 입을 옷, 사지 말고 빌려 입자 — C2C 의류 대여 서비스의 React Native 앱입니다.

## 기술 및 범위
- React Native + Expo + TypeScript
- 하나의 코드베이스로 Android / iOS 개발
- 중간평가 전: Figma를 바탕으로 페이지별 UI 틀 우선 구현
- 중간평가 이후: API 연결과 실제 기능 구현
- 이 저장소는 프론트엔드 전용이며, 백엔드는 추후 합의한 API 명세로 연동합니다.

## 시작하기
Node.js LTS와 npm 설치 후 저장소 루트에서:

```bash
npm install
npm start
```

Expo Go에서 QR 코드를 열어 확인합니다. 타입 검사는 `npm run typecheck`입니다. 최초 설치 시 `package-lock.json`이 생성되면 함께 커밋합니다. 현재 ZIP에는 설치된 패키지와 lockfile이 포함되지 않습니다. 화면 이동은 현재 로그인 → 회원가입/홈의 최소 구조로만 연결되어 있으며 **로그인 인증이나 백엔드 연동은 아직 없습니다.**

## 폴더 구조
```text
.github/                 GitHub Issue/PR 템플릿
assets/                  추후 추가할 이미지·폰트
src/components/common/   공통 UI 컴포넌트
src/components/clothing/ 의류 관련 공통 UI
src/screens/Auth/        로그인·회원가입 임시 화면
src/screens/Home/        홈 임시 화면
src/navigation/          최소 화면 이동 구조
```
현재 사용하지 않는 폴더는 미리 만들지 않습니다. 검색·대여·마이페이지, API 통신, 공통 타입·훅·유틸리티 등은 해당 작업을 시작할 때 추가합니다. 빈 폴더에 있는 `.gitkeep`은 Git에서 폴더 구조를 유지하기 위한 파일입니다.

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

## 개발 시 유의사항
- 패키지 변경 시 `package.json`과 `package-lock.json`을 함께 반영합니다.
- `node_modules`, `.expo`, `.env` 및 개인 비밀값은 커밋하지 않습니다.
- 백엔드가 준비되기 전에는 임시 데이터로 UI를 구현하고, 데이터 필드·인증·이미지 업로드 방식은 백엔드 팀과 합의 후 연결합니다.
- 실제 화면 배치, 색상과 메뉴 구성은 디자인팀 Figma를 기준으로 합니다.
