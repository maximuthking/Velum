// 파일 경로: src/components/ui/LoginUI.tsx

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import './LoginUI.css';

export const LoginUI = () => {
  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Firebase 팝업을 통해 구글 로그인을 시도합니다.
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <h1>Velum</h1>
        <p>A Healing Adventure Game</p>
        <button className="google-login-button" onClick={handleGoogleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};
