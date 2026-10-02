import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { LogOut, LayoutDashboard, History } from "lucide-react";
import { auth } from "../firebase";

// Componente de estructura principal con navegacion para rutas autenticadas
export const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Procesa el cierre de sesion del usuario activo
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesion:", error);
        }
    };

    // Evalua la ruta activa para aplicar estilos de seleccion
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

                    {/* Enlaces de navegacion principal */}
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

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-farmatodo-red hover:text-white transition-colors ml-2"
                            title="Cerrar Sesion"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Contenedor dinamico de vistas hijas */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>
        </div>
    );
};