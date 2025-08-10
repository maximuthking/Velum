// 파일 경로: src/components/AuthManager.tsx

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebaseConfig';
import { authStateAtom } from '../store/stores';

// Firestore에 플레이어 데이터를 생성하거나 확인하는 함수
const getOrCreatePlayer = async (user: User) => {
  // 'players' 컬렉션에서 유저의 고유 ID(uid)를 이름으로 하는 문서를 참조합니다.
  const playerDocRef = doc(db, "players", user.uid);
  const playerDoc = await getDoc(playerDocRef);

  // 만약 해당 유저의 데이터가 Firestore에 없다면 (첫 로그인이라면)
  if (!playerDoc.exists()) {
    // 새로운 플레이어 데이터를 생성합니다.
    await setDoc(playerDocRef, {
      uid: user.uid,
      nickname: user.displayName || "Adventurer", // 구글 계정 이름을 기본 닉네임으로 사용
      gold: 0,
      shipHealth: 100,
      inventory: {}, // 인벤토리는 비어있는 객체로 시작
      lastPosition: [0, 0, 0], // 초기 위치
    });
    console.log(`New player created: ${user.uid}`);
  }
};

export const AuthManager = () => {
  const setAuthState = useSetAtom(authStateAtom);

  useEffect(() => {
    // Firebase의 인증 상태 변경을 구독합니다.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 사용자가 로그인했다면, Firestore에 데이터가 있는지 확인/생성합니다.
        await getOrCreatePlayer(user);
      }
      // 로딩 상태를 false로 설정하고, user 객체를 저장합니다.
      setAuthState({ user, isLoading: false });
    });

    // 컴포넌트가 언마운트될 때 구독을 해제하여 메모리 누수를 방지합니다.
    return () => unsubscribe();
  }, [setAuthState]);

  // 이 컴포넌트는 UI를 렌더링하지 않으므로 null을 반환합니다.
  return null;
};
