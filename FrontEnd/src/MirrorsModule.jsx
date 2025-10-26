import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { AddGastoModal } from "./AddGastoModal";
import { api } from './api-service';

export default function MirrorsModule() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMirrorsActive, setIsMirrorsActive] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ahorroTotal, setAhorroTotal] = useState(0);
  const [saldoNormal, setSaldoNormal] = useState(10000);
  const [gastoStatus, setGastoStatus] = useState("idle");
  const [umbral, setUmbral] = useState(50);

  // --- ¡CAMBIO 1: Nuevo estado para bloquear el umbral! ---
  const [isUmbralLocked, setIsUmbralLocked] = useState(false);
  // --------------------------------------------------------

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

      {isMenuOpen && (
        <SideMenu
          ahorro={ahorroTotal}
          saldo={saldoNormal}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        isMirrorsOn={isMirrorsActive}
        onToggleChange={() => setIsMirrorsActive(!isMirrorsActive)}
      />

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
            />
          </div>
        </div>
        {/* ---------------------------------------------------- */}

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
}