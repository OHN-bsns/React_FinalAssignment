import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "./Report.css"; // CSSファイルのインポート

const fetchUsersData = async () => {
  const usersCollection = collection(db, "users");
  const usersSnapshot = await getDocs(usersCollection);
  const usersList = usersSnapshot.docs.map((doc) => doc.data());
  return usersList;
};

// データ取得
const calculateAge = (birthdate) => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const categorizeAge = (age) => {
  if (age <= 20) return "20歳以下";
  if (age <= 30) return "21-30歳";
  if (age <= 40) return "31-40歳";
  if (age <= 50) return "41-50歳";
  if (age <= 60) return "51-60歳";
  return "61歳以上";
};

// データ集計
const aggregateData = (usersList) => {
  const genderData = { male: 0, female: 0 };
  const ageData = {
    "20歳以下": 0,
    "21-30歳": 0,
    "31-40歳": 0,
    "41-50歳": 0,
    "51-60歳": 0,
    "61歳以上": 0,
  };

  usersList.forEach((user) => {
    if (user.gender === "male") {
      genderData.male++;
    } else if (user.gender === "female") {
      genderData.female++;
    }

    const age = calculateAge(user.birthdate);
    const ageCategory = categorizeAge(age);
    ageData[ageCategory]++;
  });

  return { genderData, ageData };
};

const Report = () => {
  const [genderData, setGenderData] = useState(null);
  const [ageData, setAgeData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const usersList = await fetchUsersData();
      const { genderData, ageData } = aggregateData(usersList);
      setGenderData(genderData);
      setAgeData(ageData);
    };
    loadData();
  }, []);

  if (!genderData || !ageData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="report-container">
      <div className="gender-stats">
        <h2>登録者の男女比率</h2>
        <p>男性: {genderData.male}人</p>
        <p>女性: {genderData.female}人</p>
      </div>

      <div className="age-stats">
        <h2>登録者の年齢層</h2>
        {Object.keys(ageData).map((category) => (
          <p key={category}>
            {category}: {ageData[category]}人
          </p>
        ))}
      </div>
    </div>
  );
};

export default Report;
