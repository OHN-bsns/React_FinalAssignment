import React, { useState, useEffect } from "react";
import "./ReservationChange.css";
import {
  fetchBookedTimes,
  isTimeAvailable,
} from "../saveReservation/fetchBookedTimes";

const ReservationChange = ({ isOpen, onClose, reservation, onSave }) => {
  const [updatedReservation, setUpdatedReservation] = useState({});
  const [bookedTimes, setBookedTimes] = useState({});

  useEffect(() => {
    if (reservation && reservation.date) {
      // 現在の予約内容を初期状態に設定
      setUpdatedReservation(reservation);

      // 予約日のブッキング済み時間を取得
      fetchBookedTimes(reservation.date).then(setBookedTimes);
    }
  }, [reservation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedReservation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Updated reservation:", updatedReservation);
    onSave(updatedReservation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>予約内容の変更</h2>
        <form>
          <label htmlFor="date">日付</label>
          <div>
            <input
              type="date"
              id="date"
              name="date"
              value={updatedReservation.date || ""}
              onChange={handleInputChange}
            />
          </div>

          <label htmlFor="time">時間</label>
          <div>
            <select
              id="time"
              name="time"
              value={updatedReservation.time || ""}
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
                  {time} {isTimeAvailable(bookedTimes, time) ? "" : "✕"}
                </option>
              ))}
            </select>
          </div>
          <label htmlFor="numberOfPeople">人数</label>
          <div>
            <input
              type="number"
              id="numberOfPeople"
              name="numberOfPeople"
              value={updatedReservation.numberOfPeople || ""}
              onChange={handleInputChange}
            />
          </div>

          <label htmlFor="reservationType">予約内容</label>
          <div>
            <select
              id="reservationType"
              name="reservationType"
              value={updatedReservation.reservationType || ""}
              onChange={handleInputChange}
            >
              <option value="course">コース予約</option>
              <option value="seat">席予約</option>
            </select>
          </div>
          <label htmlFor="allergies">アレルギー</label>
          <div>
            <textarea
              id="allergies"
              name="allergies"
              value={updatedReservation.allergies || ""}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <label htmlFor="comments">ご要望:</label>
          <div>
            <textarea
              id="comments"
              name="comments"
              value={updatedReservation.comments || ""}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="btn-box">
            <button className="change-Cancel" type="button" onClick={onClose}>
              キャンセル
            </button>
            <button className="change-Save" type="button" onClick={handleSave}>
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationChange;
