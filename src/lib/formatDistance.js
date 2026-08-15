// TourAPI locationBasedList2가 주는 dist는 미터 단위 문자열
export function formatDistance(dist) {
  const meters = Number(dist);
  if (!Number.isFinite(meters)) return null;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
