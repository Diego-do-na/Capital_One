import React from "react";
import ReactDOM from "react-dom/client";
import MirrorsModule from "./MirrorsModule"; // El import que corregimos antes
import "./styles.css"; // <-- ¡AÑADE ESTA LÍNEA!

const rootElement = document.getElementById("root")!;

// --- UNA SOLA VEZ ---
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MirrorsModule />
  </React.StrictMode>
);
