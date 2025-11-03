import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Monitores from "./Monitores.jsx";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Switch>
        <Route path="/" element={<App />} />
        <Route path="/monitores" element={<Monitores />} />
      </Switch>
    </Router>
  </StrictMode>
);
