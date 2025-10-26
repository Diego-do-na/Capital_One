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
        "*Please fill required spaces"
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
            <p style={{ marginTop: "15px" }}>Verifying...</p>
          </div>
        );
      case "success":
        return (
          <div className="animation-container">
            <div className="success-animation">
              <div className="checkmark"></div>
            </div>
            <p style={{ marginTop: "15px" }}>¡Savings Mirrored!</p>
          </div>
        );
      case "error":
        return (
          <div className="animation-container">
            {/* Puedes crear una ".error-animation" si quieres */}
            <p>Oops, something went wrong...</p>
          </div>
        );

      // Formulario por defecto
      default:
        return (
          <form onSubmit={handleSubmit}>
            <button onClick={onClose} className="modal-close-btn">
              X
            </button>
            <h3>Log Ant Expense</h3>

            {/* Campo Monto (sin cambios) */}
            <div className="form-group">
              <label htmlFor="monto">Amount Spent:</label>
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
              <label htmlFor="establecimiento">Establishment:</label>
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
              <label htmlFor="categoria">Category:</label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">-- Select an Option --</option>
                <option value="coffee">☕ Coffee</option>
                <option value="fast food">🍔 FastFood</option>
                <option value="transportation">🚕 Transportation</option>
                <option value="quick snack">🍫 Snack</option>
                <option value="other">🛒 Other</option>
              </select>
            </div>

            <button type="submit" className="boton-guardar">
              SAVE
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
