const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 11.14 (토)
export const formatDate = (date: Date) =>
  `${date.getMonth() + 1}.${date.getDate()} (${WEEKDAYS[date.getDay()]})`;

// 11.01
export const formatMonthDay = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
