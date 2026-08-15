import { useCallback, useSyncExternalStore } from 'react';

// localStorage에 문자열 Set을 저장하고, 여러 컴포넌트가 같은 값을 구독/갱신할 수 있게 하는 스토어.
// 즐겨찾기 / "내가 추천한 곳" 처럼 로그인 없이 브라우저 단위로 남기는 값에 사용한다.
export function createLocalSetStore(storageKey) {
  function read() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  let current = read();
  const listeners = new Set();

  function write(nextSet) {
    current = nextSet;
    localStorage.setItem(storageKey, JSON.stringify([...nextSet]));
    listeners.forEach((listener) => listener());
  }

  return {
    toggle(id) {
      const key = String(id);
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      write(next);
      return next.has(key);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return current;
    },
  };
}

export function useLocalSet(store) {
  const subscribe = useCallback((cb) => store.subscribe(cb), [store]);
  const getSnapshot = useCallback(() => store.getSnapshot(), [store]);
  const set = useSyncExternalStore(subscribe, getSnapshot);

  return {
    has: (id) => set.has(String(id)),
    toggle: (id) => store.toggle(id),
  };
}
