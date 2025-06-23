import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const [motivos, setMotivos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [observacion, setobservacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarMotivos, setMostrarMotivos] = useState(false);
  const [motivosSeleccionados, setMotivosSeleccionados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnlyUnavailable, setShowOnlyUnavailable] = useState(false);
  // Function to cancel and reset the entire operation
  const cancelOperation = useCallback(() => {
    // Check if user has entered any data
    const hasData =
      ordenSeleccionada ||
      observacion.trim() ||
      motivosSeleccionados.length > 0;

    if (hasData) {
      const confirmCancel = window.confirm(
        "¿Está seguro que desea cancelar la operación? Se perderán todos los datos ingresados."
      );
      if (!confirmCancel) {
        return;
      }
    }

    setMostrarFormulario(false);
    setMostrarMotivos(false);
    setOrdenSeleccionada(null);
    setobservacion("");
    setMotivosSeleccionados([]);
    setMensaje("");
    setIsLoading(false);
    setShowOnlyUnavailable(false);

    // Show cancellation feedback
    toast.success("Operación cancelada correctamente", {
      duration: 3000,
      style: {
        background: "#f0f9ff",
        color: "#0369a1",
        border: "1px solid #0ea5e9",
      },
    });
  }, [ordenSeleccionada, observacion, motivosSeleccionados]);
  //TODO: mostrar opcion de atualizar sismografo
  useEffect(() => {
    // Add keyboard shortcut for canceling (Escape key)
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && (mostrarFormulario || mostrarMotivos)) {
        event.preventDefault();
        cancelOperation();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mostrarFormulario, mostrarMotivos, cancelOperation]);

  useEffect(() => {
    axios
      .get("http://localhost:5199/empleado-logueado")
      .then((res) => {
        console.log("Respuesta completa de usuario:", res.data);

        // Check if response has the expected structure with success and data
        if (res.data && res.data.success && res.data.data) {
          setUsuario(res.data.data);
          console.log("Usuario cargado:", res.data.data);
        } else if (res.data && res.data.nombre) {
          setUsuario(res.data);
        } else {
          console.error("Usuario response structure unexpected:", res.data);
          setUsuario(null);
        }
      })
      .catch((err) => {
        console.error("Error al cargar usuario:", err);
        setUsuario(null);
      });

    axios
      .get("http://localhost:5199/motivos")
      .then((res) => {
        console.log("Respuesta completa de motivos:", res.data);

        // Check if response has the expected structure with success and data
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setMotivos(res.data.data);
          console.log("Motivos cargados:", res.data.data);
        } else if (Array.isArray(res.data)) {
          // Fallback for direct array response
          setMotivos(res.data);
        } else {
          console.error("Motivos response structure unexpected:", res.data);
          setMotivos([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar motivos:", err);
        setMotivos([]);
      });

    axios
      .get("http://localhost:5199/ordenes-inspeccion")
      .then((res) => {
        console.log("Respuesta completa de órdenes:", res.data);

        // Check if response has the expected structure with success and data
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setOrdenes(res.data.data);
          console.log("Órdenes cargadas:", res.data.data);
        } else if (Array.isArray(res.data)) {
          // Fallback for direct array response
          setOrdenes(res.data);
        } else {
          console.error("Órdenes response structure unexpected:", res.data);
          setOrdenes([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar órdenes:", err);
        setOrdenes([]);
      });
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
      const motivosData = {
        motivos: motivosSeleccionados.map((motivo) => ({
          idMotivo: motivo.idMotivo,
          comentario: motivo.comentario || "",
        })),
      };

      console.log("Enviando motivos con formato:", motivosData);

      await axios.post(
        "http://localhost:5199/motivos-seleccionados",
        motivosData
      );
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
        observation: observacion,
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
            OrdenId: ordenSeleccionada,
          },
        });
        console.log("Observación enviada exitosamente (método alternativo)");
      } catch (err2) {
        console.error("Error al enviar observación (método 2):", err2);
        console.error("Datos enviados:", { observacion, ordenSeleccionada });
        throw err2; // Re-throw the second error
      }
    }
  };
  const [confirmar, setConfirmar] = useState(false);
  const enviarConfirmacion = async () => {
    setConfirmar(true);
    try {
      await axios.post("http://localhost:5199/confirmar-cierre", {
        confirmar: confirmar,
      });
      console.log("Confirmación enviada exitosamente");
    } catch (err) {
      console.error("Error al enviar confirmación:", err);
      throw err;
    }
  };
  console.log("Orden seleccionada:", ordenSeleccionada);
  console.log("Observacion:", observacion);
  console.log("Motivos seleccionados:", motivosSeleccionados);
  console.log(observacion);

  // Filter orders based on toggle state
  const filteredOrdenes = showOnlyUnavailable
    ? ordenes.filter((orden) => orden.estado === "no_disponible") // Simulate filtering unavailable orders
    : ordenes;

  const cerrarOrden = async () => {
    // Validate required data
    if (!ordenSeleccionada) {
      setMensaje("Error: Debe seleccionar una orden antes de cerrarla.");
      return;
    }

    if (motivosSeleccionados.length === 0) {
      setMensaje(
        "Error: Debe seleccionar al menos un motivo fuera de servicio."
      );
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
        console.warn(
          "Observación proporcionada pero no hay orden seleccionada"
        );
      }

      const res = await axios.post("http://localhost:5199/cerrar-orden", {
        ordenId: ordenSeleccionada,
        observation: observacion,
        motivos: motivosSeleccionados.map((m) => ({
          idMotivo: m.idMotivo,
          comentario: m.comentario || "",
        })),
      });

      console.log("Respuesta del servidor:", res.data);

      // Extract message from response object
      const responseMessage =
        typeof res.data === "object" && res.data !== null
          ? res.data.message || res.data.cierre || JSON.stringify(res.data)
          : res.data;

      setMensaje(responseMessage);

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
              </div>{" "}
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-wine-dark">
                  ¡Cierre de orden exitoso!
                </p>
                <p className="mt-1 text-sm text-wine-secondary">
                  {res.data && res.data.message
                    ? res.data.message
                    : "📧 Revisa tu email para más detalles"}
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
        errorMessage = `Error del servidor: ${error.response.status} - ${
          error.response.data?.message ||
          error.response.data ||
          "Error desconocido"
        }`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage =
          "Error de conexión: No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose en http://localhost:5199";
      } else {
        // Something else happened
        errorMessage = `Error inesperado: ${error.message}`;
      }

      setMensaje(errorMessage);

      // Show error toast
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: "#fee2e2",
          color: "#dc2626",
          border: "1px solid #fca5a5",
        },
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
        {/* User Avatar */}
        <div className="user-avatar-container">
          <div className="user-avatar">
            <span className="avatar-initials">
              {usuario && usuario.nombre && usuario.apellido
                ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`
                : "U"}
            </span>
            <div className="user-tooltip">
              <div className="tooltip-content">
                {usuario && usuario.nombre ? (
                  <>
                    <div className="user-name">
                      {usuario.nombre} {usuario.apellido}
                    </div>
                    <div className="user-role">{usuario.rol}</div>
                    <div className="user-contact">
                      <div className="user-email">{usuario.mail}</div>
                      <div className="user-phone">{usuario.telefono}</div>
                    </div>
                  </>
                ) : (
                  <div className="user-loading">Cargando usuario...</div>
                )}
              </div>
            </div>
          </div>
        </div>
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
              Cerrar Orden de Inspección
            </button>
          </div>
        )}{" "}
        {mostrarFormulario && !mostrarMotivos && (
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Cerrar Orden de Inspección</h2>
              <small className="keyboard-hint">
                Presiona Escape para cancelar
              </small>
            </div>{" "}
            {/* Order Selection */}{" "}
            <div className="order-selection">
              <div className="order-header">
                <h3 className="text-wine">Seleccione una orden</h3>
                <div className="toggle-container">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={showOnlyUnavailable}
                      onChange={(e) => setShowOnlyUnavailable(e.target.checked)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">
                      Mostrar solo órdenes no realizadas
                    </span>
                  </label>
                </div>
              </div>
              <div className="order-list">
                {filteredOrdenes &&
                Array.isArray(filteredOrdenes) &&
                filteredOrdenes.length > 0 ? (
                  filteredOrdenes.map((orden) => (
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
                        />{" "}
                        <div className="order-details">
                          <strong>#{orden.numero}</strong> -{" "}
                          {orden.nombreEstacion}
                          <br />
                          <small className="text-wine-light">
                            Fecha Fin:{" "}
                            {new Date(orden.fechaFin).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            | Sismógrafo: {orden.idSismografo}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-orders-message">
                    <p className="text-wine-light">
                      {!ordenes
                        ? "Cargando órdenes..."
                        : showOnlyUnavailable
                        ? "❌ No se encontraron órdenes de inspección realizadas"
                        : "No hay órdenes de inspección disponibles"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Observations Section */}
            <div className="observation-section">
              <label htmlFor="observacion" className="observation-label">
                Observaciones
              </label>
              <textarea
                id="observacion"
                className="observation-textarea"
                placeholder="Ingrese sus observaciones detalladas sobre la inspección..."
                value={observacion}
                onChange={(e) => setobservacion(e.target.value)}
              ></textarea>{" "}
            </div>
            <div className="action-buttons">
              <button
                onClick={cancelOperation}
                className="btn-secondary"
                type="button"
              >
                ❌ Cancelar Operación
              </button>
              <button
                onClick={() => setMostrarMotivos(true)}
                className="btn-primary"
                disabled={!ordenSeleccionada}
                type="button"
              >
                Actualizar Sismógrafo
              </button>
            </div>
          </div>
        )}{" "}
        {mostrarFormulario && mostrarMotivos && (
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Motivos Fuera de Servicio</h2>
              <small className="keyboard-hint">
                Presiona Escape para cancelar
              </small>
            </div>
            <div className="motivos-section">
              <h3 className="text-wine">Seleccione los motivos aplicables</h3>{" "}
              <div className="motivos-grid">
                {motivos && Array.isArray(motivos) && motivos.length > 0 ? (
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
                  ))
                ) : (
                  <div className="no-motives-message">
                    <p className="text-wine-light">
                      {!motivos
                        ? "Cargando motivos..."
                        : "No hay motivos disponibles"}
                    </p>
                  </div>
                )}
              </div>
            </div>{" "}
            <div className="action-buttons">
              <button
                onClick={() => setMostrarMotivos(false)}
                className="btn-secondary"
                disabled={isLoading}
              >
                ⬅️ Atrás
              </button>
              <button
                onClick={cancelOperation}
                className="btn-secondary"
                disabled={isLoading}
                style={{ backgroundColor: "#672930" }}
              >
                ❌ Cancelar Operación
              </button>
              <button
                onClick={() => {
                  cerrarOrden();
                  enviarConfirmacion();
                }}
                className="btn-primary btn-success"
                disabled={motivosSeleccionados.length === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Procesando...
                  </>
                ) : (
                  "Confirmar Cierre"
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
            <strong> {mensaje}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
