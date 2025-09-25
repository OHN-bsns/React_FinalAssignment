import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCalendarDays,
  faUser,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ isAuth }) => {
  return (
    <nav className="navnav">
      {!isAuth && (
        <Link to="/">
          <FontAwesomeIcon icon={faHouse} />
          TOP
        </Link>
      )}
      {isAuth && (
        <>
          <Link to="/reservation">
            <FontAwesomeIcon icon={faCalendarDays} />
            予約する
          </Link>
          <Link to="/mypage">
            <FontAwesomeIcon icon={faUser} />
            マイページ
          </Link>
          <Link to="/management">
            <FontAwesomeIcon icon={faListCheck} />
            管理
          </Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
