// 파일 경로: src/store/playerStore.ts (새 파일)

import { atom } from 'jotai';

// 플레이어의 현재 골드를 저장하는 atom. 초기값은 0입니다.
export const playerGoldAtom = atom(0);