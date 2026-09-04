import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PawPrint, Check, Trash2 } from 'lucide-react';
import { useDogProfiles, DOG_SIZE_OPTIONS } from '../lib/dogProfileStore';
import './DogProfile.css';

const EMPTY_FORM = { name: '', breed: '', sizeClass: 'small', weightKg: '' };

export default function DogProfile() {
  const { dogs, activeId, add, update, remove, setActive } = useDogProfiles();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    const payload = {
      name,
      breed: form.breed.trim(),
      sizeClass: form.sizeClass,
      weightKg: form.weightKg ? Number(form.weightKg) : null,
    };

    if (editingId) update(editingId, payload);
    else add(payload);

    resetForm();
  }

  function handleEdit(dog) {
    setForm({
      name: dog.name,
      breed: dog.breed || '',
      sizeClass: dog.sizeClass,
      weightKg: dog.weightKg ?? '',
    });
    setEditingId(dog.id);
  }

  function handleRemove(dog) {
    if (editingId === dog.id) resetForm();
    remove(dog.id);
  }

  return (
    <div className="dog-profile">
      <Link to="/" className="dog-profile__back">
        <ArrowLeft size={16} strokeWidth={2} />
        목록으로
      </Link>

      <header className="dog-profile__header">
        <h1>
          <PawPrint size={22} strokeWidth={2} fill="currentColor" />
          강아지 프로필
        </h1>
        <p className="dog-profile__lede">
          우리 강아지 정보를 등록하면, 장소마다 방문 가능 여부를 바로 확인할 수 있어요.
        </p>
      </header>

      {dogs.length > 0 && (
        <ul className="dog-profile__list">
          {dogs.map((dog) => (
            <li
              key={dog.id}
              className={`dog-profile__item${dog.id === activeId ? ' dog-profile__item--active' : ''}`}
            >
              <button type="button" className="dog-profile__item-main" onClick={() => setActive(dog.id)}>
                <span className="dog-profile__item-name">
                  {dog.id === activeId && <Check size={14} strokeWidth={2.5} />}
                  {dog.name}
                </span>
                <span className="dog-profile__item-meta">
                  {DOG_SIZE_OPTIONS.find((opt) => opt.value === dog.sizeClass)?.label}
                  {dog.weightKg ? ` · ${dog.weightKg}kg` : ''}
                  {dog.breed ? ` · ${dog.breed}` : ''}
                </span>
              </button>
              <div className="dog-profile__item-actions">
                <button type="button" onClick={() => handleEdit(dog)}>수정</button>
                <button type="button" aria-label={`${dog.name} 삭제`} onClick={() => handleRemove(dog)}>
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {dogs.length > 1 && <p className="dog-profile__hint">체크된 강아지 기준으로 방문 가능 여부를 보여줘요.</p>}

      <form className="dog-profile__form" onSubmit={handleSubmit}>
        <h2>{editingId ? '강아지 정보 수정' : '강아지 추가'}</h2>

        <label>
          이름
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="예: 보리"
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

        <div className="dog-profile__field">
          <span className="dog-profile__field-label">크기</span>
          <div className="dog-profile__size-chips">
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

        <label>
          몸무게 kg (선택)
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.weightKg}
            onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
            placeholder="예: 32"
          />
        </label>

        <div className="dog-profile__form-actions">
          {editingId && (
            <button type="button" className="dog-profile__cancel" onClick={resetForm}>
              취소
            </button>
          )}
          <button type="submit" className="dog-profile__submit">
            {editingId ? '수정 완료' : '추가하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
