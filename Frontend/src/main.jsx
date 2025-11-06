import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./contexts/UserContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ToastContainer position="bottom-right" theme="dark" />
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
);
