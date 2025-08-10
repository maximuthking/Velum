// 파일 경로: src/App.tsx

import { Suspense } from 'react'; // 사용하지 않는 React import 제거
import { Canvas } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { Leva } from 'leva';

// 컴포넌트 Import
import { Scene } from './components/Scene';
import { GameUI } from './components/ui/GameUI';
import { SocketManager } from './components/SocketManager';
import { AuthManager } from './components/AuthManager';
import { LoginUI } from './components/ui/LoginUI';

// 상태 관리 Store Import
import { authStateAtom } from './store/stores';

// 메인 게임 컴포넌트
const Game = () => {
  return (
    <>
      <SocketManager />
      <Canvas shadows camera={{ position: [0, 30, 30], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <GameUI />
      <Leva collapsed />
    </>
  );
}

// 애플리케이션 루트 컴포넌트
function App() {
  const { user, isLoading } = useAtomValue(authStateAtom);

  return (
    <>
      <AuthManager />
      {isLoading ? (
        <div className="loading-screen">로딩 중...</div>
      ) : user ? (
        <Game />
      ) : (
        <LoginUI />
      )}
    </>
  );
}

export default App;
