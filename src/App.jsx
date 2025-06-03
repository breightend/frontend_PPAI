import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const [motivos, setMotivos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [observacion, setobservacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarMotivos, setMostrarMotivos] = useState(false);
  const [motivosSeleccionados, setMotivosSeleccionados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5199/motivos")
      .then((res) => setMotivos(res.data))
      .catch((err) => console.error("Motivos:", err));

    axios
      .get("http://localhost:5199/ordenes-inspeccion")
      .then((res) => setOrdenes(res.data))
      .catch((err) => console.error("Ordenes:", err));
  }, []);

  const handleMotivoChange = (id) => {
    setMotivosSeleccionados((prev) => {
      const yaSeleccionado = prev.find((m) => m.idMotivo === id);
      if (yaSeleccionado) {
        return prev.filter((m) => m.idMotivo !== id);
      } else {
        return [...prev, { idMotivo: id, comentario: "" }];
      }
    });
  };

  const handleComentarioChange = (id, comentario) => {
    setMotivosSeleccionados((prev) =>
      prev.map((m) => (m.idMotivo === id ? { ...m, comentario } : m))
    );
  };

  const enviarMotivos = async () => {
    try {
      // Format the data to match the exact structure you specified
      const motivosData = {
        motivos: motivosSeleccionados.map(motivo => ({
          idMotivo: motivo.idMotivo,
          comentario: motivo.comentario || ""
        }))
      };
      
      console.log("Enviando motivos con formato:", motivosData);
      
      await axios.post("http://localhost:5199/motivos-seleccionados", motivosData);
      console.log("Motivos enviados exitosamente");
    } catch (err) {
      console.error("Error al registrar motivos:", err);
      throw err; 
    }
  };

  const enviarobservacion = async () => {
    try {
      console.log("Enviando observación:", { observacion, ordenSeleccionada });
      
      // Try sending data in the request body first
      await axios.post("http://localhost:5199/agregar-observacion", {
        orderId: ordenSeleccionada,
        observation: observacion
      });
      console.log("Observación enviada exitosamente");
    } catch (err) {
      console.error("Error al enviar observación (método 1):", err);
      
      // If the first method fails, try with query parameters
      try {
        console.log("Intentando método alternativo...");
        await axios.post("http://localhost:5199/agregar-observacion", null, {
          params: { 
            Observacion: observacion,
            OrdenId: ordenSeleccionada 
          }
        });
        console.log("Observación enviada exitosamente (método alternativo)");
      } catch (err2) {
        console.error("Error al enviar observación (método 2):", err2);
        console.error("Datos enviados:", { observacion, ordenSeleccionada });
        throw err2; // Re-throw the second error
      }
    }
  };
  console.log("Orden seleccionada:", ordenSeleccionada);
  console.log("Observacion:", observacion);
  console.log("Motivos seleccionados:", motivosSeleccionados);
  console.log(observacion);

  const cerrarOrden = async () => {
    // Validate required data
    if (!ordenSeleccionada) {
      setMensaje("Error: Debe seleccionar una orden antes de cerrarla.");
      return;
    }

    if (motivosSeleccionados.length === 0) {
      setMensaje("Error: Debe seleccionar al menos un motivo fuera de servicio.");
      return;
    }

    setIsLoading(true); // Start loading

    try {
      console.log("Iniciando cierre de orden:", ordenSeleccionada);
      console.log("Motivos seleccionados:", motivosSeleccionados);
      console.log("Observación:", observacion);

      // Send motivos first
      await enviarMotivos();
      
      // Send observation if provided and we have a selected order
      if (observacion.trim() && ordenSeleccionada) {
        console.log("Enviando observación para orden:", ordenSeleccionada);
        await enviarobservacion();
      } else if (observacion.trim() && !ordenSeleccionada) {
        console.warn("Observación proporcionada pero no hay orden seleccionada");
      }
    
      const res = await axios.post("http://localhost:5199/cerrar-orden", {
        ordenId: ordenSeleccionada,
        observation: observacion,
        motivos: motivosSeleccionados.map((m) => ({
          idMotivo: m.idMotivo,
          comentario: m.comentario || ""
        }))

      });
      
      console.log("Respuesta del servidor:", res.data);
      setMensaje(res.data);
      
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
          style={{
            background: "linear-gradient(135deg, white 0%, #fdf8f8 100%)",
            border: "2px solid var(--wine-light)",
          }}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-12 w-12 rounded-full bg-wine flex items-center justify-center text-white text-xl font-bold">
                  ✅
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-wine-dark">
                  🎉 ¡Cierre de orden exitoso!
                </p>
                <p className="mt-1 text-sm text-wine-secondary">
                  📧 Revisa tu email para más detalles
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-wine-light">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-wine-primary hover:text-wine-secondary focus:outline-none focus:ring-2 focus:ring-wine-primary transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      ));

      // Reset form after successful submission
      setTimeout(() => {
        setMostrarFormulario(false);
        setMostrarMotivos(false);
        setOrdenSeleccionada(null);
        setobservacion("");
        setMotivosSeleccionados([]);
        setMensaje("");
      }, 3000);

    } catch (error) {
      console.error("Error completo al cerrar orden:", error);
      
      // Better error handling
      let errorMessage = "Error al cerrar orden.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = `Error del servidor: ${error.response.status} - ${error.response.data?.message || error.response.data || 'Error desconocido'}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Error de conexión: No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose en http://localhost:5199";
      } else {
        // Something else happened
        errorMessage = `Error inesperado: ${error.message}`;
      }
      
      setMensaje(errorMessage);
      
      // Show error toast
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fca5a5'
        }
      });
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <div id="root">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1>Red Sísmica</h1>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {!mostrarFormulario && (
          <div className="welcome-section">
            <h2 className="welcome-title">Sistema de Gestión Sísmica</h2>
            <p className="welcome-subtitle">
              Administre las órdenes de inspección de manera eficiente y segura
            </p>
            <button
              className="btn-primary"
              onClick={() => setMostrarFormulario(true)}
            >
              📋 Cerrar Orden de Inspección
            </button>
          </div>
        )}

        {mostrarFormulario && !mostrarMotivos && (
          <div className="form-section">
            <h2 className="section-title">Cerrar Orden de Inspección</h2>

            {/* Order Selection */}
            <div className="order-selection">
              <h3 className="text-wine">Seleccione una orden</h3>
              <div className="order-list">
                {ordenes &&
                  ordenes.map((orden) => (
                    <div
                      key={orden.numero}
                      className={`order-item ${
                        ordenSeleccionada === orden.numero ? "selected" : ""
                      }`}
                      onClick={() => setOrdenSeleccionada(orden.numero)}
                    >
                      <div className="order-info">
                        <input
                          type="radio"
                          name="orden"
                          value={orden.numero}
                          checked={ordenSeleccionada === orden.numero}
                          onChange={() => setOrdenSeleccionada(orden.numero)}
                          className="order-radio"
                        />
                        <div className="order-details">
                          <strong>#{orden.numero}</strong> -{" "}
                          {orden.nombreEstacion}
                          <br />
                          <small className="text-wine-light">
                            📅 Inspección: {orden.fechaInspeccion} | Fin:{" "}
                            {orden.fechaFin}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Observations Section */}
            <div className="observation-section">
              <label htmlFor="observacion" className="observation-label">
                📝 observaciones
              </label>
              <textarea
                id="observacion"
                className="observation-textarea"
                placeholder="Ingrese sus observaciones detalladas sobre la inspección..."
                value={observacion}
                onChange={(e) => setobservacion(e.target.value)}
              ></textarea>
            </div>

            <div className="action-buttons">
              <button
                onClick={() => setMostrarMotivos(true)}
                className="btn-primary"
                disabled={!ordenSeleccionada}
                type="button"
              >
                Siguiente ➡️
              </button>
            </div>
          </div>
        )}

        {mostrarFormulario && mostrarMotivos && (
          <div className="form-section">
            <h2 className="section-title">Motivos Fuera de Servicio</h2>

            <div className="motivos-section">
              <h3 className="text-wine">Seleccione los motivos aplicables</h3>
              <div className="motivos-grid">
                {motivos &&
                  motivos.map((m) => (
                    <div
                      key={m.id}
                      className={`motivo-item ${
                        motivosSeleccionados.some(
                          (sel) => sel.idMotivo === m.id
                        )
                          ? "selected"
                          : ""
                      }`}
                    >
                      <div className="motivo-header">
                        <input
                          type="checkbox"
                          checked={motivosSeleccionados.some(
                            (sel) => sel.idMotivo === m.id
                          )}
                          onChange={() => handleMotivoChange(m.id)}
                        />
                        <span className="motivo-description">
                          ⚠️ {m.descripcion}
                        </span>
                      </div>
                      {motivosSeleccionados.some(
                        (sel) => sel.idMotivo === m.id
                      ) && (
                        <input
                          type="text"
                          className="comment-input"
                          placeholder="Añadir comentario específico..."
                          value={
                            motivosSeleccionados.find(
                              (sel) => sel.idMotivo === m.id
                            )?.comentario || ""
                          }
                          onChange={(e) =>
                            handleComentarioChange(m.id, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={() => setMostrarMotivos(false)}
                className="btn-secondary"
                disabled={isLoading}
              >
                ⬅️ Atrás
              </button>
              <button
                onClick={cerrarOrden}
                className="btn-primary btn-success"
                disabled={motivosSeleccionados.length === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Procesando...
                  </>
                ) : (
                  "✅ Confirmar Cierre"
                )}
              </button>
            </div>
            <Toaster
              position="bottom-right"
              reverseOrder={false}
              toastOptions={{
                duration: 5000,
                style: {
                  background: "white",
                  color: "var(--text-primary)",
                  borderRadius: "12px",
                  border: "1px solid var(--wine-light)",
                  boxShadow: "0 8px 32px rgba(114, 47, 55, 0.15)",
                },
              }}
            />
          </div>
        )}

        {mensaje && (
          <div className="message">
            <strong>📢 {mensaje}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
