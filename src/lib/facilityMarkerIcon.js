import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Mountain,
  Landmark,
  PartyPopper,
  Route,
  Dumbbell,
  BedDouble,
  ShoppingBag,
  UtensilsCrossed,
  PawPrint,
} from 'lucide-react';

// TourAPI 표준 contentTypeId 기준 카테고리 분류
const CATEGORY_BY_CONTENT_TYPE = {
  12: { Icon: Mountain, color: '#4F9F6E' },       // 관광지
  14: { Icon: Landmark, color: '#8B6FD6' },       // 문화시설
  15: { Icon: PartyPopper, color: '#D65C9E' },    // 축제공연행사
  25: { Icon: Route, color: '#4C8DD6' },          // 여행코스
  28: { Icon: Dumbbell, color: '#E0913D' },       // 레포츠
  32: { Icon: BedDouble, color: '#6C7FD6' },      // 숙박
  38: { Icon: ShoppingBag, color: '#B571C9' },    // 쇼핑
  39: { Icon: UtensilsCrossed, color: '#E0654F' }, // 음식점
};

const DEFAULT_CATEGORY = { Icon: PawPrint, color: '#6FC79A' };

// 대표 강아지가 등록돼 있으면 카테고리색 대신 이 3색으로 마커를 통일해서
// "이 강아지가 방문 가능한가"를 지도에서 바로 훑어볼 수 있게 한다.
const VISIT_STATUS_COLORS = {
  ok: '#2E7D53',
  caution: '#F0AC42',
  unknown: '#9AA39B',
};

const svgCache = new Map();

function getBadgeSvg(contentTypeId) {
  const key = String(contentTypeId ?? 'default');
  if (svgCache.has(key)) return svgCache.get(key);

  const { Icon } = CATEGORY_BY_CONTENT_TYPE[contentTypeId] || DEFAULT_CATEGORY;
  const svg = renderToStaticMarkup(createElement(Icon, { size: 16, strokeWidth: 2.5, color: '#fff' }));
  svgCache.set(key, svg);
  return svg;
}

function getPawSvg() {
  const key = 'status-paw';
  if (svgCache.has(key)) return svgCache.get(key);

  const svg = renderToStaticMarkup(createElement(PawPrint, { size: 16, strokeWidth: 2.5, color: '#fff' }));
  svgCache.set(key, svg);
  return svg;
}

// MapLibre Marker는 DOM 엘리먼트를 직접 받는다 (Leaflet의 divIcon과 달리 아이콘 객체가 아님)
// visitLevel이 주어지면(대표 강아지 등록 상태) 카테고리색 대신 방문 가능 여부 색으로 표시한다.
export function createFacilityMarkerElement(contentTypeId, visitLevel) {
  const el = document.createElement('div');
  el.className = 'facility-marker__badge';

  if (visitLevel) {
    el.style.background = VISIT_STATUS_COLORS[visitLevel] ?? VISIT_STATUS_COLORS.unknown;
    el.innerHTML = getPawSvg();
    return el;
  }

  const { color } = CATEGORY_BY_CONTENT_TYPE[contentTypeId] || DEFAULT_CATEGORY;
  el.style.background = color;
  el.innerHTML = getBadgeSvg(contentTypeId);
  return el;
}
