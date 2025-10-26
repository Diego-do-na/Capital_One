// frontend/src/SideMenu.jsx

import React from "react";

// Usamos 'export function' porque lo importas con { }
export function SideMenu({ ahorro, saldo, onClose, onNavigateHistory }) {
    return (
        <div className="sidemenu-backdrop" onClick={onClose}>
            <div className="sidemenu" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="sidemenu-close-btn">
                    X
                </button>
                <h3>Mis Cuentas</h3>

                <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    <p>Saldo Normal:</p>
                    {/* ⬅️ Corrección: Usamos '?? 0' para evitar toFixed(2) en null */}
                    <h4>${(saldo ?? 0).toFixed(2)}</h4>
                    <p>Ahorro Mirrors:</p>
                    {/* ⬅️ Corrección: Usamos '?? 0' para evitar toFixed(2) en null */}
                    <h4>${(ahorro ?? 0).toFixed(2)}</h4>
                </div>

                <button
                    onClick={onNavigateHistory}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#f0f0f0',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Historial de Gastos
                </button>

            </div>
        </div>
    );
}