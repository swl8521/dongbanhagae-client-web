import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { fetchPetFacilityDetail } from '../api/client';
import { useLocalSet } from '../lib/localSetStore';
import { favoritesStore } from '../lib/favoritesStore';
import FacilityCard from '../components/FacilityCard';
import './Favorites.css';

// 상세 API 응답(common/pet/stats)을 FacilityCard가 기대하는 목록 아이템 모양으로 변환
function toFacilityCardItem(contentId, detail) {
  const { common, pet, stats } = detail;
  return {
    ...(pet || {}),
    contentid: contentId,
    contenttypeid: common?.contenttypeid,
    title: common?.title,
    addr1: common?.addr1,
    firstimage: common?.firstimage,
    modifiedtime: common?.modifiedtime,
    recommendCount: stats?.recommendCount ?? 0,
    viewCount: stats?.viewCount ?? 0,
  };
}

export default function Favorites() {
  useLocalSet(favoritesStore); // 즐겨찾기 변경(해제 포함) 시 이 페이지가 리렌더되도록 구독만 한다
  const ids = [...favoritesStore.getSnapshot()].reverse(); // 최근에 찜한 순으로 표시

  const [detailsById, setDetailsById] = useState({});
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (ids.length === 0) {
      setDetailsById({});
      setStatus('done');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    Promise.allSettled(ids.map((id) => fetchPetFacilityDetail(id).then((detail) => [id, detail])))
      .then((results) => {
        if (cancelled) return;
        const next = {};
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            const [id, detail] = result.value;
            next[id] = detail;
          }
        });
        setDetailsById(next);
        setStatus('done');
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);

  function patchItem(contentId, patch) {
    setDetailsById((prev) => {
      const current = prev[contentId];
      if (!current) return prev;
      return { ...prev, [contentId]: { ...current, stats: { ...current.stats, ...patch } } };
    });
  }

  const items = ids.filter((id) => detailsById[id]).map((id) => toFacilityCardItem(id, detailsById[id]));

  return (
    <div className="favorites">
      <Link to="/" className="favorites__back">
        <ArrowLeft size={16} strokeWidth={2} />
        목록으로
      </Link>

      <header className="favorites__header">
        <h1>
          <Heart size={22} strokeWidth={2} fill="currentColor" />
          즐겨찾기
        </h1>
        <p className="favorites__lede">이 브라우저에 저장된 즐겨찾기 시설이에요.</p>
      </header>

      {status === 'loading' && <p className="favorites__status">불러오는 중...</p>}
      {status === 'done' && ids.length === 0 && (
        <p className="favorites__status">
          아직 즐겨찾기한 시설이 없어요. 목록에서 하트를 눌러 저장해보세요.
        </p>
      )}

      <div className="favorites__list">
        {items.map((item) => (
          <FacilityCard
            key={item.contentid}
            item={item}
            onRecommendChange={(contentId, patch) => patchItem(contentId, patch)}
          />
        ))}
      </div>
    </div>
  );
}
