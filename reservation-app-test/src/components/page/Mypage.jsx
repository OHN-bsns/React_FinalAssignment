import React, { useState, useEffect } from "react";
import "./Mypage.css";
import { auth, db, fetchUserName, fetchBookedTimes } from "../../firebase";
import LogoutButton from "../button/LogoutButton";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import ReservationChange from "../Modal/ReservationChange";

const Mypage = () => {
  const [userName, setUserName] = useState("ユーザー");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null); // 初期値をnullに変更
  const [reservations, setReservations] = useState([]); // reservationsを定義
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [bookedTimes, setBookedTimes] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const name = await fetchUserName(currentUser.uid);
          setUserName(name || "ユーザー");

          const reservationsRef = collection(db, "reservations");
          const q = query(
            reservationsRef,
            where("userId", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(q);

          const fetchedReservations = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // 最新の予約を取得する
          const latestReservation = fetchedReservations.reduce(
            (latest, current) => {
              return !latest || new Date(current.date) > new Date(latest.date)
                ? current
                : latest;
            },
            null
          );

          setReservations(fetchedReservations);
          setNotification(latestReservation || null); // nullを設定
        } catch (error) {
          setError("ユーザー情報の取得に失敗しました。");
          console.error("Error fetching user data:", error.message);
        }
      } else {
        setError("ユーザーがログインしていません。");
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // const updateNotification = () => {
  // };

  useEffect(() => {
    const fetchBookedTimesForDate = async (date) => {
      try {
        const times = await fetchBookedTimes(date);
        setBookedTimes(times);
      } catch (error) {
        console.error("Error fetching booked times:", error.message);
      }
    };

    if (selectedReservation && selectedReservation.date) {
      fetchBookedTimesForDate(selectedReservation.date);
    }
  }, [selectedReservation]);

  const handleEditClick = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedReservation) => {
    if (selectedReservation) {
      try {
        const reservationRef = doc(db, "reservations", selectedReservation.id);

        const reservationDoc = await getDoc(reservationRef);
        if (!reservationDoc.exists()) {
          console.error("Reservation does not exist.");
          return;
        }

        await updateDoc(reservationRef, updatedReservation);

        setReservations((prev) =>
          prev.map((r) =>
            r.id === selectedReservation.id
              ? { ...r, ...updatedReservation }
              : r
          )
        );

        setNotification(updatedReservation);
      } catch (error) {
        console.error("Error updating reservation:", error.message);
      }
    } else {
      console.error(
        "Selected reservation or updated reservation is not defined."
      );
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="Mypage-wrap">
      <h2>{userName}さんのマイページ</h2>
      <div className="message-box">
        <h3>お知らせ</h3>
        {notification ? (
          <div className="notification-box">
            <p>ご予約ありがとうございます！ 以下の内容で受け付けました。</p>
            <div className="line-box">
              <p className="in-menu">来店日　　： {notification.date}</p>
              <p className="in-menu">予約時間　： {notification.time}~</p>
              <p className="in-menu">
                来店人数　： {notification.numberOfPeople}名
              </p>
              <p className="in-menu">
                予約内容　： {notification.reservationType}
              </p>
              <p className="in-menu">アレルギー： {notification.allergies}</p>
              <p className="in-menu">ご要望　　： {notification.comments}</p>
            </div>
            <p className="attention">
              ※コース予約のキャンセルにつきましては、コース料金の50％をキャンセル料として頂戴いたします。
            </p>
            <button
              className="change-btn"
              onClick={() => handleEditClick(notification)}
            >
              予約内容の変更
            </button>
          </div>
        ) : (
          <p>お知らせはありません</p>
        )}
      </div>
      <div className="lo-btnbox">
        <LogoutButton />
      </div>
      <ReservationChange
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reservation={selectedReservation}
        onSave={handleSave}
        bookedTimes={bookedTimes}
      />
    </div>
  );
};

export default Mypage;
