import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { applyTheme, getInitialTheme } from "./theme";
import App from "./App";
import "./theme.css";
import "./index.css";

applyTheme(getInitialTheme());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
