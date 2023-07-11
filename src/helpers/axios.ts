import axios from "axios";
// import { isElectron } from "./electron";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

instance.interceptors.request.use((config) => {
  const apiKeyProperty = process.env.REACT_APP_API_KEY_PROPERTY as string;
  (config.headers as any)[apiKeyProperty] =
    (process.env.REACT_APP_API_KEY as string) || "";
  (config.headers as any)["auth"] =
    localStorage.getItem("file_manager_token") || "";

  return config;
});

// instance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !error.response.config.url.endsWith("unlock")
//     ) {
//       console.log("your are running on electron? ", isElectron());
//       if (isElectron()) {
//         console.log("sendding u back to unlock");
//         window.electron.navigate("/unlock");
//       } else window.location.href = "/unlock";
//     }
//     return Promise.reject(error);
//   }
// );

export default instance;
