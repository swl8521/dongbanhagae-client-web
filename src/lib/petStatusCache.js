// 상세화면은 목록 API에 없는 필드까지 포함된 응답으로 실제 동반 조건을 조회한다.
// 그 결과를 세션 메모리에 남겨뒀다가, 뒤로가기로 돌아온 목록 카드가 다시
// "조회필요" 배지를 보여주지 않고 방금 확인한 상태를 바로 반영하게 한다.
const cache = new Map();

export function readPetStatus(contentId) {
  return cache.get(String(contentId));
}

export function writePetStatus(contentId, status) {
  cache.set(String(contentId), status);
}

// ConditionStamp의 ok/limited/unknown 판정뿐 아니라, 강아지 프로필 배지(DogVisitBadge)와
// 태그 목록(ConditionTags)도 상세화면에서 받은 전체 pet 객체가 있어야 정확하다 - 목록 API의
// item에는 이 필드들이 없거나 일부만 있을 수 있다. 같은 이유로 상세 조회 후 캐시해둔다.
const dataCache = new Map();

export function readPetData(contentId) {
  return dataCache.get(String(contentId));
}

export function writePetData(contentId, pet) {
  if (pet) dataCache.set(String(contentId), pet);
}
