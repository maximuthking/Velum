// 파일 경로: src/store/playerStore.ts (수정된 파일)

import { atom } from 'jotai';

// 플레이어의 현재 골드를 저장하는 atom. 초기값은 0입니다.
export const playerGoldAtom = atom(0);

// 플레이어의 물고기 인벤토리를 저장하는 atom
// Map<물고기 이름, 마리 수> 형태로 저장합니다.
export const fishInventoryAtom = atom<Map<string, number>>(new Map());

// 인벤토리에 있는 모든 물고기의 총 마리 수를 계산하는 파생 atom
export const totalFishCountAtom = atom((get) => {
  const inventory = get(fishInventoryAtom);
  let total = 0;
  inventory.forEach(count => {
    total += count;
  });
  return total;
});
