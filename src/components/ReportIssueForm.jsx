import { useState } from 'react';
import { Flag } from 'lucide-react';
import { reportFacilityIssue } from '../api/client';
import { getFriendlyErrorMessage } from '../lib/errorMessage';
import './ReportIssueForm.css';

const MAX_LENGTH = 300;

export default function ReportIssueForm({ contentId, reportCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | done | error
  const [error, setError] = useState(null);
  // 서버 응답으로 내려오는 최신 건수로 갱신 - 내가 방금 제출한 것도 바로 반영되게.
  const [count, setCount] = useState(reportCount);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim() || status === 'submitting') return;

    setStatus('submitting');
    try {
      const res = await reportFacilityIssue(contentId, message.trim());
      if (typeof res?.reportCount === 'number') setCount(res.reportCount);
      setStatus('done');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <p className="report-form__done">
        제보 감사합니다! 확인 후 정보에 반영할게요.
        {count > 0 && <span className="report-form__count"> (지금까지 {count}건 접수)</span>}
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className="report-form__trigger" onClick={() => setOpen(true)}>
        <Flag size={13} strokeWidth={2.25} />
        이 정보가 실제와 달라요
        {count > 0 && <span className="report-form__count">{count}건 접수됨</span>}
      </button>
    );
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <textarea
        className="report-form__textarea"
        placeholder="어떤 점이 다른가요? (예: 지금은 반려동물 동반이 안 돼요)"
        value={message}
        maxLength={MAX_LENGTH}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        autoFocus
      />
      <div className="report-form__actions">
        {status === 'error' && <span className="report-form__error">{error}</span>}
        <button type="button" className="report-form__cancel" onClick={() => setOpen(false)}>
          취소
        </button>
        <button
          type="submit"
          className="report-form__submit"
          disabled={!message.trim() || status === 'submitting'}
        >
          {status === 'submitting' ? '전송 중...' : '제출'}
        </button>
      </div>
    </form>
  );
}
