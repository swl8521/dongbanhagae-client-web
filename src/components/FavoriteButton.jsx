import { Heart } from 'lucide-react';
import { useLocalSet } from '../lib/localSetStore';
import { favoritesStore } from '../lib/favoritesStore';
import './FavoriteButton.css';

export default function FavoriteButton({ contentId, size = 18, className = '' }) {
  const { has, toggle } = useLocalSet(favoritesStore);
  const active = has(contentId);

  return (
    <button
      type="button"
      className={`favorite-btn ${active ? 'favorite-btn--active' : ''} ${className}`}
      aria-pressed={active}
      aria-label={active ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(contentId);
      }}
    >
      <Heart size={size} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
