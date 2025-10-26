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

    // ⬅️ Inicializados en null para indicar "cargando"
    const [ahorroTotal, setAhorroTotal] = useState(null);
    const [saldoNormal, setSaldoNormal] = useState(null);

    const [gastoStatus, setGastoStatus] = useState("idle");
    const [currentPage, setCurrentPage] = useState('dashboard');

    // ⬅️ EFECTO PARA CARGAR DATOS PERSISTENTES DEL CLIENTE ÚNICO
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await getInitialData();
                setAhorroTotal(data.ahorroTotal);
                setSaldoNormal(data.saldoNormal);
            } catch (error) {
                console.error("Fallo al cargar data inicial:", error);
                // Fallback: Si la conexión falla, se usan valores por defecto para que la app no se rompa
                setAhorroTotal(0.00);
                setSaldoNormal(10000.00);
            }
        };
        loadInitialData();
    }, []);

    // Lógica de registro de gasto (handleGuardarGasto) sin cambios funcionales...
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
            // 1. LLAMADA AL BACKEND con todos los datos (el backend llama al ML)
            result = await executeMirrorSavings(monto, categoria, establecimiento);

            const transferred = parseFloat(result.transferredAmount);

            if (result.validation === "SUCCESS") {
                successMessage = result.message;
                setGastoStatus("success");

                // 2. RECARGAMOS LOS ESTADOS ACTUALIZADOS DE MONGODB
                const updatedData = await getInitialData();
                setAhorroTotal(updatedData.ahorroTotal);
                setSaldoNormal(updatedData.saldoNormal);

            } else {
                successMessage = result.message;
                setGastoStatus("error");
            }

            // 3. Guardar en el Historial de MongoDB
            await saveTransaction(monto, categoria, establecimiento, result);

        } catch (error) {
            setGastoStatus("error");
            successMessage = `Error de Conexión/Servidor: ${error.message}`;
            alert(successMessage);
        } finally {
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
        // ⬅️ Manejo de estado de carga inicial.
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

                        {/* Botón de Registrar Gasto */}
                        <button
                            className="boton-grande-principal"
                            onClick={() => setIsModalOpen(true)}
                            disabled={gastoStatus === "loading" || !isMirrorsActive}
                            // ... (estilos) ...
                        >
                            {!isMirrorsActive ? "Función desactivada" : "+ Registrar Gasto"}
                        </button>

                        {/* ⬅️ Muestra el estado persistente */}
                        <div style={{ marginTop: 30, textAlign: 'left', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: "80%", maxWidth: "300px" }}>
                            <h4>Estado de Cuentas (Persistente)</h4>
                            <p><strong>Saldo Normal:</strong> ${saldoNormal}</p>
                            <p><strong>Ahorro Total:</strong> ${ahorroTotal}</p>
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

            {/* Menú Lateral */}
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

            {/* Encabezado */}
            <Header
                onMenuClick={() => setIsMenuOpen(true)}
                isMirrorsOn={isMirrorsActive}
                onToggleChange={() => setIsMirrorsActive(!isMirrorsActive)}
            />

            {renderPage()}

        </div>
    );
}