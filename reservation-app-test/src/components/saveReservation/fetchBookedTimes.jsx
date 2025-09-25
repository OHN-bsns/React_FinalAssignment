import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const MAX_BOOKINGS_PER_TIME = 3;

const fetchBookedTimes = async (date) => {
  const bookedTimes = {};
  const q = query(collection(db, "reservations"), where("date", "==", date));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.time) {
      bookedTimes[data.time] = (bookedTimes[data.time] || 0) + 1;
    }
  });

  return bookedTimes;
};

const isTimeAvailable = (bookedTimes, time) => {
  return (bookedTimes[time] || 0) < MAX_BOOKINGS_PER_TIME;
};

export { fetchBookedTimes, isTimeAvailable };
