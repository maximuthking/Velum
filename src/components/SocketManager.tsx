// 파일 경로: src/components/SocketManager.tsx

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMultiplayerStore, type PlayerState } from '../store/stores'; // 'type' 키워드 추가

const SERVER_URL = 'https://velum-server.onrender.com';

export let socket: Socket;

export const SocketManager = () => {
  const { addPlayer, removePlayer, updatePlayer } = useMultiplayerStore();

  useEffect(() => {
    socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log(`[Socket] connected to server with id: ${socket.id}`);
    });

    socket.on('hello', (data: { players: Record<string, PlayerState> }) => {
      for (const id in data.players) {
        if (id !== socket.id) {
          addPlayer(id, data.players[id]);
        }
      }
    });

    socket.on('userConnected', (player: PlayerState) => {
      console.log(`[Socket] user connected: ${player.id}`);
      addPlayer(player.id, player);
    });

    socket.on('playerMoved', (player: PlayerState) => {
      updatePlayer(player.id, player);
    });

    socket.on('userDisconnected', (id: string) => {
      console.log(`[Socket] user disconnected: ${id}`);
      removePlayer(id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [addPlayer, removePlayer, updatePlayer]);

  return null;
};
