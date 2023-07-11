import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import List from "./Pages/List";
import View from "./Pages/View";
import Write from "./Pages/Write";
import Menu from "./components/Menu";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCog } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { SettingContext } from ".";
import Setting from "./Pages/Setting";

export default function App() {
  const setting = useContext(SettingContext);
  const location = useLocation();

  const excludedRoutes = ["/"];
  const nav = useNavigate();

  const back = () => {
    nav("/");
  };

  const toSetting = () => {
    nav("/setting");
  };

  return (
    <>
      {!excludedRoutes.includes(location.pathname) && (
        <div>
          <Menu />
          <button
            className="ml-2 sticky focus:outline-none mb-5"
            onClick={back}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <hr style={{ borderColor: setting.secondary }} />
        </div>
      )}
      <Routes>
        <Route path="/" element={<List />} />
        <Route path="/write" element={<Write />} />
        <Route path="/view" element={<View />} />
        <Route path="/setting" element={<Setting />} />
      </Routes>
      <div
        className="fixed left-0 bottom-0 pb-2 w-full"
        style={{ backgroundColor: setting.primary }}
      >
        <hr style={{ borderColor: setting.secondary }} />
        <button className="focus:outline-none pl-3 pt-1" onClick={toSetting}>
          <FontAwesomeIcon icon={faCog} />
        </button>
      </div>
    </>
  );
}
