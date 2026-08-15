import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useLocalSet } from '../lib/localSetStore';
import { recommendedStore } from '../lib/recommendedStore';
import { setFacilityRecommend } from '../api/client';
import './RecommendButton.css';

export default function RecommendButton({ contentId, count = 0, onChange }) {
  const { has, toggle } = useLocalSet(recommendedStore);
  const [pending, setPending] = useState(false);
  const active = has(contentId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const nextActive = !active;
    const optimisticCount = Math.max(count + (nextActive ? 1 : -1), 0);
    setPending(true);
    toggle(contentId);
    onChange?.(optimisticCount);

    try {
      const data = await setFacilityRecommend(contentId, nextActive);
      if (typeof data?.recommendCount === 'number') onChange?.(data.recommendCount);
    } catch {
      // 실패 시 로컬 상태/카운트 롤백
      toggle(contentId);
      onChange?.(count);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={`recommend-btn ${active ? 'recommend-btn--active' : ''}`}
      aria-pressed={active}
      aria-label={active ? '추천 취소' : '추천하기'}
      onClick={handleClick}
    >
      <ThumbsUp size={14} strokeWidth={2.25} fill={active ? 'currentColor' : 'none'} />
      <span>{count}</span>
    </button>
  );
}
