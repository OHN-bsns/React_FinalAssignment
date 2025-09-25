import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import "./ReservationList.css";

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservationsWithUserNames, setReservationsWithUserNames] = useState(
    []
  );
  const db = getFirestore();

  // 予約データの取得
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservationsCollection = collection(db, "reservations");
        const reservationSnapshot = await getDocs(reservationsCollection);
        const reservationList = reservationSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReservations(reservationList);
      } catch (error) {
        console.error("Error fetching reservations:", error.message);
      }
    };

    fetchReservations();
  }, [db]);

  // ユーザーデータの取得 　(uidを会員と照らし合わせて,氏名取得表示)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));

        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUsers();
  }, [db]);

  // 予約データにユーザー名を追加
  useEffect(() => {
    const addUserNamesToReservations = () => {
      const updatedReservations = reservations.map((reservation) => {
        const user = users.find((user) => user.uid === reservation.userId);
        return {
          ...reservation,
          userName: user ? user.name : "不明",
        };
      });

      setReservationsWithUserNames(updatedReservations);
      setLoading(false);
    };

    if (reservations.length > 0 && users.length > 0) {
      addUserNamesToReservations();
    }
  }, [reservations, users]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (reservationsWithUserNames.length === 0) {
    return <p>No reservations found.</p>;
  }

  return (
    <div className="reservation-list">
      <h2>予約一覧</h2>
      {reservationsWithUserNames.map((reservation) => (
        <div key={reservation.id} className="reservation-card">
          <p>予約者名: {reservation.userName}</p>
          <p>来店日: {reservation.date}</p>
          <p>予約時間: {reservation.time}</p>
          <p>予約人数: {reservation.numberOfPeople}</p>
          <p>予約内容: {reservation.reservationType}</p>
          <p>アレルギー: {reservation.allergies}</p>
          <p>ご要望: {reservation.comments}</p>
        </div>
      ))}
    </div>
  );
};

export default ReservationList;
