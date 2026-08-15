import './ConditionStamp.css';

/**
 * 시그니처 요소: 여권 입국 스탬프 모티브의 "출입 도장".
 * 반려동물 동반 가능 여부/조건을 시각적으로 즉시 인지시키기 위한 요소.
 *
 * status: 'ok' (동반가능) | 'limited' (조건부) | 'unknown' (정보없음)
 */
export default function ConditionStamp({ status = 'unknown', label }) {
  const text = {
    ok: '동반 가능',
    limited: '조건부 가능',
    unknown: '조회필요!',
  }[status];

  return (
    <div className={`stamp stamp--${status}`} role="img" aria-label={`반려동물 ${text}`}>
      <span className="stamp__ring" />
      <span className="stamp__text">{label || text}</span>
    </div>
  );
}
