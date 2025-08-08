// 파일 경로: src/components/ui/FishingUI.tsx

import { useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { isFishingAtom, fishingResultAtom } from '../../store/gameStore';
import { playerGoldAtom } from '../../store/playerStore';
import './FishingUI.css';

export const FishingUI = () => {
  const [isFishing, setIsFishing] = useAtom(isFishingAtom);
  const setFishingResult = useSetAtom(fishingResultAtom);
  const setPlayerGold = useSetAtom(playerGoldAtom);

  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [successZone, setSuccessZone] = useState({ start: 0, width: 0 });
  
  const indicatorPositionRef = useRef(0);
  const direction = useRef(1);
  const speed = 150;

  useEffect(() => {
    if (isFishing) {
      // 미니게임 시작 시 성공 영역을 한 번만 설정합니다.
      const width = 50 + Math.random() * 50;
      const start = Math.random() * (400 - width);
      setSuccessZone({ start, width });

      setIndicatorPosition(0);
      indicatorPositionRef.current = 0;
      direction.current = 1;

      let lastTime = 0;
      let animationFrameId: number;
      const animate = (time: number) => {
        if (lastTime !== 0) {
          const deltaTime = (time - lastTime) / 1000;
          setIndicatorPosition(prev => {
            let newPos = prev + direction.current * speed * deltaTime;
            if (newPos > 396 || newPos < 0) {
              direction.current *= -1;
              newPos = Math.max(0, Math.min(396, newPos));
            }
            indicatorPositionRef.current = newPos;
            return newPos;
          });
        }
        lastTime = time;
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);

      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          cancelAnimationFrame(animationFrameId);
          
          const finalPos = indicatorPositionRef.current;
          
          // successZone state는 이 effect 스코프가 생성될 때의 값을 참조하므로,
          // 최신 값을 사용하기 위해 state 업데이트 함수 내부에서 접근합니다.
          setSuccessZone(currentZone => {
            if (finalPos >= currentZone.start && finalPos <= currentZone.start + currentZone.width) {
              setFishingResult('success');
              setPlayerGold((prev) => prev + 10);
              console.log("낚시 성공! +10 Gold");
            } else {
              setFishingResult('fail');
              console.log("낚시 실패!");
            }
            setIsFishing(false);
            return currentZone; // 상태는 변경하지 않음
          });
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [isFishing, setIsFishing, setFishingResult, setPlayerGold]); // 의존성 배열에서 successZone 관련 값을 제거했습니다.

  if (!isFishing) return null;

  return (
    <div className="fishing-ui-container">
      <p>타이밍에 맞춰 SPACE를 누르세요!</p>
      <div className="fishing-bar-background">
        <div 
          className="fishing-bar-success" 
          style={{ left: `${successZone.start}px`, width: `${successZone.width}px` }} 
        />
        <div 
          className="fishing-bar-indicator" 
          style={{ left: `${indicatorPosition}px` }}
        />
      </div>
    </div>
  );
};
