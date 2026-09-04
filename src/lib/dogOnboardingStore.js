// 첫 진입 시 강아지 등록 유도 모달을 "나중에 할게요"로 닫으면 다시 뜨지 않도록
// 브라우저에 남겨두는 플래그. 강아지를 실제로 등록하면 dogProfileStore 쪽에
// 데이터가 생기므로 이 플래그와 무관하게 모달 조건(dogs.length === 0)이 꺼진다.
const DISMISSED_KEY = 'dongbanhagae:dog-onboarding-dismissed';

export function isDogOnboardingDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissDogOnboarding() {
  try {
    localStorage.setItem(DISMISSED_KEY, '1');
  } catch {
    // 프라이빗 모드 등 localStorage를 못 쓰면 매번 다시 뜨는 정도로 감수한다
  }
}
