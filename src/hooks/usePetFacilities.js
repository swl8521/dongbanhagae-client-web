import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPetFacilities } from '../api/client';
import { getFriendlyErrorMessage } from '../lib/errorMessage';
import { readHomeListCache, writeHomeListCache } from '../lib/homeListCache';

const PAGE_SIZE = 20;

export function usePetFacilities({ areaCode, contentTypeId, keyword, mapX, mapY, radius, cacheKey } = {}) {
  // cacheKey는 필터가 없을 때 빈 문자열일 수 있어서 truthy가 아니라 undefined 여부로 판단한다.
  const cached = cacheKey !== undefined ? readHomeListCache(cacheKey) : null;

  const [items, setItems] = useState(cached?.items ?? []);
  const [totalCount, setTotalCount] = useState(cached?.totalCount ?? 0);
  const [pageNo, setPageNo] = useState(cached?.pageNo ?? 1);
  const [status, setStatus] = useState(cached ? 'done' : 'idle'); // idle | loading | loading-more | error | done
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  // 캐시로 복원된 첫 렌더에서는 이미 있는 데이터를 그대로 쓰고, 굳이 다시 불러오지 않는다 -
  // 목록 -> 상세 -> 뒤로가기 흐름에서 스크롤 위치가 살아있으려면 페이지 수/아이템이 그대로여야 한다.
  const skipNextFetch = useRef(!!cached);

  // 필터(지역/검색어/내 주변 좌표)가 바뀌면 처음부터 새로 불러온다.
  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

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

  // 불러온 목록은 필터 조건별로 계속 캐시에 반영해서, 상세화면에 다녀와도 이어서 쓸 수 있게 한다.
  useEffect(() => {
    if (cacheKey !== undefined) writeHomeListCache(cacheKey, { items, totalCount, pageNo });
  }, [cacheKey, items, totalCount, pageNo]);

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
