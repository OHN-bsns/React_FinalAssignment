import React from "react";
import "./LoginButton.css";

const LoginButton = ({ onClick }) => {
  return (
    <button type="button" className="login-btn" onClick={onClick}>
      ログイン
    </button>
  );
};

export default LoginButton;
