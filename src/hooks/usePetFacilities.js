import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPetFacilities } from '../api/client';
import { getFriendlyErrorMessage } from '../lib/errorMessage';

const PAGE_SIZE = 20;

export function usePetFacilities({ areaCode, contentTypeId, keyword, mapX, mapY, radius } = {}) {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [status, setStatus] = useState('idle'); // idle | loading | loading-more | error | done
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  // 필터(지역/검색어/내 주변 좌표)가 바뀌면 처음부터 새로 불러온다.
  useEffect(() => {
    const currentRequest = ++requestId.current;
    setStatus('loading');
    setError(null);

    fetchPetFacilities({ areaCode, contentTypeId, keyword, mapX, mapY, radius, pageNo: 1, numOfRows: PAGE_SIZE })
      .then((data) => {
        if (requestId.current !== currentRequest) return;
        setItems(data.items || []);
        setTotalCount(data.totalCount || 0);
        setPageNo(1);
        setStatus('done');
      })
      .catch((err) => {
        if (requestId.current !== currentRequest) return;
        setError(getFriendlyErrorMessage(err));
        setStatus('error');
      });
  }, [areaCode, contentTypeId, keyword, mapX, mapY, radius]);

  const hasMore = items.length < totalCount;

  const loadMore = useCallback(() => {
    if (status === 'loading' || status === 'loading-more' || !hasMore) return;

    const currentRequest = ++requestId.current;
    const nextPage = pageNo + 1;
    setStatus('loading-more');

    fetchPetFacilities({ areaCode, contentTypeId, keyword, mapX, mapY, radius, pageNo: nextPage, numOfRows: PAGE_SIZE })
      .then((data) => {
        if (requestId.current !== currentRequest) return;
        setItems((prev) => [...prev, ...(data.items || [])]);
        setPageNo(nextPage);
        setStatus('done');
      })
      .catch((err) => {
        if (requestId.current !== currentRequest) return;
        setError(getFriendlyErrorMessage(err));
        setStatus('error');
      });
  }, [areaCode, contentTypeId, keyword, mapX, mapY, radius, pageNo, status, hasMore]);

  const patchItem = useCallback((contentId, patch) => {
    setItems((prev) => prev.map((it) => (it.contentid === contentId ? { ...it, ...patch } : it)));
  }, []);

  return { items, status, error, hasMore, loadMore, patchItem, totalCount };
}
