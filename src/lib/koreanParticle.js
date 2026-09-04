// 한글 음절의 받침 유무로 조사를 고른다. 완성형 한글(가~힣)이 아니면(영문/숫자 등)
// 판정할 수 없으니 받침 있는 쪽을 기본값으로 쓴다.
function hasBatchim(char) {
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return true;
  return (code - 0xac00) % 28 !== 0;
}

export function withParticle(word, withBatchim, noBatchim) {
  if (!word) return withBatchim;
  const lastChar = word.trim().slice(-1);
  return hasBatchim(lastChar) ? withBatchim : noBatchim;
}

// 와/과: 받침 없으면 "와"(예: 보리와), 받침 있으면 "과"(예: 콩과)
export function waGwa(word) {
  return withParticle(word, '과', '와');
}
