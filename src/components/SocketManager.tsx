// 파일 경로: src/components/SocketManager.tsx

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMultiplayerStore, PlayerState } from '../store/stores';

// 서버 URL을 상수로 정의합니다.
const SERVER_URL = 'https://velum-server.onrender.com';

// 다른 파일에서 소켓 인스턴스를 사용할 수 있도록 export 합니다.
export let socket: Socket;

export const SocketManager = () => {
  // Zustand store에서 플레이어 상태를 관리하는 함수들을 가져옵니다.
  const { addPlayer, removePlayer, updatePlayer } = useMultiplayerStore();

  useEffect(() => {
    // 서버에 연결합니다.
    socket = io(SERVER_URL);

    // 연결 성공 시 이벤트 리스너
    socket.on('connect', () => {
      console.log(`[Socket] connected to server with id: ${socket.id}`);
    });

    // 서버로부터 현재 접속 중인 다른 플레이어 목록을 받습니다.
    socket.on('hello', (data: { players: Record<string, PlayerState> }) => {
      for (const id in data.players) {
        if (id !== socket.id) {
          addPlayer(id, data.players[id]);
        }
      }
    });

    // 새로운 유저가 접속했을 때 이벤트 리스너
    socket.on('userConnected', (player: PlayerState) => {
      console.log(`[Socket] user connected: ${player.id}`);
      addPlayer(player.id, player);
    });

    // 다른 플레이어가 움직였을 때 위치 정보를 받습니다.
    socket.on('playerMoved', (player: PlayerState) => {
      updatePlayer(player.id, player);
    });

    // 다른 유저의 연결이 끊겼을 때 이벤트 리스너
    socket.on('userDisconnected', (id: string) => {
      console.log(`[Socket] user disconnected: ${id}`);
      removePlayer(id);
    });

    // 연결이 끊겼을 때 이벤트 리스너
    socket.on('disconnect', () => {
      console.log('[Socket] disconnected from server');
    });

    // 컴포넌트가 언마운트될 때 소켓 연결을 해제합니다.
    return () => {
      socket.disconnect();
    };
  }, [addPlayer, removePlayer, updatePlayer]);

  // 이 컴포넌트는 UI를 렌더링하지 않으므로 null을 반환합니다.
  return null;
};
