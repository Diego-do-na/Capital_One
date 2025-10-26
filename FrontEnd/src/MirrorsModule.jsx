<<<<<<< HEAD
// frontend/src/MirrorsModule.jsx

=======
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { AddGastoModal } from "./AddGastoModal";
<<<<<<< HEAD
import { HistoryScreen } from "./HistoryScreen";
import { executeMirrorSavings, getInitialData, saveTransaction } from "./utils/api";
=======
import { api } from './api-service';
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef

export default function MirrorsModule() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMirrorsActive, setIsMirrorsActive] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ⬅️ Inicializados en null para indicar "cargando"
    const [ahorroTotal, setAhorroTotal] = useState(null);
    const [saldoNormal, setSaldoNormal] = useState(null);

<<<<<<< HEAD
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
=======
    const fetchSavings = async () => {
    try {
      const response = await api.get('/api/savings');
      // Update state with the response data
      setAhorroTotal(response.data.totalSavings || 0);
      setSaldoNormal(response.data.normalBalance || 10000);
    } catch (error) {
      console.error('Error fetching savings:', error);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const handleGuardarGasto = async (monto, categoria, establecimiento) => {
    try {
        setGastoStatus('loading');
        const response = await api.post('/api/savings/mirror', {
            purchaseAmount: Number(monto),
            establishment: establecimiento,
            category: categoria,
            customerId: '66778899aabbccddeeff0011' // usar el mock ID por ahora
        });

        if (response.data.success) {
            // Actualizar el estado con los nuevos valores
            setAhorroTotal(prevTotal => prevTotal + response.data.data.savedAmount);
            setGastoStatus('success');
            setIsModalOpen(false);
        } else {
            setGastoStatus('error');
        }
    } catch (error) {
        console.error('Error al procesar el gasto:', error);
        setGastoStatus('error');
    }
};

  return (
    <div className="dashboard-container">
      {isModalOpen && (
        <AddGastoModal
          status={gastoStatus}
          onClose={() => setIsModalOpen(false)}
          onGastoGuardado={(monto, categoria, establecimiento) =>
            handleGuardarGasto(monto, categoria, establecimiento)
          }
        />
      )}
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef

        try {
            // 1. LLAMADA AL BACKEND con todos los datos (el backend llama al ML)
            result = await executeMirrorSavings(monto, categoria, establecimiento);

            const transferred = parseFloat(result.transferredAmount);

<<<<<<< HEAD
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
=======
      <div className="main-content-centered">
        <h1>Mirror Savings</h1>
        <p>Register Your Expenses and Start Saving Money</p>

        {/* --- ¡CAMBIO 2: Campo de Umbral ahora se bloquea! --- */}
        <div
          className="form-group"
          style={{ width: "80%", maxWidth: "300px", margin: "20px 0" }}
        >
          <label
            htmlFor="umbral"
            style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}
          >
            {/* El texto de la etiqueta cambia si está bloqueado */}
            {isUmbralLocked ? "Threshold:" : "Threshold:"}
          </label>
          <div className="monto-input-wrapper">
            <span>$</span>
            <input
              type="number"
              id="umbral"
              value={umbral}
              onChange={(e) => setUmbral(parseFloat(e.target.value) || 0)}
              // Se bloquea cuando la variable de estado es true
              disabled={isUmbralLocked}
              // Al hacer clic fuera, se activa el bloqueo
              onBlur={() => setIsUmbralLocked(true)}
              style={{
                padding: "12px",
                width: "100%",
                border: "none",
                background: isUmbralLocked ? "#eee" : "#fff",
              }}
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
            />

<<<<<<< HEAD
            {renderPage()}

        </div>
    );
=======
        {/* --- ¡CAMBIO 3: Botón principal se desactiva! --- */}
        <button
          className="boton-grande-principal"
          onClick={() => setIsModalOpen(true)}
          // Se deshabilita si está cargando O si el switch está apagado
          disabled={gastoStatus === "loading" || !isMirrorsActive}
          // Opcional: Cambiar el estilo si está desactivado
          style={{
            backgroundColor: !isMirrorsActive ? "#aaa" : "#007bff",
            cursor: !isMirrorsActive ? "not-allowed" : "pointer",
          }}
        >
          {/* Mostramos un texto diferente si está apagado */}
          {!isMirrorsActive ? "Function Deactivated" : "+ Log Expense"}
        </button>
        {/* ------------------------------------------------- */}
      </div>
    </div>
  );
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
}