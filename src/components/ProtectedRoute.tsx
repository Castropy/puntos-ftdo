import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

// Componente que restringe el acceso a rutas solo para usuarios autenticados
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    // Muestra pantalla de carga mientras se verifica la sesión en Firebase
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-farmatodo-lightBg">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-farmatodo-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-farmatodo-textSecondary font-medium text-sm">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    // Redirige al login en caso de no existir una sesión activa
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};