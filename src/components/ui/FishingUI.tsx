// 파일 경로: src/components/ui/FishingUI.tsx

import { useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { isFishingAtom, fishingResultAtom } from '../../store/stores';
import { fishInventoryAtom } from '../../store/stores';
import { getRandomFish } from '../../data/gameData';
import './FishingUI.css';

export const FishingUI = () => {
  const [isFishing, setIsFishing] = useAtom(isFishingAtom);
  const setFishingResult = useSetAtom(fishingResultAtom);
  const setFishInventory = useSetAtom(fishInventoryAtom);

  // indicatorPosition은 화면에 표시될 상태값입니다.
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  // successZone은 성공 영역의 위치와 너비를 저장하는 상태값입니다.
  const [successZone, setSuccessZone] = useState({ start: 0, width: 0 });
  
  // 애니메이션 루프에서 항상 최신 위치 값을 참조하기 위해 ref를 사용합니다.
  const indicatorPositionRef = useRef(0);
  const direction = useRef(1);
  const speed = 150;
  const hasCaught = useRef(false);

  useEffect(() => {
    if (isFishing) {
      hasCaught.current = false;
      const width = 50 + Math.random() * 50;
      const start = Math.random() * (400 - width);
      setSuccessZone({ start, width });

      // 애니메이션 시작 시 위치 초기화
      indicatorPositionRef.current = 0;
      setIndicatorPosition(0);
      direction.current = 1;

      let lastTime = 0;
      let animationFrameId: number;
      const animate = (time: number) => {
        if (lastTime !== 0) {
          const deltaTime = (time - lastTime) / 1000;
          
          // ref를 사용하여 다음 위치를 계산합니다.
          let newPos = indicatorPositionRef.current + direction.current * speed * deltaTime;

          if (newPos > 396 || newPos < 0) {
            direction.current *= -1;
            newPos = Math.max(0, Math.min(396, newPos));
          }
          
          // ref와 state를 모두 업데이트합니다.
          indicatorPositionRef.current = newPos;
          setIndicatorPosition(newPos);
        }
        lastTime = time;
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);

      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          if (hasCaught.current) return;
          hasCaught.current = true;

          cancelAnimationFrame(animationFrameId);
          
          const finalPos = indicatorPositionRef.current;
          
          setSuccessZone(currentZone => {
            if (finalPos >= currentZone.start && finalPos <= currentZone.start + currentZone.width) {
              const caughtFish = getRandomFish();
              setFishingResult(`잡았다! (${caughtFish.name})`);
              setFishInventory(prevInventory => {
                const newInventory = new Map(prevInventory);
                const currentCount = newInventory.get(caughtFish.name) || 0;
                newInventory.set(caughtFish.name, currentCount + 1);
                return newInventory;
              });
            } else {
              setFishingResult('fail');
            }
            setIsFishing(false);
            return currentZone;
          });
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [isFishing, setIsFishing, setFishingResult, setFishInventory]);

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
