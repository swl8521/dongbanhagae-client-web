import { Link, useLocation } from 'react-router-dom';
import { PawPrint, Navigation, Eye, Clock } from 'lucide-react';
import ConditionStamp from './ConditionStamp';
import ConditionTags from './ConditionTags';
import DogVisitBadge from './DogVisitBadge';
import FavoriteButton from './FavoriteButton';
import RecommendButton from './RecommendButton';
import { formatDistance } from '../lib/formatDistance';
import { formatModifiedDate } from '../lib/formatModifiedDate';
import { guessPetStatus } from '../lib/petStatus';
import { readPetStatus } from '../lib/petStatusCache';
import './FacilityCard.css';

export default function FacilityCard({ item, onRecommendChange, highlighted }) {
  const {
    contentid,
    contenttypeid,
    title,
    addr1,
    firstimage,
    recommendCount = 0,
    viewCount = 0,
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
      <div className="facility-card__photo">
        {firstimage
          ? <img src={firstimage} alt={title} loading="lazy" />
          : <div className="facility-card__photo--placeholder"><PawPrint size={32} strokeWidth={1.75} /></div>}
        <FavoriteButton contentId={contentid} size={14} className="facility-card__fav" />
        <ConditionStamp status={readPetStatus(contentid) ?? guessPetStatus(item)} variant="badge" />
      </div>

      <div className="facility-card__body">
        <h3 className="facility-card__title">{title}</h3>
        <DogVisitBadge item={item} compact />
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
        <div className="facility-card__meta">
          <RecommendButton
            contentId={contentid}
            count={recommendCount}
            onChange={(nextCount) => onRecommendChange?.(contentid, { recommendCount: nextCount })}
          />
          <span className="facility-card__meta-item">
            <Eye size={14} strokeWidth={2.25} />
            {viewCount}
          </span>
          {modifiedDate && (
            <span className="facility-card__meta-item facility-card__meta-date">
              <Clock size={13} strokeWidth={2.25} />
              {modifiedDate}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
