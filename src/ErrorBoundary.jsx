import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error in component tree:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
          <h2 style={{ color: "#8b1d2d" }}>Ha ocurrido un error</h2>
          <p style={{ color: "#333" }}>
            {this.state.error?.message || "Error inesperado en la aplicación."}
          </p>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#8b1d2d",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
