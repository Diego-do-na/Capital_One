import React from "react";

// Usamos 'export function' porque lo importas con { }
export function SideMenu({ ahorro, saldo, onClose }) {
  return (
    <div className="sidemenu-backdrop" onClick={onClose}>
      <div className="sidemenu" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="sidemenu-close-btn">
          X
        </button>
        <h1>My Accounts</h1><br></br>
        <div>
          <p>Main Account:</p>
          <h4>${saldo.toFixed(2)}</h4>
        </div>
        <div>
          <br></br>
          <p>Savings:</p>
          <h4>${ahorro.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  );
}
