const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 11.14 (토)
export const formatDate = (date: Date) =>
  `${date.getMonth() + 1}.${date.getDate()} (${WEEKDAYS[date.getDay()]})`;

// 11.01
export const formatMonthDay = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

const formatTime = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

// 11.14 (토) 13:52
export const formatDateTime = (date: Date) => `${formatDate(date)} ${formatTime(date)}`;

// 2026.11.14 (토) 13:52
export const formatFullDateTime = (date: Date) =>
  `${date.getFullYear()}.${formatMonthDay(date)} (${WEEKDAYS[date.getDay()]}) ${formatTime(date)}`;

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const dayDiff = (from: Date, to: Date) => Math.round((startOfDay(to) - startOfDay(from)) / DAY);

// D-1 · D-day · D+2
export function formatDday(target: Date, now = new Date()) {
  const days = dayDiff(now, target);
  return days === 0 ? 'D-day' : days > 0 ? `D-${days}` : `D+${-days}`;
}

// 시작일과 종료일을 모두 세는 대여 일수
export const rentalDays = (start: Date, end: Date) => dayDiff(start, end) + 1;

// Calendar dates are local wall-clock days, independent of UTC offset.
export function toApiDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
