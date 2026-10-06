import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Cierres } from "./pages/Cierres";
import { Estadisticas } from "./pages/Estadisticas";

// Componente raiz que establece el arbol de rutas y contextos globales
export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta publica de autenticacion */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas dentro del contenedor Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="cierres" element={<Cierres />} />
            <Route path="estadisticas" element={<Estadisticas />} />
          </Route>

          {/* Redireccion por defecto para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;