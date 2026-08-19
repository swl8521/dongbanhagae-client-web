import { Link, useLocation } from 'react-router-dom';
import { PawPrint, Navigation } from 'lucide-react';
import ConditionStamp from './ConditionStamp';
import ConditionTags from './ConditionTags';
import FavoriteButton from './FavoriteButton';
import RecommendButton from './RecommendButton';
import { formatDistance } from '../lib/formatDistance';
import { formatModifiedDate } from '../lib/formatModifiedDate';
import './FacilityCard.css';

// TourAPI 응답 필드명은 표준 필드(title/addr1/firstimage 등)는 안정적이지만,
// 반려동물 조건 관련 필드는 실제 승인 후 응답을 보고 정확히 매핑해야 함.
// 지금은 방어적으로 여러 후보 키를 확인하고, 없으면 'unknown' 처리.
function guessPetStatus(item) {
  const raw = (item?.acmpyPsblCpam || item?.acmpyTypeCd || '').toString();
  if (!raw) return 'unknown';
  if (raw.includes('가능') || raw.includes('전체')) return 'ok';
  return 'limited';
}

export default function FacilityCard({ item, onRecommendChange, highlighted }) {
  const {
    contentid,
    contenttypeid,
    title,
    addr1,
    firstimage,
    recommendCount = 0,
    dist,
    modifiedtime,
  } = item;

  const distanceLabel = formatDistance(dist);
  const modifiedDate = formatModifiedDate(modifiedtime);
  const location = useLocation();

  return (
    <Link
      id={`facility-card-${contentid}`}
      to={`/facility/${contentid}?contentTypeId=${contenttypeid || ''}`}
      state={{ from: `${location.pathname}${location.search}` }}
      className={`facility-card${highlighted ? ' facility-card--highlighted' : ''}`}
    >
      <div className="facility-card__thumb">
        {firstimage
          ? <img src={firstimage} alt={title} loading="lazy" />
          : <div className="facility-card__thumb--placeholder"><PawPrint size={28} strokeWidth={1.75} /></div>}
        <FavoriteButton contentId={contentid} size={14} className="facility-card__fav" />
      </div>

      <div className="facility-card__body">
        <h3 className="facility-card__title">{title}</h3>
        <div className="facility-card__addr-row">
          <p className="facility-card__addr">{addr1 || '주소 정보 없음'}</p>
          {distanceLabel && (
            <span className="facility-card__dist">
              <Navigation size={11} strokeWidth={2.5} />
              {distanceLabel}
            </span>
          )}
        </div>
        <ConditionTags item={item} limit={2} />
        <RecommendButton
          contentId={contentid}
          count={recommendCount}
          onChange={(nextCount) => onRecommendChange?.(contentid, { recommendCount: nextCount })}
        />
      </div>

      <ConditionStamp status={guessPetStatus(item)} />
      {modifiedDate && <p className="facility-card__modified">갱신 {modifiedDate}</p>}
    </Link>
  );
}
