import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";


// export const authService = "http://localhost:5000";
export const authService = "https://gokart-auth.onrender.com";
// export const storeService = "http://localhost:5001";
export const storeService = "https://gokart-store.onrender.com";
// export const utilsService = "http://localhost:5002";
export const utilsService = "https://gokart-utils.onrender.com";
// export const realtimeService = "http://localhost:5004";
export const realtimeService = "https://gokart-realtime.onrender.com";
// export const riderService = "http://localhost:5005";
export const riderService = "https://gokart-rider.onrender.com";
// export const adminService = "http://localhost:5006";
export const adminService = "https://gokart-admin.onrender.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
