// 파일 경로: src/store/stores.ts

import { atom } from 'jotai';
import { create } from 'zustand';
import type { User } from 'firebase/auth'; // 'type' 키워드 추가

//================================//
// Auth Store (Jotai)
//================================//
type AuthState = {
  isLoading: boolean;
  user: User | null;
}
export const authStateAtom = atom<AuthState>({
  isLoading: true,
  user: null,
});

//================================//
// Game State Store (Jotai)
//================================//
export const isFishingAtom = atom(false);
export const fishingResultAtom = atom<string | null>(null);
export const isInHarborAtom = atom(false);
export const isInventoryOpenAtom = atom(false);

//================================//
// Player Store (Jotai)
//================================//
export const playerGoldAtom = atom(0);
export const fishInventoryAtom = atom<Map<string, number>>(new Map());
export const totalFishCountAtom = atom((get) => {
  const inventory = get(fishInventoryAtom);
  let total = 0;
  inventory.forEach(count => {
    total += count;
  });
  return total;
});
export const playerNicknameAtom = atom('Player');

//================================//
// Ship Store (Jotai)
//================================//
export const shipHealthAtom = atom(100);
export const shipMaxHealthAtom = atom(100);
export const shipHealthPercentageAtom = atom((get) => {
  const current = get(shipHealthAtom);
  const max = get(shipMaxHealthAtom);
  return (current / max) * 100;
});

//================================//
// Multiplayer Store (Zustand)
//================================//
export interface PlayerState {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
}

interface MultiplayerState {
  players: Record<string, PlayerState>;
  addPlayer: (id: string, player: PlayerState) => void;
  removePlayer: (id:string) => void;
  updatePlayer: (id: string, player: Partial<PlayerState>) => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set) => ({
  players: {},
  addPlayer: (id, player) => set((state) => ({
    players: { ...state.players, [id]: player }
  })),
  removePlayer: (id) => set((state) => {
    const newPlayers = { ...state.players };
    delete newPlayers[id];
    return { players: newPlayers };
  }),
  updatePlayer: (id, playerUpdate) => set((state) => ({
    players: {
      ...state.players,
      [id]: { ...state.players[id], ...playerUpdate }
    }
  })),
}));
