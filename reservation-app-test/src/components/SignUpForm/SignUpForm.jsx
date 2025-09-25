import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // 追加
import { auth, db } from "../../firebase";
import "./SignUpForm.css";

const SignUpForm = ({ onClose }) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate(); // 追加

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name,
        gender,
        birthdate,
        email,
      });

      if (onClose) onClose();
      alert("登録が完了しました！"); // 登録成功メッセージ
      navigate("/reservation"); // 予約ページにリダイレクト
    } catch (error) {
      console.error("Error details:", error); // エラーオブジェクト全体を表示
      console.error("Error message:", error.message); // エラーメッセージを表示
      console.error("Error code:", error.code); // エラーコードを表示
      
      let errorMessage = "登録に失敗しました。";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "このメールアドレスはすでに使用されています。";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "無効なメールアドレスです。";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "パスワードが弱すぎます。";
      }
      console.error("Error signing up:", errorMessage);
      alert(errorMessage); // ユーザーにエラーメッセージを表示
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>新規会員登録</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">氏名 (カタカナ・フルネームでご記入ください)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">性別</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">選択してください</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="birthdate">生年月日</label>
            <input
              type="date"
              id="birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
            />
          </div>
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
            <label htmlFor="password">パスワード設定 (ログイン時必要となります)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="goSign" type="submit">
            登録
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
