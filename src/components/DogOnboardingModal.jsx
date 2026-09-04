import { useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';
import { DOG_SIZE_OPTIONS, useDogProfiles } from '../lib/dogProfileStore';
import { dismissDogOnboarding } from '../lib/dogOnboardingStore';
import './DogOnboardingModal.css';

// 등록된 강아지가 하나도 없는 상태로 첫 화면에 들어왔을 때 뜨는 온보딩 모달.
// "나중에 할게요"를 누르면 dogOnboardingStore에 플래그를 남겨 다음 방문부터는 뜨지 않는다.
export default function DogOnboardingModal({ onClose }) {
  const { add } = useDogProfiles();
  const [form, setForm] = useState({ name: '', breed: '', sizeClass: 'small' });

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function handleSkip() {
    dismissDogOnboarding();
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    add({
      name,
      breed: form.breed.trim(),
      sizeClass: form.sizeClass,
    });
    onClose();
  }

  return (
    <div className="dog-onboarding" role="dialog" aria-modal="true" aria-labelledby="dog-onboarding-title">
      <button
        type="button"
        className="dog-onboarding__backdrop"
        aria-label="나중에 할게요"
        onClick={handleSkip}
      />

      <div className="dog-onboarding__panel">
        <PawPrint size={26} strokeWidth={2} className="dog-onboarding__icon" />
        <h2 id="dog-onboarding-title">우리 강아지를 알려주세요</h2>
        <p className="dog-onboarding__lede">
          등록하면 장소마다 우리 강아지가 방문 가능한지 바로 확인할 수 있어요.
        </p>

        <form className="dog-onboarding__form" onSubmit={handleSubmit}>
          <label>
            이름
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="예: 보리"
              autoFocus
              required
            />
          </label>

          <label>
            견종 (선택)
            <input
              type="text"
              value={form.breed}
              onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
              placeholder="예: 골든리트리버"
            />
          </label>

          <div className="dog-onboarding__field">
            <span className="dog-onboarding__field-label">크기</span>
            <div className="dog-onboarding__size-chips">
              {DOG_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip ${form.sizeClass === opt.value ? 'chip--active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, sizeClass: opt.value }))}
                >
                  {opt.label}
                  <span className="chip__count">{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dog-onboarding__actions">
            <button type="button" className="dog-onboarding__skip" onClick={handleSkip}>
              나중에 할게요
            </button>
            <button type="submit" className="dog-onboarding__submit">
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
