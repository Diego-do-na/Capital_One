import React from "react";

// Usamos 'export function' porque lo importas con { }
export function Header({ onMenuClick, isMirrorsOn, onToggleChange }) {
  return (
    <header className="app-header">
      <button onClick={onMenuClick}>☰</button>
      <label>
        Function Active:
        <input
          type="checkbox"
          checked={isMirrorsOn}
          onChange={onToggleChange}
        />
      </label>
    </header>
  );
}
