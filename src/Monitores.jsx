import { useEffect, useState } from "react";
import { fetchData } from "./services/service";
import "./Monitores.css";
import { useLocation } from "wouter";

export default function Monitores() {
  const [monitoresData, setMonitoresData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [location, setLocation] = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getOrdenIdFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("ordenId");
  };

  const fetchMonitoresData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const ordenId = getOrdenIdFromUrl();
      if (!ordenId) {
        throw new Error(
          "No se proporcionó el ID de la orden. Debe acceder desde el proceso de confirmación."
        );
      }

      const data = await fetchData(`/monitores?ordenId=${ordenId}`);
      console.log("Monitores data:", data);

      if (data && data.success) {
        setMonitoresData(data.data);
      } else {
        setError("No se recibieron datos válidos del servidor");
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching monitores data:", error);
      if (error.message.includes("ordenId")) {
        setError(
          "Debe acceder a esta pantalla desde el proceso de confirmación de cierre de orden."
        );
      } else {
        setError(`Error al cargar los datos de monitores: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    setLocation("/");
  };

  useEffect(() => {
    fetchMonitoresData();

    const interval = setInterval(fetchMonitoresData, 30000);

    return () => clearInterval(interval);
  }, [refreshTrigger]);

  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, [location]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "No disponible";
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "operativo":
      case "en servicio":
        return "status-operational";
      case "fuera de servicio":
      case "mantenimiento":
        return "status-out-of-service";
      case "error":
      case "falla":
        return "status-error";
      default:
        return "status-unknown";
    }
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case "alta":
        return "priority-high";
      case "media":
        return "priority-medium";
      case "baja":
        return "priority-low";
      default:
        return "priority-normal";
    }
  };

  if (isLoading) {
    return (
      <div className="monitores-container">
        <div className="monitores-header">
          <h1>Sistema de Monitoreo</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos de monitores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monitores-container">
        <div className="monitores-header">
          <h1>Sistema de Monitoreo</h1>
        </div>
        <div className="error-container">
          <div className="error-message">
            <h3>Error de Conexión</h3>
            <p>{error}</p>
            <div className="error-buttons">
              {!error.includes("ordenId") && (
                <button onClick={fetchMonitoresData} className="retry-button">
                  Reintentar
                </button>
              )}
              <button onClick={handleBackClick} className="back-button">
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!monitoresData) {
    return (
      <div className="monitores-container">
        <div className="monitores-header">
          <h1>Sistema de Monitoreo Sismológico</h1>
        </div>
        <div className="no-data-container">
          <h3>No hay datos disponibles</h3>
          <p>No se encontraron registros de monitoreo en este momento.</p>
          <button onClick={fetchMonitoresData} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { sismografo, pantalla, notificacion } = monitoresData;

  return (
    <div className="monitores-container">
      <div className="monitores-header">
        <h1>Sistema de Monitoreo Sismológico</h1>
        <div className="header-info">
          <div className="last-update">
            Última actualización:{" "}
            {lastUpdate ? formatTimestamp(lastUpdate) : "No disponible"}
          </div>
          <button onClick={fetchMonitoresData} className="refresh-button">
            Actualizar
          </button>
        </div>
      </div>

      <div className="monitores-content">
        <div className="monitores-grid">
          <div className="monitor-card">
            <div className="card-header">
              <h3 className="card-title">Información del Sismógrafo</h3>
            </div>
            <div className="card-content">
              <div className="section">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Identificador:</span>
                    <span className="info-value">
                      #{sismografo.identificador}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Estado:</span>
                    <span
                      className={`status-badge ${getStatusColor(
                        sismografo.estado
                      )}`}
                    >
                      {sismografo.estado}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Cambio de Estado:</span>
                    <span className="info-value">
                      {formatTimestamp(sismografo.fechaCambioEstado)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Fecha de Cierre:</span>
                    <span className="info-value">
                      {formatTimestamp(sismografo.fechaCierre)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="monitor-card">
            <div className="card-header">
              <h3 className="card-title">Información de Pantalla</h3>
            </div>
            <div className="card-content">
              <div className="section">
                <div className="message-display">
                  <div className="message-text">{pantalla.mensaje}</div>
                  <div className="message-date">
                    {formatTimestamp(pantalla.fecha)}
                  </div>
                </div>

                {pantalla.comentarios && pantalla.comentarios.length > 0 && (
                  <div className="info-item full-width">
                    <span className="info-label">Comentarios:</span>
                    <ul className="comentarios-list">
                      {pantalla.comentarios.map((comentario, idx) => (
                        <li key={idx} className="comentario-item">
                          {comentario}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pantalla.motivos && pantalla.motivos.length > 0 && (
                  <div className="info-item full-width">
                    <span className="info-label">
                      Motivos del Cambio de Estado:
                    </span>
                    <ul className="motivos-list">
                      {pantalla.motivos.map((motivo, idx) => (
                        <li key={idx} className="motivo-item">
                          {motivo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pantalla.responsablesReparacion &&
                  pantalla.responsablesReparacion.length > 0 && (
                    <div className="info-item full-width">
                      <span className="info-label">
                        Responsables de Reparación:
                      </span>
                      <ul className="responsables-list">
                        {pantalla.responsablesReparacion.map((email, idx) => (
                          <li key={idx} className="responsable-item">
                            {email}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="monitor-card">
            <div className="card-header">
              <h3 className="card-title">Estado de Notificaciones</h3>
            </div>
            <div className="card-content">
              <div className="section">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Total Destinatarios:</span>
                    <span className="info-value">
                      {notificacion.totalDestinatarios}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Prioridad:</span>
                    <span
                      className={`priority-badge ${getPriorityColor(
                        notificacion.prioridad
                      )}`}
                    >
                      {notificacion.prioridad.toUpperCase()}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Requiere Acción:</span>
                    <span
                      className={`action-required ${
                        notificacion.requiereAccion ? "yes" : "no"
                      }`}
                    >
                      {notificacion.requiereAccion ? "SÍ" : "NO"}
                    </span>
                  </div>
                </div>

                {notificacion.mailsNotificados &&
                  notificacion.mailsNotificados.length > 0 && (
                    <div className="info-item full-width">
                      <span className="info-label">Correos Notificados:</span>
                      <ul className="emails-list">
                        {notificacion.mailsNotificados.map((email, idx) => (
                          <li key={idx} className="email-item">
                            {email}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
