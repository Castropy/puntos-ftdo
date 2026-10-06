import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { LogOut, LayoutDashboard, History, BarChart3, AlertTriangle, X } from "lucide-react";
import { auth } from "../firebase";

// Componente de estructura principal con navegación para rutas autenticadas
export const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Procesa el cierre de sesión del usuario activo
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Evalúa la ruta activa para aplicar estilos de selección
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-farmatodo-lightBg">
            {/* Encabezado principal superior */}
            <header className="bg-farmatodo-blue text-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="font-bold text-xl tracking-tight">FARMATODO</span>
                        <span className="hidden sm:inline text-xs bg-white/20 px-2 py-0.5 rounded text-white font-medium">
                            Puntos Externos
                        </span>
                    </div>

                    {/* Enlaces de navegación principal */}
                    <nav className="flex items-center space-x-1 sm:space-x-4">
                        <Link
                            to="/"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/")
                                ? "bg-white/10 text-white"
                                : "text-blue-100 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                        </Link>

                        <Link
                            to="/cierres"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/cierres")
                                ? "bg-white/10 text-white"
                                : "text-blue-100 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <History className="w-4 h-4" />
                            <span>Cierres</span>
                        </Link>

                        <Link
                            to="/estadisticas"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/estadisticas")
                                ? "bg-white/10 text-white"
                                : "text-blue-100 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>Estadísticas</span>
                        </Link>

                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-farmatodo-red hover:text-white transition-colors ml-2"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Contenedor dinámico de vistas hijas */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>

            {/* Modal de Confirmación de Cierre de Sesión */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-gray-100">
                        <div className="p-6">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center space-x-2 text-farmatodo-red">
                                    <AlertTriangle className="w-5 h-5" />
                                    <h3 className="font-semibold text-lg text-farmatodo-textPrimary">
                                        Confirmar Cierre de Sesión
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="mt-4 text-sm text-farmatodo-textSecondary">
                                ¿Estás seguro de que deseas salir del sistema? Tendrás que ingresar tus credenciales de nuevo para gestionar los puntos externos.
                            </p>

                            <div className="mt-6 flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-farmatodo-textSecondary hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        handleLogout();
                                    }}
                                    className="px-4 py-2 text-sm font-medium bg-farmatodo-red hover:bg-red-700 text-white rounded-md transition-colors shadow-sm"
                                >
                                    Sí, cerrar sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};