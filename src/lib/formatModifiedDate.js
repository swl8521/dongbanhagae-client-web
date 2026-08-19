// TourAPI modifiedtime은 보통 "YYYYMMDDHHMMSS" 형태(구분자 없는 14자리)로 온다.
// 방어적으로 숫자만 추출해 앞 8자리(YYYYMMDD)를 "YYYY.MM.DD"로 포맷한다.
export function formatModifiedDate(modifiedtime) {
  const digits = (modifiedtime || '').toString().replace(/\D/g, '');
  if (digits.length < 8) return null;

  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);
  return `${year}.${month}.${day}`;
}
