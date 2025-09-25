import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/page/Home";
import Reservation from "./components/page/Reservation";
import Management from "./components/page/Management";
import Client from "./components/page/Client";
import Report from "./components/page/Report";
import Logout from "./components/page/Logout";
import Navbar from "./components/root/Navbar";
import Mypage from "./components/page/Mypage";
import { auth } from "./firebase";
import { useState, useEffect } from "react";

function App() {
  const [isAuth, setIsAuth] = useState(
    localStorage.getItem("isAuth") === "true"
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuth(true);
        localStorage.setItem("isAuth", "true");
      } else {
        setIsAuth(false);
        localStorage.setItem("isAuth", "false");
      }
    });
    return () => unsubscribe(); // クリーンアップ
  }, []);

  return (
    <div className="App">
      <Router>
        <Navbar isAuth={isAuth} />
        <Routes>
          <Route path="/" element={<Home setIsAuth={setIsAuth} />}></Route>
          <Route
            path="/reservation"
            element={<Reservation isAuth={isAuth} />}
          ></Route>
          <Route path="/mypage" element={<Mypage isAuth={isAuth} />}></Route>
          <Route path="/management/*" element={<Management isAuth={isAuth} />}>
            <Route index element={<Client isAuth={isAuth} />} />
            <Route path="report" element={<Report isAuth={isAuth} />} />
          </Route>
          <Route
            path="/logout"
            element={<Logout setIsAuth={setIsAuth} />}
          ></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
