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

const svgCache = new Map();

function getBadgeSvg(contentTypeId) {
  const key = String(contentTypeId ?? 'default');
  if (svgCache.has(key)) return svgCache.get(key);

  const { Icon } = CATEGORY_BY_CONTENT_TYPE[contentTypeId] || DEFAULT_CATEGORY;
  const svg = renderToStaticMarkup(createElement(Icon, { size: 16, strokeWidth: 2.5, color: '#fff' }));
  svgCache.set(key, svg);
  return svg;
}

// MapLibre Marker는 DOM 엘리먼트를 직접 받는다 (Leaflet의 divIcon과 달리 아이콘 객체가 아님)
export function createFacilityMarkerElement(contentTypeId) {
  const { color } = CATEGORY_BY_CONTENT_TYPE[contentTypeId] || DEFAULT_CATEGORY;

  const el = document.createElement('div');
  el.className = 'facility-marker__badge';
  el.style.background = color;
  el.innerHTML = getBadgeSvg(contentTypeId);
  return el;
}
