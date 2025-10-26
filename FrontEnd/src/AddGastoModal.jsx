import React, { useState } from "react";

// ¡Exportamos la función!
export function AddGastoModal({ status, onClose, onGastoGuardado }) {
    const [monto, setMonto] = useState("");
    const [categoria, setCategoria] = useState("");
    const [establecimiento, setEstablecimiento] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!monto || !categoria || !establecimiento || monto <= 0) {
            alert("Por favor, completa todos los campos (monto, categoría y establecimiento).");
            return;
        }
        onGastoGuardado(parseFloat(monto), categoria, establecimiento);
    };

    // Función para mostrar animación
    const renderContent = () => {
        switch (status) {
            case "loading":
                return (
                    <div className="animation-container">
                        <div className="loader"></div>
                        <p style={{ marginTop: "15px" }}>Analizando con ML...</p>
                    </div>
                );
            case "success":
                return (
                    <div className="animation-container">
                        <div className="status-icon icon-success">✓</div>
                        <p style={{ marginTop: "15px", color: '#28a745', fontWeight: 'bold' }}>¡Ahorro espejo ejecutado!</p>
                    </div>
                );
            case "normal":
                return (
                    <div className="animation-container">
                        <div className="status-icon icon-normal">✓</div>
                        <p style={{ marginTop: "15px", color: '#17a2b8', fontWeight: 'bold' }}>Gasto normal descontado. Sin ahorro espejo.</p>
                    </div>
                );
            case "parcial": // FAILED_MIRROR
                return (
                    <div className="animation-container">
                        <div className="status-icon icon-parcial">!</div>
                        <p style={{ marginTop: "15px", color: '#ffc107', fontWeight: 'bold' }}>Compra aprobada, pero sin fondos para el espejo.</p>
                    </div>
                );
            case "error": // FAILED_BALANCE o error de red
                return (
                    <div className="animation-container">
                        <div className="status-icon icon-error">X</div>
                        <p style={{ marginTop: "15px", color: '#dc3545', fontWeight: 'bold' }}>Transacción rechazada. Saldo insuficiente.</p>
                    </div>
                );

            // Formulario por defecto
            default:
                return (
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <button type="button" onClick={onClose} className="modal-close-btn">
                            X
                        </button>
                        <h3 className="text-2xl font-bold text-center">Registrar Gasto</h3>

                        {/* Campo Monto */}
                        <div className="form-group">
                            <label htmlFor="monto">Monto gastado:</label>
                            <div className="monto-input-wrapper">
                                <span>$</span>
                                <input
                                    type="number"
                                    id="monto"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                    placeholder="5.00"
                                />
                            </div>
                        </div>

                        {/* Campo Establecimiento */}
                        <div className="form-group">
                            <label htmlFor="establecimiento">Establecimiento:</label>
                            <input
                                type="text"
                                id="establecimiento"
                                value={establecimiento}
                                onChange={(e) => setEstablecimiento(e.target.value)}
                                placeholder="Ej: OXXO, Starbucks"
                                style={{width: "100%", padding: "12px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem"}}
                            />
                        </div>

                        {/* Campo Categoría */}
                        <div className="form-group">
                            <label htmlFor="categoria">Categoría:</label>
                            <select
                                id="categoria"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none bg-white"
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
                            Analizar y Guardar
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