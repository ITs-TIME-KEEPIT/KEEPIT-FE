# KEEPIT 로컬 API 시연

PowerShell에서 이 폴더를 열고 테스트 백엔드 주소를 지정한 뒤 앱을 실행합니다. 기존 시연 서버에 연결하는 예입니다.

```powershell
$env:EXPO_PUBLIC_API_DEMO_MODE = 'true'
$env:EXPO_PUBLIC_API_BASE_URL = 'http://43.203.239.171:8080'
$env:EXPO_PUBLIC_ALLOW_LOCAL_HTTP = 'true'
$env:EXPO_PUBLIC_CLOTHING_REGION_IDS = '{"서울/마포구":14}'
npm.cmd start -- --clear
```

Android 개발 빌드가 이미 설치돼 있으면 `npm.cmd start`로 Metro를 실행할 수 있습니다. 백엔드를 PC에서 직접 실행하는 경우에는 실기기에서 접속 가능한 PC의 LAN IP를 지정합니다. 테스트 백엔드에 ID 1과 2의 사용자가 있어야 하며, 서버가 `Authorization`의 문자열 값을 사용자 ID로 읽도록 설정해야 합니다. 목록에서 지역 ID를 찾을 수 없는 경우 `EXPO_PUBLIC_CLOTHING_REGION_IDS`에 서버의 지역 ID를 `{"서울/마포구":14}` 형식으로 지정합니다.

1. 앱을 열면 등록자 1의 홈이 표시됩니다. 홈에서 옷을 등록합니다.
2. 마이 → 시연 계정에서 대여자 2를 선택합니다. 홈에서 방금 등록한 옷의 상세를 열고 대여를 신청합니다.
3. 마이에서 등록자 1로 전환합니다. 마이 → 받은 신청에서 수락하고 전달 사진을 등록합니다.
4. 대여자 2로 전환해 내 거래 → 빌린 옷에서 수령 및 반납 사진을 등록합니다.
5. 등록자 1로 전환해 내 거래 → 빌려준 옷에서 반납을 확인하고 거래를 완료합니다.

계정을 선택하면 홈으로 돌아가며, 일반 요청과 사진 업로드에 `Authorization: Bearer 1` 또는 `Authorization: Bearer 2`가 들어갑니다. 테스트 데이터를 재사용하려면 테스트 서버에 저장된 해당 거래를 다시 엽니다.
