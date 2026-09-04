import { useCallback, useSyncExternalStore } from 'react';

// 로그인 시스템이 없어, favoritesStore와 동일하게 브라우저 localStorage에
// 강아지 프로필(여러 마리 가능)과 "대표 강아지" id를 저장한다.
const STORAGE_KEY = 'dongbanhagae:dog-profiles';
const ACTIVE_KEY = 'dongbanhagae:dog-profiles:active';

export const DOG_SIZE_OPTIONS = [
  { value: 'small', label: '소형견', hint: '10kg 이하' },
  { value: 'medium', label: '중형견', hint: '10~25kg' },
  { value: 'large', label: '대형견', hint: '25kg 초과' },
];

function readDogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readActiveId() {
  try {
    return localStorage.getItem(ACTIVE_KEY) || null;
  } catch {
    return null;
  }
}

function createId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

let dogs = readDogs();
let activeId = readActiveId();
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dogs));
  if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
  else localStorage.removeItem(ACTIVE_KEY);
}

export const dogProfileStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return dogs;
  },
  getActiveIdSnapshot() {
    return activeId;
  },
  add(profile) {
    const dog = { id: createId(), ...profile };
    dogs = [...dogs, dog];
    if (!activeId) activeId = dog.id;
    persist();
    emit();
    return dog;
  },
  update(id, patch) {
    dogs = dogs.map((dog) => (dog.id === id ? { ...dog, ...patch } : dog));
    persist();
    emit();
  },
  remove(id) {
    dogs = dogs.filter((dog) => dog.id !== id);
    if (activeId === id) activeId = dogs[0]?.id ?? null;
    persist();
    emit();
  },
  setActive(id) {
    activeId = id;
    persist();
    emit();
  },
};

export function useDogProfiles() {
  const subscribe = useCallback((listener) => dogProfileStore.subscribe(listener), []);
  const list = useSyncExternalStore(subscribe, () => dogProfileStore.getSnapshot());
  const currentActiveId = useSyncExternalStore(subscribe, () => dogProfileStore.getActiveIdSnapshot());
  const activeDog = list.find((dog) => dog.id === currentActiveId) ?? null;

  return {
    dogs: list,
    activeId: currentActiveId,
    activeDog,
    add: dogProfileStore.add,
    update: dogProfileStore.update,
    remove: dogProfileStore.remove,
    setActive: dogProfileStore.setActive,
  };
}
