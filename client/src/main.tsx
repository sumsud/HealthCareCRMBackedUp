import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import App from "./App";
import { store } from "./store";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider defaultTheme="light" storageKey="careflow-theme">
      <App />
      <Toaster />
    </ThemeProvider>
  </Provider>
);
