import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Phone } from 'lucide-react';
import { fetchPetFacilityDetail } from '../api/client';
import { getFriendlyErrorMessage } from '../lib/errorMessage';
import { formatModifiedDate } from '../lib/formatModifiedDate';
import ConditionStamp from '../components/ConditionStamp';
import ConditionTags from '../components/ConditionTags';
import FavoriteButton from '../components/FavoriteButton';
import RecommendButton from '../components/RecommendButton';
import ReportIssueForm from '../components/ReportIssueForm';
import './FacilityDetail.css';

export default function FacilityDetail() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const contentTypeId = searchParams.get('contentTypeId');
  const location = useLocation();
  // 목록에서 넘어올 때 전달된 이전 경로(필터 쿼리 포함)로 돌아가야
  // 상세화면 진입 전 필터가 그대로 유지된다.
  const backTo = location.state?.from ?? '/';

  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus('loading');
    fetchPetFacilityDetail(contentId, contentTypeId)
      .then((res) => { setData(res); setStatus('done'); })
      .catch((err) => {
        setError(getFriendlyErrorMessage(err));
        setStatus('error');
      });
  }, [contentId, contentTypeId]);

  if (status === 'loading') return <p className="detail__status">불러오는 중...</p>;
  if (status === 'error') return <p className="detail__status detail__status--error">{error}</p>;

  const { common, pet, stats } = data;
  const modifiedDate = formatModifiedDate(common.modifiedtime);

  return (
    <div className="detail">
      <Link to={backTo} className="detail__back">
        <ArrowLeft size={16} strokeWidth={2} />
        목록으로
      </Link>

      <div className="detail__head">
        <h1>{common.title}</h1>
        <ConditionStamp status={pet ? 'ok' : 'unknown'} />
      </div>

      <p className="detail__addr">{common.addr1} {common.addr2}</p>
      {modifiedDate && <p className="detail__modified">정보 갱신: {modifiedDate}</p>}

      <div className="detail__actions">
        <FavoriteButton contentId={contentId} size={18} />
        <RecommendButton
          contentId={contentId}
          count={stats?.recommendCount ?? 0}
          onChange={(nextCount) =>
            setData((prev) => ({ ...prev, stats: { ...prev.stats, recommendCount: nextCount } }))
          }
        />
        <span className="detail__views">
          <Eye size={14} strokeWidth={2.25} />
          조회 {stats?.viewCount ?? 0}
        </span>
      </div>

      {common.overview && (
        <section className="detail__section">
          <h2>소개</h2>
          {/* TourAPI 개요는 HTML 태그가 섞여 오는 경우가 있어 dangerouslySetInnerHTML 대신
              필요 시 sanitize 라이브러리(dompurify 등) 적용 권장 */}
          <p>{common.overview.replace(/<[^>]+>/g, '')}</p>
        </section>
      )}

      <section className="detail__section detail__section--pet">
        <h2>반려동물 동반 조건</h2>
        {pet ? (
          <>
            <ConditionTags item={pet} />
            <dl className="detail__pet-info">
              {/* TODO: 실제 승인 후 응답 필드명 확인하여 아래 항목 정확히 매핑 */}
              {pet.acmpyTypeCd && <><dt>동반 유형</dt><dd>{pet.acmpyTypeCd}</dd></>}
              {pet.acmpyPsblCpam && <><dt>동반 가능 조건</dt><dd>{pet.acmpyPsblCpam}</dd></>}
              {pet.etcAcmpyInfo && <><dt>기타 안내</dt><dd>{pet.etcAcmpyInfo}</dd></>}
            </dl>
          </>
        ) : (
          <p className="detail__no-info">
            등록된 반려동물 동반 조건 정보가 없습니다. 방문 전 시설에 직접 확인하는 것을 권장합니다.
          </p>
        )}

        <div className="detail__disclaimer">
          <p>현장 사정에 따라 조건이 변경될 수 있어요. 방문 전 시설에 다시 확인하는 걸 권장합니다.</p>
          {common.tel && (
            <a href={`tel:${common.tel.replace(/[^0-9-]/g, '')}`} className="detail__call-btn">
              <Phone size={14} strokeWidth={2.25} />
              전화 문의
            </a>
          )}
        </div>

        <ReportIssueForm contentId={contentId} />
      </section>
    </div>
  );
}
