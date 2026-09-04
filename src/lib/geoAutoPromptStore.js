// 첫 방문(필터/좌표 없이 들어온 경우) 한 번만 위치 권한을 자동으로 물어보기 위한 플래그.
// 매번 다시 묻지 않도록 브라우저에 시도 여부만 남긴다 - 동의 여부와 무관하게,
// 한 번 시도했으면(허용/거부/무응답 모두) 다시 자동으로 묻지 않는다.
const KEY = 'dongbanhagae:geo-auto-prompted';

export function hasAutoPromptedLocation() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markAutoPromptedLocation() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    // localStorage 사용 불가 환경에서는 매번 다시 시도하는 정도로 감수한다
  }
}
