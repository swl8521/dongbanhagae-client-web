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
