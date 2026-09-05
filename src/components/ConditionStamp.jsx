import { PawPrint } from 'lucide-react';
import './ConditionStamp.css';

/**
 * 시그니처 요소: 여권 입국 스탬프 모티브의 "출입 도장".
 * 반려동물 동반 가능 여부/조건을 시각적으로 즉시 인지시키기 위한 요소.
 * 상세화면(제목 옆 인라인)과 목록 카드(사진 위 오버레이)에서 완전히 동일한
 * 디자인(채워진 원형 + 발바닥 아이콘 + 텍스트)을 쓰고, 위치 방식만 다르다.
 *
 * status: 'ok' (동반가능) | 'limited' (조건부) | 'unknown' (정보없음)
 * variant: 'stamp'(기본, 상세화면에 인라인으로 놓임) | 'badge'(목록 카드 사진 위에 겹쳐 놓임)
 */
export default function ConditionStamp({ status = 'unknown', label, variant = 'stamp' }) {
  const text = {
    ok: '동반 가능',
    limited: '조건부 가능',
    unknown: '정보 없음',
  }[status];

  const className = `stamp stamp--${status}${variant === 'badge' ? ' stamp--badge' : ''}`;

  return (
    <div className={className} role="img" aria-label={`반려동물 ${text}`}>
      <PawPrint size={18} strokeWidth={2.5} fill="currentColor" />
      <span>{label || text}</span>
    </div>
  );
}
