// 상세화면에 갔다가 목록으로 돌아왔을 때 목록을 처음부터 다시 불러오지 않고
// 불러와둔 아이템과 스크롤 위치를 그대로 복원하기 위한 세션 메모리 캐시.
// 새로고침하면 사라지는 게 정상 동작(새 방문은 처음부터 불러와야 하니까).
let cache = null;

export function readHomeListCache(key) {
  return cache && cache.key === key ? cache : null;
}

export function writeHomeListCache(key, data) {
  // 같은 key(필터 조건)면 기존 값에 덮어써서, 아이템 목록과 스크롤 위치가
  // 서로 다른 시점에 각자 저장되어도 하나로 합쳐지게 한다.
  cache = cache && cache.key === key ? { ...cache, ...data } : { key, ...data };
}
