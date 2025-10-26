// frontend/src/MirrorsModule.jsx

import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { AddGastoModal } from "./AddGastoModal";
import { HistoryScreen } from "./HistoryScreen";
import { executeMirrorSavings, getInitialData, saveTransaction } from "./utils/api";

export default function MirrorsModule() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMirrorsActive, setIsMirrorsActive] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Saldo y ahorro del cliente único (cargados de MongoDB)
    const [ahorroTotal, setAhorroTotal] = useState(null);
    const [saldoNormal, setSaldoNormal] = useState(null);

    // gastoStatus: 'idle', 'loading', 'success', 'error', 'normal', 'parcial' ⬅️ Incluye el estado de fallo
    const [gastoStatus, setGastoStatus] = useState("idle");
    const [currentPage, setCurrentPage] = useState('dashboard');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await getInitialData();
                setAhorroTotal(data.ahorroTotal);
                setSaldoNormal(data.saldoNormal);
            } catch (error) {
                console.error("Fallo al cargar data inicial:", error);
                setAhorroTotal(0.00);
                setSaldoNormal(10000.00);
            }
        };
        loadInitialData();
    }, []);

    // =======================================================
    // LÓGICA DE REGISTRO DE GASTO (INTEGRACIÓN ML)
    // =======================================================

    const handleGuardarGasto = async (monto, categoria, establecimiento) => {
        if (!isMirrorsActive) {
            alert("La función de ahorro está desactivada.");
            setIsModalOpen(false);
            return;
        }

        setGastoStatus("loading");

        let successMessage = "Gasto registrado.";
        let result = { validation: 'SKIP', transferredAmount: 0, message: 'Error' };

        try {
            // 1. LLAMADA AL BACKEND
            result = await executeMirrorSavings(monto, categoria, establecimiento);

            // 2. Determinación del estado final del Modal
            if (result.validation === "SUCCESS") {
                successMessage = result.message;
                setGastoStatus("success");

                // Recargamos los estados actualizados de MongoDB
                const updatedData = await getInitialData();
                setAhorroTotal(updatedData.ahorroTotal);
                setSaldoNormal(updatedData.saldoNormal);

            } else if (result.validation === "SKIP") {
                successMessage = result.message;
                setGastoStatus("normal"); // Gasto Normal (Descuento simple)

            } else if (result.validation === "FAILED_MIRROR") {
                successMessage = result.message;
                setGastoStatus("parcial"); // ⬅️ Nuevo estado visual para saldo insuficiente

            } else { // FAILED_BALANCE (Error de saldo total) o error inesperado
                successMessage = result.message;
                setGastoStatus("error");
            }

            // 3. Guardar en el Historial de MongoDB
            await saveTransaction(monto, categoria, establecimiento, result);

        } catch (error) {
            setGastoStatus("error");
            successMessage = `Error de Conexión/Servidor: ${error.message}`;
            alert(successMessage); // Mantenemos esta alerta SÓLO para fallos de red/servidor
        } finally {
            // Eliminamos el alert duplicado y sólo usamos el delay para cerrar el modal
            setTimeout(() => {
                setIsModalOpen(false);
                setGastoStatus("idle");
            }, 2000);
        }
    };

    // =======================================================
    // RENDERIZADO
    // =======================================================

    const renderPage = () => {
        if (ahorroTotal === null || saldoNormal === null) {
            return <div className="main-content-centered"><h2>Cargando datos persistentes...</h2><div className="loader"></div></div>;
        }

        switch (currentPage) {
            case 'history':
                return <HistoryScreen onClose={() => setCurrentPage('dashboard')} />;
            case 'dashboard':
            default:
                return (
                    <div className="main-content-centered">
                        <h1>Tu Función Mirrors</h1>
                        <p>Impulsada por Machine Learning. Cada gasto es analizado.</p>

                        <button
                            className="boton-grande-principal"
                            onClick={() => setIsModalOpen(true)}
                            disabled={gastoStatus === "loading" || !isMirrorsActive}
                        >
                            {!isMirrorsActive ? "Función desactivada" : "+ Registrar Gasto"}
                        </button>

                        <div style={{ marginTop: 30, textAlign: 'left', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: "80%", maxWidth: "300px" }}>
                            <h4>Estado de Cuentas (Persistente)</h4>
                            <p><strong>Saldo Normal:</strong> ${saldoNormal.toFixed(2)}</p>
                            <p><strong>Ahorro Total:</strong> ${ahorroTotal.toFixed(2)}</p>
                        </div>
                    </div>
                );
        }
    };


    return (
        <div className="dashboard-container">
            {isModalOpen && (
                <AddGastoModal
                    status={gastoStatus}
                    onClose={() => setIsModalOpen(false)}
                    onGastoGuardado={handleGuardarGasto}
                />
            )}

            {isMenuOpen && (
                <SideMenu
                    ahorro={ahorroTotal}
                    saldo={saldoNormal}
                    onClose={() => setIsMenuOpen(false)}
                    onNavigateHistory={() => {
                        setIsMenuOpen(false);
                        setCurrentPage('history');
                    }}
                />
            )}

            <Header
                onMenuClick={() => setIsMenuOpen(true)}
                isMirrorsOn={isMirrorsActive}
                onToggleChange={() => setIsMirrorsActive(!isMirrorsActive)}
            />

            {renderPage()}

        </div>
    );
}