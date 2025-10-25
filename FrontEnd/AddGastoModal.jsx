import React, { useState } from "react";

// ¡Exportamos la función!
export function AddGastoModal({ status, onClose, onGastoGuardado }) {
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("");

  // --- ¡NUEVO! Estado para Establecimiento ---
  const [establecimiento, setEstablecimiento] = useState("");
  // -------------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    // --- ¡ACTUALIZADO! Validamos los 3 campos ---
    if (!monto || !categoria || !establecimiento || monto <= 0) {
      alert(
        "Por favor, completa todos los campos (monto, categoría y establecimiento)."
      );
      return;
    }
    // ------------------------------------------

    // --- ¡ACTUALIZADO! Pasamos los 3 datos ---
    onGastoGuardado(parseFloat(monto), categoria, establecimiento);
  };

  // Función para mostrar animación (la que ya tenías)
  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="animation-container">
            <div className="loader"></div>
            <p style={{ marginTop: "15px" }}>Verificando...</p>
          </div>
        );
      case "success":
        return (
          <div className="animation-container">
            <div className="success-animation">
              <div className="checkmark"></div>
            </div>
            <p style={{ marginTop: "15px" }}>¡Ahorro duplicado!</p>
          </div>
        );
      case "error":
        return (
          <div className="animation-container">
            {/* Puedes crear una ".error-animation" si quieres */}
            <p>Oops, algo salió mal.</p>
          </div>
        );

      // Formulario por defecto
      default:
        return (
          <form onSubmit={handleSubmit}>
            <button onClick={onClose} className="modal-close-btn">
              X
            </button>
            <h3>Registrar Gasto Hormiga</h3>

            {/* Campo Monto (sin cambios) */}
            <div className="form-group">
              <label htmlFor="monto">Monto gastado:</label>
              <div className="monto-input-wrapper">
                <span>$</span>
                <input
                  type="number"
                  id="monto"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="50.00"
                />
              </div>
            </div>

            {/* --- ¡NUEVO! Campo de Establecimiento --- */}
            <div className="form-group">
              <label htmlFor="establecimiento">Establecimiento:</label>
              <input
                style={{
                  width: "100%",
                  padding: "12px",
                  boxSizing: "border-box",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
                type="text"
                id="establecimiento"
                value={establecimiento}
                onChange={(e) => setEstablecimiento(e.target.value)}
                placeholder="Ej: OXXO, Starbucks, Uber"
              />
            </div>
            {/* ------------------------------------- */}

            {/* Campo Categoría (sin cambios) */}
            <div className="form-group">
              <label htmlFor="categoria">Categoría:</label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">-- Selecciona una --</option>
                <option value="cafe">☕ Café</option>
                <option value="comida_rapida">🍔 Comida rápida</option>
                <option value="transporte">🚕 Transporte (App)</option>
                <option value="antojo">🍫 Antojo (OXXO)</option>
                <option value="otro">🛒 Otro</option>
              </select>
            </div>

            <button type="submit" className="boton-guardar">
              Guardar Gasto
            </button>
          </form>
        );
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">{renderContent()}</div>
    </div>
  );
}
