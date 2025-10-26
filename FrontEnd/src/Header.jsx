import React from "react";

// Usamos 'export function' porque lo importas con { }
export function Header({ onMenuClick, isMirrorsOn, onToggleChange }) {
    return (
        <header className="app-header">
            <button onClick={onMenuClick}>☰</button>
            <h2>Mirrors</h2>
            <label>
                Activo:
                <input
                    type="checkbox"
                    checked={isMirrorsOn}
                    onChange={onToggleChange}
                />
            </label>
        </header>
    );
}