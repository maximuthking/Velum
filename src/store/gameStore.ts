// 파일 경로: src/store/gameStore.ts (수정된 파일)

import { atom } from 'jotai';

// 현재 낚시 미니게임이 활성화되었는지 여부를 저장하는 atom
export const isFishingAtom = atom(false);

// 낚시 결과를 저장하는 atom ('success', 'fail', or null)
export const fishingResultAtom = atom<string | null>(null);

// 게임 내 시간(0-24시)을 저장하는 atom. 초기값은 오전 8시입니다.
export const timeOfDayAtom = atom(8);

// 플레이어가 항구에 있는지 여부를 저장하는 atom
export const isInHarborAtom = atom(false);

// 인벤토리 UI가 열려있는지 여부를 저장하는 atom
export const isInventoryOpenAtom = atom(false);
