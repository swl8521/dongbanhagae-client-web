import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, LocateFixed, Route } from 'lucide-react';
import { usePetFacilities } from '../hooks/usePetFacilities';
import { fetchAreaCounts } from '../api/client';
import { useLocalSet } from '../lib/localSetStore';
import { favoritesStore } from '../lib/favoritesStore';
import FacilityCard from '../components/FacilityCard';
import MapView from '../components/MapView';
import './Home.css';

const SORT_OPTIONS = [
  { value: 'default', label: '기본순' },
  { value: 'favorite', label: '즐겨찾기순' },
  { value: 'recommend', label: '추천순' },
  { value: 'views', label: '조회순' },
];

// TourAPI areaCode2 오퍼레이션 기준 표준 지역 코드 (17개 시/도)
const AREA_OPTIONS = [
  { code: '', label: '전국' },
  { code: '1', label: '서울' },
  { code: '2', label: '인천' },
  { code: '3', label: '대전' },
  { code: '4', label: '대구' },
  { code: '5', label: '광주' },
  { code: '6', label: '부산' },
  { code: '7', label: '울산' },
  { code: '8', label: '세종' },
  { code: '31', label: '경기' },
  { code: '32', label: '강원' },
  { code: '33', label: '충북' },
  { code: '34', label: '충남' },
  { code: '35', label: '경북' },
  { code: '36', label: '경남' },
  { code: '37', label: '전북' },
  { code: '38', label: '전남' },
  { code: '39', label: '제주' },
  // TourAPI 원본 데이터의 areacode 필드가 비어있는 항목들 (지역 필터로 안 걸리던 곳들)
  { code: 'unclassified', label: '미분류' },
];

const RADIUS_OPTIONS = [
  { value: 5000, label: '5km' },
  { value: 10000, label: '10km' },
  { value: 20000, label: '20km' },
];

// facilityMarkerIcon.js의 카테고리 분류와 동일한 TourAPI 표준 contentTypeId 기준
const CONTENT_TYPE_OPTIONS = [
  { code: '', label: '전체' },
  { code: '12', label: '관광지' },
  { code: '14', label: '문화시설' },
  { code: '15', label: '축제/공연/행사' },
  { code: '25', label: '여행코스' },
  { code: '28', label: '레포츠' },
  { code: '32', label: '숙박' },
  { code: '38', label: '쇼핑' },
  { code: '39', label: '음식점' },
];

const LOCATION_ERROR_MESSAGES = {
  denied: '위치 권한이 거부됐어요. 브라우저 설정에서 허용한 뒤 다시 시도해주세요.',
  unsupported: '이 브라우저는 위치 확인을 지원하지 않아요.',
  error: '위치를 가져오지 못했어요. 잠시 후 다시 시도해주세요.',
};

