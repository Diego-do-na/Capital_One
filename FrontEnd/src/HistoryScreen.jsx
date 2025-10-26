import React, { useState, useEffect } from "react";
import { getHistory } from "./utils/api";

const statusStyles = {
    SUCCESS: { text: "Ahorro Ejecutado", color: "#28a745" },
    FAILED_MIRROR: { text: "Compra OK, Ahorro Falló", color: "#ffc107" },
    SKIP: { text: "Gasto Normal", color: "#6c757d" },
    FAILED_BALANCE: { text: "Transacción Rechazada", color: "#dc3545" }, 
};

export function HistoryScreen({ onClose }) {
    const [history, setHistory] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getHistory();
                setHistory(data);
            } catch (error) {
                console.error("Error al cargar el historial:", error);
                setHistory([]); 
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(amount);
    };

    const renderStatus = (statusKey) => {
        const style = statusStyles[statusKey] || statusStyles.FAILED_BALANCE;
        return (
            <span
                style={{
                    color: style.color,
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                }}
            >
        {style.text}
      </span>
        );
    };

    return (
        <div className="history-container">
            <button onClick={onClose} className="back-button">
                {"< Volver"}
            </button>
            <h1 style={{ textAlign: "center" }}>Historial de Transacciones</h1>

            {loading && <p style={{ textAlign: "center" }}>Cargando historial...</p>}

            {!loading && history && history.length === 0 && (
                <p style={{ textAlign: "center", marginTop: "40px" }}>
                    Aún no hay gastos registrados. ¡Empieza a ahorrar!
                </p>
            )}

            {!loading && history && history.length > 0 && (
                <table className="history-table">
                    <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Monto Gastado</th>
                        <th>Transferencia</th>
                        <th>Estado</th>
                        <th>Establecimiento</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((tx) => {
                        const statusKey = tx.validation || "SKIP";
                        return (
                            <tr key={tx._id}>
                                <td>{new Date(tx.fecha).toLocaleDateString()}</td>
                                <td style={{ color: "#dc3545", fontWeight: "bold" }}>
                                    -{formatCurrency(tx.monto)}
                                </td>
                                <td style={{ color: "#28a745", fontWeight: "bold" }}>
                                    +{formatCurrency(tx.transferAmount)}
                                </td>
                                <td>{renderStatus(statusKey)}</td>
                                <td>{tx.establecimiento}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}
        </div>
    );
}