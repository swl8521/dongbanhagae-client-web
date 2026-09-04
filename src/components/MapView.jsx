import { useEffect, useRef } from 'react';
import { Map as MaplibreMap, Marker, Popup, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createFacilityMarkerElement } from '../lib/facilityMarkerIcon';
import { evaluateDogVisit } from '../lib/dogVisitMatch';
import './MapView.css';

// maplibre-gl은 워커 스크립트를 import.meta.url 기준 동적 경로로 찾는데, Vite 프로덕션
// 빌드는 이 패턴을 정적 분석하지 못해 워커 파일을 번들에 포함하지 않는다(dev 서버는
// node_modules를 그대로 서빙해서 우연히 동작함). 그 결과 빌드 후에는 존재하지 않는 워커
// URL 요청이 SPA fallback으로 index.html을 받아버려 워커가 조용히 죽고, 벡터 타일이
// 하나도 안 뜨는 빈 지도가 된다. scripts/copy-maplibre-worker.js가 public/에 복사해둔
// 워커 파일(과 그 워커가 상대경로로 import하는 sibling 파일)을 setWorkerUrl로 지정해 우회한다.
setWorkerUrl('/maplibre-gl-worker.mjs');

// OpenFreeMap: 무료, API 키 불필요, 사용량 제한 없음 (기부로 운영) - https://openfreemap.org
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// 이 스타일에 포함된 국가/행정구역 경계선 레이어. 남북 분단선이 지도에서 과하게 도드라져서 끈다.
const BOUNDARY_LAYER_IDS = ['boundary_2', 'boundary_3', 'boundary_disputed'];

export default function MapView({ center, zoom, markers, onMarkerClick, onUserMoveEnd, activeDog }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  // 맵 생성 effect는 최초 1번만 도는데 onUserMoveEnd는 매 렌더마다 새로 만들어지는
  // 함수라서, 리스너 안에서 직접 참조하면 항상 최초 렌더의 콜백만 호출된다(stale closure).
  // ref로 감싸 항상 최신 콜백을 가리키게 한다.
  const onUserMoveEndRef = useRef(onUserMoveEnd);

  useEffect(() => {
    onUserMoveEndRef.current = onUserMoveEnd;
  }, [onUserMoveEnd]);

  // 지도는 최초 1번만 생성
  useEffect(() => {
    const map = new MaplibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      center: [center[1], center[0]],
      zoom,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ showCompass: false }), 'top-left');

    map.on('load', () => {
      BOUNDARY_LAYER_IDS.forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
    });

    // originalEvent가 있으면 드래그/스크롤/터치 등 사용자가 직접 움직인 것이고,
    // 우리 코드가 호출한 jumpTo(지역 선택, 내 주변 등)는 originalEvent가 없다.
    // 이 구분이 없으면 우리가 지도를 움직일 때마다 "이 지역 재검색" 버튼이 떴다 사라진다.
    map.on('moveend', (e) => {
      if (!e.originalEvent) return;
      const c = map.getCenter();
      onUserMoveEndRef.current?.({ lat: c.lat, lng: c.lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // center/zoom이 바뀌면(지역 선택, 내 주변 등) 그 위치로 이동
  useEffect(() => {
    mapRef.current?.jumpTo({ center: [center[1], center[0]], zoom });
  }, [center, zoom]);

  // 마커는 목록이 바뀔 때마다 전부 새로 그린다
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());

    markersRef.current = markers.map((item) => {
      const visit = activeDog ? evaluateDogVisit(activeDog, item) : null;
      const el = createFacilityMarkerElement(item.contenttypeid, visit?.level);
      el.style.cursor = 'pointer';

      const marker = new Marker({ element: el })
        .setLngLat([Number(item.mapx), Number(item.mapy)])
        .setPopup(new Popup({ offset: 15 }).setText(item.title))
        .addTo(map);

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(item));
      }

      return marker;
    });
  }, [markers, onMarkerClick, activeDog]);

  return <div ref={containerRef} className="map-view" />;
}
