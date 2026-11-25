import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// global styles first, so component styles (imported by App) can override them
import "./styles/base.css";
import "./styles/buttons.css";
import "./styles/forms.css";
import "./styles/page.css";
import { AppProvider } from "./context/AppContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </BrowserRouter>,
);
