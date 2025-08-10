// 파일 경로: src/store/multiplayerStore.ts (새 파일)

import { create } from 'zustand';

// 다른 플레이어의 상태를 정의하는 인터페이스
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
