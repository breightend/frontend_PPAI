import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Route, Router } from "wouter";
import App from "./App.jsx";
import "./index.css";
import Monitores from "./Monitores.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Router>
        <Route path="/" component={App} />
        <Route path="/monitores" component={Monitores} />
      </Router>
    </ErrorBoundary>
  </StrictMode>
);
