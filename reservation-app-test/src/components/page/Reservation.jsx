import React from 'react'
import Calendar from '../layout/Calendar'
import "./Reservation.css";

const Reservation = () => {


  
  return (
    <div className="Reswap">
      <div className="filter">
        <div>予約したい日時を選択してください</div>
      </div>
      <div className="Calendar-box">
        <Calendar></Calendar>
      </div>
    </div>
  );
}

export default Reservation