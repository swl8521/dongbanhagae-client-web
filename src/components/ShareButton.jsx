import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import './ShareButton.css';

// navigator.share가 있는 환경(대부분의 모바일 브라우저)에서는 OS 공유 시트를 띄운다 -
// 카카오톡이 설치돼 있으면 그 시트 안에 카카오톡 공유 항목이 자동으로 뜨므로,
// 카카오 SDK/앱키 없이도 카카오톡 공유가 가능하다. 데스크톱처럼 지원하지 않는
// 환경에서는 링크만 클립보드에 복사한다.
export default function ShareButton({ title, text, size = 18, className = '' }) {
  const [copied, setCopied] = useState(false);

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // 사용자가 공유 시트를 취소한 경우 등 - 에러로 취급하지 않음
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API도 없는 환경 - 조용히 무시
    }
  }

  return (
    <button
      type="button"
      className={`share-btn ${className}`}
      aria-label="공유하기"
      onClick={handleClick}
    >
      {copied ? <Check size={size} strokeWidth={2.25} /> : <Share2 size={size} strokeWidth={2.25} />}
      {copied && <span className="share-btn__toast">링크 복사됨</span>}
    </button>
  );
}
