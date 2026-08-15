// axios 에러의 err.message는 "Network Error" 같은 영어 기술 문구라 그대로 보여주면 안 됨.
// 서버가 내려준 한국어 메시지가 있으면 그걸 쓰고, 없으면(네트워크 단절 등) 일반적인 안내 문구로 대체.
export function getFriendlyErrorMessage(err) {
  return err?.response?.data?.message || '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}
