import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import Modal from "../Modal/Modal";
import { saveReservation } from "../saveReservation/saveReservation";
import { getCurrentUserId } from "../../firebase";
import {
  fetchBookedTimes,
  isTimeAvailable,
} from "../saveReservation/fetchBookedTimes";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const db = getFirestore();

function Calendar({ date }) {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [reservationDetails, setReservationDetails] = useState({
    time: "",
    numberOfPeople: "",
    reservationType: "",
    allergies: "",
    comments: "",
  });
  const [bookedTimes, setBookedTimes] = useState({});
  const [isConfirming, setIsConfirming] = useState(false);

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (selectedDate) {
      fetchReservationsFromDatabase(selectedDate);
      fetchBookedTimes(selectedDate).then(setBookedTimes);
    }
  }, [selectedDate]);

  const handleDateClick = (arg) => {
    if (arg.dateStr < today) {
      alert("過去の日付は選択できません。");
      return;
    }
    setSelectedDate(arg.dateStr);
    setModalIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservationDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleConfirm = () => {
    setIsConfirming(true);
  };

  const handleSubmit = async () => {
    if (
      !reservationDetails.time ||
      !reservationDetails.numberOfPeople ||
      !reservationDetails.reservationType
    ) {
      alert("時間、人数、予約内容は必須項目です。");
      return;
    }

    try {
      const userId = getCurrentUserId();

      await saveReservation({
        date: selectedDate,
        time: reservationDetails.time,
        numberOfPeople: reservationDetails.numberOfPeople,
        reservationType: reservationDetails.reservationType,
        allergies: reservationDetails.allergies,
        comments: reservationDetails.comments,
        userId: userId,
      });
      alert("予約が完了しました！");
      navigate("/mypage");
    } catch (error) {
      alert("予約の保存中にエラーが発生しました。");
    }

    setModalIsOpen(false);
    setIsConfirming(false);
    setReservationDetails({
      time: "",
      numberOfPeople: "",
      reservationType: "",
      allergies: "",
      comments: "",
    });
  };

  const handleCancel = () => {
    setModalIsOpen(false);
    setIsConfirming(false);
    setReservationDetails({
      time: "",
      numberOfPeople: "",
      reservationType: "",
      allergies: "",
      comments: "",
    });
  };

  const fetchReservationsFromDatabase = (date) => {
    const reservationsRef = collection(db, "reservations");
    const q = query(reservationsRef, where("date", "==", date));
    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => doc.data());
      console.log("Reservations data:", data);
    });
  };

  useEffect(() => {
    const userId = getCurrentUserId();
    const reservationsRef = collection(db, "reservations");

    const q = query(reservationsRef, where("userId", "==", userId));
    getDocs(q).then((querySnapshot) => {
      const events = [];
      querySnapshot.forEach((doc) => {
        const reservation = doc.data();
        events.push({
          title: `予約済み: ${reservation.time}`,
          date: reservation.date,
        });
      });
      setEvents(events);
    });
  }, []);

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        locale={jaLocale}
      />

      <Modal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)}>
        <h2>{isConfirming ? "予約内容の確認" : "予約フォーム"}</h2>
        <p>日付: {selectedDate}</p>
        <form>
          {!isConfirming ? (
            <>
              <div>
                <label htmlFor="time">
                  予約時間をお選びください <span>※必須</span>
                </label>
                <select
                  id="time"
                  name="time"
                  value={reservationDetails.time}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">選択してください</option>
                  {[
                    "17:00",
                    "17:30",
                    "18:00",
                    "18:30",
                    "19:00",
                    "19:30",
                    "20:00",
                    "20:30",
                    "21:00",
                    "21:30",
                  ].map((time) => (
                    <option
                      key={time}
                      value={time}
                      disabled={!isTimeAvailable(bookedTimes, time)}
                    >
                      {time} {!isTimeAvailable(bookedTimes, time) && "✕"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="numberOfPeople">
                  予約人数をご入力ください<span>※必須</span>
                </label>
                <input
                  type="number"
                  id="numberOfPeople"
                  name="numberOfPeople"
                  value={reservationDetails.numberOfPeople}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="reservationType">
                  予約内容をお選びください<span>※必須</span>
                </label>
                <select
                  id="reservationType"
                  name="reservationType"
                  value={reservationDetails.reservationType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">選択してください</option>
                  <option value="コース予約">コース予約</option>
                  <option value="席予約">席予約</option>
                </select>
              </div>
              <div>
                <label htmlFor="allergies">
                  食物アレルギーをお持ちの方はご記入ください
                </label>
                <textarea
                  id="allergies"
                  name="allergies"
                  value={reservationDetails.allergies}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div>
                <label htmlFor="comments">
                  ご要望がございましたらご記入ください
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={reservationDetails.comments}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <button type="button" onClick={handleConfirm}>
                確認
              </button>
              <button type="button" onClick={handleCancel}>
                キャンセル
              </button>
            </>
          ) : (
            <>
              <p>予約内容</p>
              <p>時間: {reservationDetails.time}</p>
              <p>人数: {reservationDetails.numberOfPeople}</p>
              <p>予約内容: {reservationDetails.reservationType}</p>
              <p>食物アレルギー: {reservationDetails.allergies}</p>
              <p>ご要望: {reservationDetails.comments}</p>
              <button type="button" onClick={handleSubmit}>
                予約を確定する
              </button>
              <button type="button" onClick={handleCancel}>
                キャンセル
              </button>
            </>
          )}
        </form>
      </Modal>
    </>
  );
}

export default Calendar;
