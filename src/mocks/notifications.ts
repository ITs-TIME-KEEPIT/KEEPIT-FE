// 알림함 시연용 예시 알림 (Figma D. 알림함 문구). 알림 API 연동 시 서버 응답으로 교체합니다.
export type Notification = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'noti-request',
    title: '대여 신청이 왔어요',
    body: '빌리고싶어요님이 하객룩 네이비 원피스를 11.14 ~ 11.16에 빌리고 싶어해요. 48시간 안에 응답해주세요.',
    timeLabel: '방금',
    read: false,
  },
  {
    id: 'noti-accepted',
    title: '신청이 수락됐어요',
    body: '블랙 새틴 파티 드레스 · 이제 상대방 연락처를 볼 수 있어요.',
    timeLabel: '방금',
    read: false,
  },
  {
    id: 'noti-expired',
    title: '신청이 만료됐어요',
    body: '린넨 셔츠 원피스 · 등록자가 48시간 안에 응답하지 않았어요.',
    timeLabel: '어제',
    read: true,
  },
  {
    id: 'noti-cancelled',
    title: '신청이 취소됐어요',
    body: '트위드 셋업 재킷 · 대여자가 신청을 취소했어요.',
    timeLabel: '3일 전',
    read: true,
  },
];
