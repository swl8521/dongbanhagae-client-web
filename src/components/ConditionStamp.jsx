import { PawPrint } from 'lucide-react';
import './ConditionStamp.css';

/**
 * 시그니처 요소: 여권 입국 스탬프 모티브의 "출입 도장".
 * 반려동물 동반 가능 여부/조건을 시각적으로 즉시 인지시키기 위한 요소.
 *
 * status: 'ok' (동반가능) | 'limited' (조건부) | 'unknown' (정보없음)
 * variant: 'stamp'(기본, 상세화면의 회전된 원형 도장) | 'badge'(목록 카드의 사진 위 배지)
 */
export default function ConditionStamp({ status = 'unknown', label, variant = 'stamp' }) {
  const text = {
    ok: '동반 가능',
    limited: '조건부 가능',
    unknown: '정보 없음',
  }[status];

  if (variant === 'badge') {
    return (
      <div className={`stamp-badge stamp-badge--${status}`} role="img" aria-label={`반려동물 ${text}`}>
        <PawPrint size={18} strokeWidth={2.5} fill="currentColor" />
        <span>{label || text}</span>
      </div>
    );
  }

  return (
    <div className={`stamp stamp--${status}`} role="img" aria-label={`반려동물 ${text}`}>
      <span className="stamp__ring" />
      <span className="stamp__text">{label || text}</span>
    </div>
  );
}
