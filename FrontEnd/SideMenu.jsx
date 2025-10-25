import React from "react";

// Usamos 'export function' porque lo importas con { }
export function SideMenu({ ahorro, saldo, onClose }) {
  return (
    <div className="sidemenu-backdrop" onClick={onClose}>
      <div className="sidemenu" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="sidemenu-close-btn">
          X
        </button>
        <h3>Mis Cuentas</h3>
        <div>
          <p>Saldo Normal:</p>
          <h4>${saldo.toFixed(2)}</h4>
        </div>
        <div>
          <p>Ahorro Mirrors:</p>
          <h4>${ahorro.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  );
}
