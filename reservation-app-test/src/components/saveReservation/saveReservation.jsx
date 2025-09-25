import { getFirestore, collection, addDoc } from "firebase/firestore";
import { auth } from "../../firebase";

const db = getFirestore();

export const saveReservation = async (reservationDetails) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("ログインしていません");

  const reservationsRef = collection(db, "reservations");
  await addDoc(reservationsRef, {
    userId: currentUser.uid,
    ...reservationDetails,
    createdAt: new Date(),
  });
};
