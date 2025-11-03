import { useEffect, useState } from "react";
import { fetchData } from "./services/service";
import "./Monitores.css";
import { useLocation } from "wouter";

export default function Monitores() {
  const [monitoresData, setMonitoresData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [location, setLocation] = useLocation()

  const fetchMonitoresData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchData("/monitores");
      console.log("Monitores data:", data);

      // Handle both array and single object responses
      const dataArray = Array.isArray(data) ? data : [data];
      setMonitoresData(dataArray);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching monitores data:", error);
      setError("Error al cargar los datos de monitores");
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
  }, []);

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

  const getNotificationTypeColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case "info":
        return "notification-info";
      case "warning":
      case "advertencia":
        return "notification-warning";
      case "error":
        return "notification-error";
      case "success":
      case "exitoso":
        return "notification-success";
      default:
        return "notification-default";
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
            <button onClick={fetchMonitoresData} className="retry-button">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        {monitoresData.length === 0 ? (
          <div className="no-data-container">
            <h3>No hay datos disponibles</h3>
            <p>No se encontraron registros de monitoreo en este momento.</p>
          </div>
        ) : (
          <div className="monitores-grid">
            {monitoresData.map((item, index) => (
              <div key={index} className="monitor-card">
                <div className="card-header">
                  <h3 className="card-title">
                    {item.tipo === "cierre_orden_inspeccion"
                      ? "Cierre de Orden de Inspección"
                      : item.tipo || "Evento de Monitoreo"}
                  </h3>
                  <div className="card-timestamp">
                    {formatTimestamp(item.timestamp)}
                  </div>
                </div>

                {item.datos && (
                  <div className="card-content">
                    {/* Sismógrafo Information */}
                    {item.datos.sismografo && (
                      <div className="section">
                        <h4 className="section-title">Sismógrafo</h4>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Identificador:</span>
                            <span className="info-value">
                              #{item.datos.sismografo.identificador}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Estado:</span>
                            <span
                              className={`status-badge ${getStatusColor(
                                item.datos.sismografo.estado
                              )}`}
                            >
                              {item.datos.sismografo.estado}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">
                              Cambio de Estado:
                            </span>
                            <span className="info-value">
                              {formatTimestamp(
                                item.datos.sismografo.fechaCambioEstado
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cierre Information */}
                    {item.datos.cierre && (
                      <div className="section">
                        <h4 className="section-title">
                          Información del Cierre
                        </h4>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Fecha de Cierre:</span>
                            <span className="info-value">
                              {formatTimestamp(item.datos.cierre.fechaCierre)}
                            </span>
                          </div>
                          {item.datos.cierre.motivos &&
                            item.datos.cierre.motivos.length > 0 && (
                              <div className="info-item full-width">
                                <span className="info-label">Motivos:</span>
                                <ul className="motivos-list">
                                  {item.datos.cierre.motivos.map(
                                    (motivo, idx) => (
                                      <li key={idx} className="motivo-item">
                                        {typeof motivo === "string"
                                          ? motivo
                                          : motivo.descripcion ||
                                            JSON.stringify(motivo)}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          {item.datos.cierre.comentarios &&
                            item.datos.cierre.comentarios.length > 0 && (
                              <div className="info-item full-width">
                                <span className="info-label">Comentarios:</span>
                                <ul className="comentarios-list">
                                  {item.datos.cierre.comentarios.map(
                                    (comentario, idx) => (
                                      <li key={idx} className="comentario-item">
                                        {typeof comentario === "string"
                                          ? comentario
                                          : comentario.texto ||
                                            JSON.stringify(comentario)}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          {item.datos.cierre.destinatarios &&
                            item.datos.cierre.destinatarios.length > 0 && (
                              <div className="info-item full-width">
                                <span className="info-label">
                                  Destinatarios:
                                </span>
                                <div className="destinatarios-list">
                                  {item.datos.cierre.destinatarios.map(
                                    (destinatario, idx) => (
                                      <span
                                        key={idx}
                                        className="destinatario-tag"
                                      >
                                        {typeof destinatario === "string"
                                          ? destinatario
                                          : destinatario.email ||
                                            destinatario.nombre ||
                                            JSON.stringify(destinatario)}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Notificación Information */}
                    {item.datos.notificacion && (
                      <div className="section">
                        <h4 className="section-title">Notificación</h4>
                        <div className="notification-content">
                          <div
                            className={`notification-message ${getNotificationTypeColor(
                              item.datos.notificacion.tipoNotificacion
                            )}`}
                          >
                            <div className="notification-text">
                              {item.datos.notificacion.mensaje}
                            </div>
                            <div className="notification-details">
                              <span className="notification-status">
                                Estado: {item.datos.notificacion.estado}
                              </span>
                              <span className="notification-type">
                                Tipo: {item.datos.notificacion.tipoNotificacion}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadatos */}
                {item.metadatos && (
                  <div className="card-footer">
                    <div className="metadata">
                      <span className="metadata-item">
                        {item.metadatos.sistema} - {item.metadatos.modulo}
                      </span>
                      <span className="metadata-version">
                        v{item.metadatos.version}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
