import React, { useState } from "react";
import "./Home.css";
import LoginButton from "../button/LoginButton";
import SignUpForm from "../SignUpForm/SignUpForm";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";


const Home = ({ setIsAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [error, setError] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    setShowSignUp(true);
  };

  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

 const handleSubmit = async (e) => {
   e.preventDefault();

   try {
     // Firebase Authentication サインイン
     await signInWithEmailAndPassword(auth, email, password);

     setError("");

     // ログイン成功後に localStorage と状態を更新
     localStorage.setItem("isAuth", "true");
     setIsAuth(true);

     // 予約ページへ遷移
     navigate("/reservation");
   } catch (error) {
     // エラーメッセージを設定
     if (
       error.code === "auth/user-not-found" ||
       error.code === "auth/wrong-password"
     ) {
       setError("メールアドレスまたはパスワードが間違っています。");
     } else {
       setError("ログインに失敗しました。");
     }
     console.error("Error signing in:", error.message);
   }
 };


  return (
    <div className="home-wrap">
      <div className="home-box">
        <h1>予約はこちらから</h1>
        <div className="btn-box">
          <div className="login-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">パスワード</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <LoginButton onClick={handleSubmit} />
            </form>
          </div>

          <button className="out" onClick={handleSignUpClick}>
            新規会員登録はこちら
          </button>
        </div>
      </div>

      {showSignUp && <SignUpForm onClose={handleCloseSignUp} />}
    </div>
  );
};

export default Home;
