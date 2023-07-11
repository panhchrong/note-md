import React, { useEffect, useState, createContext } from "react";
import "./index.css";
import App from "./App";
import { HashRouter } from "react-router-dom";
import ReactDOM from "react-dom";

const close = () => {
  window.electron.closeWindow();
};

const minimize = () => {
  window.electron.minimizeWindow();
};

const maximize = () => {
  window.electron.maximizeWindow();
};

export const SettingContext = createContext({} as any);

const Root = () => {
  const [setting, setSetting] = useState({} as any);
  useEffect(() => {
    window.electron.send("get-app-setting").then((setting) => {
      setSetting(setting);
    });
    return () => {
      window.electron.removeAllListeners();
    };
  }, []);
  return (
    <React.StrictMode>
      {Object.keys(setting).length > 0 && (
        <SettingContext.Provider value={setting}>
          <div
            className="fixed top-0 titlebar z-50 w-full text-black flex justify-between"
            style={{ backgroundColor: setting.primary }}
          >
            <div className="ml-4 my-auto">
              <img
                width={20}
                alt="logo"
                src={require("./assets/icons8-note-48.png")}
              />
            </div>
            <div className=" my-auto opacity-50">Note Marker</div>
            <div className="flex buttons">
              <button className="px-4 hover:bg-[#3b4252]" onClick={minimize}>
                —
              </button>
              <button className="px-4 hover:bg-[#3b4252]" onClick={maximize}>
                ☐
              </button>
              <button className="px-5 hover:bg-red-500" onClick={close}>
                ✖
              </button>
            </div>
          </div>
          <div
            className="flex flex-col min-h-screen pb-16 main-content"
            style={{ backgroundColor: setting.primary, color: setting.text }}
          >
            <HashRouter>
              <App />
            </HashRouter>
          </div>
        </SettingContext.Provider>
      )}
    </React.StrictMode>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));
