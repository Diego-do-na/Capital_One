import React, { useState } from "react";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { AddGastoModal } from "./AddGastoModal";

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

  const handleGuardarGasto = async (monto, categoria, establecimiento) => {
    // La lógica de validación del umbral (+5) sigue aquí
    const limiteSuperior = umbral + 5;
    if (monto > limiteSuperior) {
      alert(
        `Gasto de $${monto} supera el umbral de $${umbral} (con tolerancia de +$5).\n\nEl límite máximo permitido es $${limiteSuperior}.\n\nEste gasto no será duplicado.`
      );
      setIsModalOpen(false);
      return;
    }

    setGastoStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // --- ¡LÓGICA DE DUPLICACIÓN YA ESTÁ CORRECTA! ---
    // Esta lógica solo se ejecuta si el switch está ON
    if (isMirrorsActive) {
      setAhorroTotal((prevAhorro) => prevAhorro + monto);
      setSaldoNormal((prevSaldo) => prevSaldo - monto);
    }
    // ------------------------------------------------

    setGastoStatus("success");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsModalOpen(false);
    setGastoStatus("idle");
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
        <h1>Función Mirrors</h1>
        <p>Registra un gasto para duplicarlo en tu ahorro.</p>

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
            {isUmbralLocked ? "Umbral Base:" : "Umbral Base:"}
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
          {!isMirrorsActive ? "Función desactivada" : "+ Registrar Gasto"}
        </button>
        {/* ------------------------------------------------- */}
      </div>
    </div>
  );
}