export default function Home() {
  // 필터는 URL 쿼리스트링에 반영해서, 상세화면 진입 후 뒤로가기로
  // 이 컴포넌트가 다시 마운트되어도 이전 필터가 그대로 복원되도록 한다.
  const [searchParams, setSearchParams] = useSearchParams();

  const areaCode = searchParams.get('area') ?? '';
  const contentTypeId = searchParams.get('contentTypeId') ?? '';
  const keyword = searchParams.get('keyword') ?? '';
  const sortBy = searchParams.get('sort') ?? 'default';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const coords = lat && lng ? { mapX: Number(lng), mapY: Number(lat) } : null;
  const radius = Number(searchParams.get('radius')) || 10000;

  // MapView에 넘기는 center는 lat/lng가 실제로 바뀔 때만 레퍼런스가 바뀌어야 한다.
  // 매 렌더마다 새 배열을 만들면(예: 마커 클릭으로 인한 리렌더) MapView의 jumpTo effect가
  // 다시 실행돼서 사용자가 지도에서 직접 이동한 위치가 초기 위치로 리셋된다.
  const mapCenter = useMemo(
    () => (lat && lng ? [Number(lat), Number(lng)] : [36.5, 127.8]),
    [lat, lng]
  );

  const [searchInput, setSearchInput] = useState(keyword);
  const [locationState, setLocationState] = useState('idle'); // idle | requesting | denied | unsupported | error
  const [highlightedId, setHighlightedId] = useState(null);
  // 내 주변 모드에서 사용자가 지도를 직접 옮겼을 때, 그 지점을 바로 검색하지 않고
  // "이 지역 재검색" 버튼을 눌러야 반영되도록 대기시켜두는 좌표.
  const [pendingCenter, setPendingCenter] = useState(null);

  // lat/lng가 바뀌면(재검색 적용, 내 주변 새로 클릭, 위치 필터 해제 등) 대기 중이던 좌표는 의미가 없어진다.
  useEffect(() => {
    setPendingCenter(null);
  }, [lat, lng]);

  function updateParams(updates) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      return next;
    }, { replace: true });
  }

  const { items, status, error, hasMore, loadMore, patchItem, totalCount } = usePetFacilities({
    areaCode,
    contentTypeId,
    keyword,
    mapX: coords?.mapX,
    mapY: coords?.mapY,
    radius: coords ? radius : undefined,
  });
  const { has: isFavorite } = useLocalSet(favoritesStore);

  function clearLocation() {
    updateParams({ lat: undefined, lng: undefined, radius: undefined });
    setLocationState('idle');
  }

  // 내 주변 모드에서만 지도 이동을 재검색 후보로 취급한다 - 지역/키워드 조회에서는
  // 좌표 기반 검색으로 전환한다는 의미가 없어 버튼을 띄우지 않는다.
  function handleMapMoved(nextCenter) {
    if (!coords) return;
    setPendingCenter(nextCenter);
  }

  function handleResearchHere() {
    if (!pendingCenter) return;
    updateParams({ lat: pendingCenter.lat, lng: pendingCenter.lng });
    setPendingCenter(null);
  }

  function handleUseMyLocation() {
    if (coords) {
      clearLocation();
      return;
    }

    if (!navigator.geolocation) {
      setLocationState('unsupported');
      return;
    }

    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateParams({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          area: undefined,
          keyword: undefined,
        });
        setSearchInput('');
        setLocationState('idle');
      },
      (geoErr) => {
        setLocationState(geoErr.code === geoErr.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }

  const [areaCounts, setAreaCounts] = useState({});

  useEffect(() => {
    fetchAreaCounts()
      .then(setAreaCounts)
      .catch(() => { }); // 카운트는 부가 정보라 실패해도 필터 자체는 그대로 동작
  }, []);

  // 정렬은 현재 불러온(페이지네이션된) 목록 안에서만 재정렬한다 -
  // 전국 9,694개 전체 기준 정렬은 목록 자체를 우리 DB로 옮겨야 해서 별도 작업으로 분리.
  const sortedItems = useMemo(() => {
    if (sortBy === 'default') return items;

    const arr = [...items];
    if (sortBy === 'favorite') {
      arr.sort((a, b) => Number(isFavorite(b.contentid)) - Number(isFavorite(a.contentid)));
    } else if (sortBy === 'recommend') {
      arr.sort((a, b) => (b.recommendCount || 0) - (a.recommendCount || 0));
    } else if (sortBy === 'views') {
      arr.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }
    return arr;
  }, [items, sortBy, isFavorite]);

  const markers = useMemo(
    () => items.filter((it) => it.mapx && it.mapy),
    [items]
  );

  // 마커 클릭 시 목록에서 해당 카드로 스크롤 + 하이라이트.
  // 클래스를 한 프레임 껐다 켜서, 같은 마커를 연속 클릭해도 애니메이션이 다시 재생되게 한다.
  function handleMarkerClick(item) {
    document.getElementById(`facility-card-${item.contentid}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedId(null);
    requestAnimationFrame(() => setHighlightedId(item.contentid));
  }

  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__header-top">
          <div>
            <p className="home__eyebrow">전국 반려동물 동반 시설</p>
            <h1>
              동반하개
              <span className="home__title-icons" aria-hidden="true">
                <Route size={20} strokeWidth={2} />
              </span>
            </h1>
            <p className="home__lede">미리미리 확인해요!</p>
          </div>
          <Link to="/favorites" className="home__favorites-link" aria-label="즐겨찾기 목록">
            <Heart size={20} strokeWidth={2} />
          </Link>
        </div>

        <form
          className="home__search"
          onSubmit={(e) => {
            e.preventDefault();
            setLocationState('idle');
            updateParams({ lat: undefined, lng: undefined, radius: undefined, keyword: searchInput || undefined });
          }}
        >
          <input
            type="search"
            placeholder="지역, 장소명으로 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">검색</button>
        </form>

        <div className="home__filters">
          <button
            type="button"
            className={`chip chip--location ${coords ? 'chip--active' : ''}`}
            onClick={handleUseMyLocation}
          >
            <LocateFixed size={14} strokeWidth={2.25} />
            {locationState === 'requesting' ? '위치 확인 중...' : '내 주변'}
          </button>
          {AREA_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              className={`chip ${!coords && areaCode === opt.code ? 'chip--active' : ''}`}
              onClick={() => {
                setLocationState('idle');
                setSearchInput('');
                updateParams({ lat: undefined, lng: undefined, radius: undefined, keyword: undefined, area: opt.code || undefined });
              }}
              type="button"
            >
              {opt.label}
              {opt.code in areaCounts && (
                <span className="chip__count">{areaCounts[opt.code].toLocaleString()}</span>
              )}
            </button>
          ))}
        </div>

        {coords && (
          <div className="home__filters home__filters--radius">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`chip chip--sort ${radius === opt.value ? 'chip--active' : ''}`}
                onClick={() => updateParams({ radius: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="home__filters home__filters--type">
          {CONTENT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              className={`chip chip--sort ${contentTypeId === opt.code ? 'chip--active' : ''}`}
              onClick={() => updateParams({ contentTypeId: opt.code || undefined })}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {LOCATION_ERROR_MESSAGES[locationState] && (
          <p className="home__location-error">{LOCATION_ERROR_MESSAGES[locationState]}</p>
        )}
      </header>

      <div className="home__map">
        <MapView
          center={mapCenter}
          zoom={coords ? 13 : 7}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          onUserMoveEnd={handleMapMoved}
        />
        {pendingCenter && (
          <button type="button" className="home__research-btn" onClick={handleResearchHere}>
            <LocateFixed size={13} strokeWidth={2.25} />
            이 지역 재검색
          </button>
        )}
      </div>

      <main className="home__list">
        {items.length > 0 && (
          <div className="home__list-meta">
            <p className="home__count">{items.length.toLocaleString()} / {totalCount.toLocaleString()}개</p>
            <div className="home__sort">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip chip--sort ${sortBy === opt.value ? 'chip--active' : ''}`}
                  onClick={() => updateParams({ sort: opt.value === 'default' ? undefined : opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === 'loading' && <p className="home__status">불러오는 중...</p>}
        {status === 'error' && <p className="home__status home__status--error">{error}</p>}
        {status === 'done' && items.length === 0 && (
          <p className="home__status">조건에 맞는 시설이 없습니다. 다른 지역을 선택해보세요.</p>
        )}
        {sortedItems.map((item) => (
          <FacilityCard
            key={item.contentid}
            item={item}
            highlighted={item.contentid === highlightedId}
            onRecommendChange={(contentId, patch) => patchItem(contentId, patch)}
          />
        ))}

        {hasMore && <div ref={sentinelRef} className="home__sentinel" />}
        {status === 'loading-more' && <p className="home__status">더 불러오는 중...</p>}
      </main>
    </div>
  );
}
