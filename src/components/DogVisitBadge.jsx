import { useDogProfiles } from '../lib/dogProfileStore';
import { evaluateDogVisit } from '../lib/dogVisitMatch';
import './DogVisitBadge.css';

// 등록된 "대표 강아지" 기준으로 이 장소가 방문 가능한지 보여주는 개인화 배지.
// 강아지 프로필이 없거나 판단할 근거가 없으면(unknown) 아무것도 렌더링하지 않는다 -
// 그 경우엔 기존 ConditionStamp(일반 동반 가능 여부)만으로 충분하다.
export default function DogVisitBadge({ item, compact }) {
  const { activeDog } = useDogProfiles();
  if (!activeDog) return null;

  const result = evaluateDogVisit(activeDog, item);
  if (!result || result.level === 'unknown') return null;

  const text = result.level === 'ok' ? `${activeDog.name}와 방문 가능` : '방문 전 확인 필요';

  return (
    <div className={`dog-visit-badge dog-visit-badge--${result.level}`}>
      <span className="dog-visit-badge__dot" aria-hidden="true" />
      <span className="dog-visit-badge__text">{text}</span>
      {!compact && result.reasons.length > 0 && (
        <ul className="dog-visit-badge__reasons">
          {result.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
