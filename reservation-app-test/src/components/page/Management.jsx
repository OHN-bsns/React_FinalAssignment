import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Report from "./Report";
import ReservationList from "./ReservationList"; 

const Management = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map((doc) => doc.data());
      setUsers(userList);
      setFilteredUsers(userList);
    };

    fetchUsers();
  }, [db]);

  useEffect(() => {
    const results = users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchQuery, users]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // 特定のメールアドレスでアクセス制限を設定
        const allowedEmail = "hoge@gmail.com";
        setHasAccess(user.email === allowedEmail);
      } else {
        setCurrentUser(null);
        setHasAccess(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const genderMap = {
    male: "男性",
    female: "女性",
  };

  if (currentUser === null) {
    return (
      <div className="centered-message">
        <div>ログインしてください。</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="centered-message">
        <div>このページにアクセスする権限がありません。</div>
      </div>
    );
  }

  return (
    <div className="management-container">
      {/* タブのナビゲーション */}
      <nav className="management-nav">
        <Link to="user-list" className="management-nav-button">
          登録者一覧
        </Link>
        <Link to="report" className="management-nav-button">
          登録者データ
        </Link>
        <Link to="reservation-list" className="management-nav-button">
          予約一覧
        </Link>
      </nav>

      {/* 検索バー */}
      <div className="search-container">
        <input
          type="text"
          placeholder="氏名検索..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* タブのコンテンツ */}
      <Routes>
        <Route
          path="user-list"
          element={
            <div className="user-list">
              <div className="title-Mana"> 登録者一覧</div>
              {filteredUsers.map((user, index) => (
                <div key={index} className="user-card">
                  <p>氏名: {user.name}</p>
                  <p>性別: {genderMap[user.gender]}</p>
                  <p>生年月日: {user.birthdate}</p>
                  <p>メール: {user.email}</p>
                </div>
              ))}
            </div>
          }
        />
        <Route path="report" element={<Report />} />
        <Route path="reservation-list" element={<ReservationList />} />
        <Route path="/" element={<Navigate to="user-list" />} />
      </Routes>
    </div>
  );
};

export default Management;
