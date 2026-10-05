import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const resetScroll = () => {
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
};

resetScroll();

window.addEventListener("pageshow", resetScroll);

document.addEventListener("DOMContentLoaded", resetScroll, { once: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
