import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  timeout: 8000,
});

export async function fetchPetFacilities({ areaCode, keyword, pageNo, numOfRows, mapX, mapY, radius } = {}) {
  const { data } = await api.get('/api/pet-facilities', {
    params: { areaCode, keyword, pageNo, numOfRows, mapX, mapY, radius },
  });
  return data;
}

export async function fetchPetFacilityDetail(contentId, contentTypeId) {
  const { data } = await api.get(`/api/pet-facilities/${contentId}`, {
    params: { contentTypeId },
  });
  return data;
}

export async function setFacilityRecommend(contentId, recommended) {
  const { data } = await api.post(`/api/pet-facilities/${contentId}/recommend`, { recommended });
  return data;
}

export async function fetchAreaCounts() {
  const { data } = await api.get('/api/pet-facilities/area-counts');
  return data.counts;
}

export default api;
