// 파일 경로: src/store/shipStore.ts

import { atom } from 'jotai';

// 배의 현재 내구도를 저장하는 atom. 초기값은 100입니다.
export const shipHealthAtom = atom(100);

// 배의 최대 내구도를 저장하는 atom.
export const shipMaxHealthAtom = atom(100);

// 현재 내구도 비율을 계산하는 파생 atom (읽기 전용).
export const shipHealthPercentageAtom = atom((get) => {
  const current = get(shipHealthAtom);
  const max = get(shipMaxHealthAtom);
  return (current / max) * 100;
});
