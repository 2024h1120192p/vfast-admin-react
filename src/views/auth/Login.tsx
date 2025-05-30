import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import '../../utils/google-login';
import { Typography } from 'antd';

const { Title } = Typography;

// Add these types at the top of the file or in a global.d.ts if you prefer
declare global {
  interface Window {
    google?: any;
    handleCredentialResponse?: (response: any) => void;
  }
}

const Login: React.FC = () => {
  const googleDiv = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const initializeGoogleLogin = () => {
    if (window.google && window.google.accounts && googleDiv.current) {
      window.google.accounts.id.initialize({
        client_id: "464794475879-742k1rji25rb0bg25lp0cv0c9l5n1ljj.apps.googleusercontent.com",
        callback: window.handleCredentialResponse,
        ux_mode: "popup",
      });
      window.google.accounts.id.renderButton(googleDiv.current, {
        theme: "filled_black",
        size: "large",
        text: "sign_in_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    }
  };

  useEffect(() => {
    // Redirect if authtoken exists
    if (localStorage.getItem('authToken')) {
      navigate('/');
      return;
    }

    // Dynamically add reCAPTCHA script only on login
    let recaptchaScript = document.getElementById('recaptcha-script');
    if (!recaptchaScript) {
      recaptchaScript = document.createElement('script');
      recaptchaScript.id = 'recaptcha-script';
      (recaptchaScript as HTMLScriptElement).src = 'https://www.google.com/recaptcha/api.js?render=6Le-7tUqAAAAAPCCz_3w1K_MoMkrzxajcDZ_GTA9';
      (recaptchaScript as HTMLScriptElement).async = true;
      (recaptchaScript as HTMLScriptElement).defer = true;
      document.head.appendChild(recaptchaScript);
    }

    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        initializeGoogleLogin();
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (recaptchaScript && recaptchaScript.parentNode) {
        recaptchaScript.parentNode.removeChild(recaptchaScript);
      }
    };
  }, [navigate]);

  return (
    <section className="login-section">
      <div className="login-container">
        <img src="https://www.bits-pilani.ac.in/wp-content/uploads/bits-pillani-2-1.webp" alt="BITS Pilani Logo" className="login-logo" />
        <Title level={3}>Login with Google</Title>
        <div ref={googleDiv} className="google-btn-container" />
      </div>
    </section>
  );
};

export default Login;