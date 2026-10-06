import React, { useEffect, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { subscribeOrdenesActivas } from "../services/ordenesService";
import type { Orden } from "../types";
import { TotalOrdenesPorFecha } from "../components/TotalOrdenesPorFecha";
import { TotalBsPorFecha } from "../components/TotalBsPorFecha";
import { TiempoPuntosCalle } from "../components/TiempoPuntosCalle";
import { TransaccionesExitosasPorFecha } from "../components/TransaccionesExitosasPorFecha";
import { TransaccionesDetallesPorFecha } from "../components/TransaccionesDetallesPorFecha";

export const Estadisticas: React.FC = () => {
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);

        const unsubscribe = subscribeOrdenesActivas(
            (ordenesActualizadas) => {
                setOrdenes(ordenesActualizadas);
                setLoading(false);
            },
            (err) => {
                console.error("Error al obtener órdenes:", err);
                setError("No se pudieron cargar las órdenes desde la base de datos.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-sm font-medium">Cargando métricas y estadísticas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
                <span>Error al cargar la información: {error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header de la página */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Panel de Estadísticas</h1>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Métricas de rendimiento, tiempos en calle y recaudación en bolívares
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid de Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
                <TotalOrdenesPorFecha ordenes={ordenes} />
                <TotalBsPorFecha ordenes={ordenes} />
                <TiempoPuntosCalle ordenes={ordenes} />
                <TransaccionesExitosasPorFecha ordenes={ordenes} />
            </div>

            {/* Sección de Detalle General */}
            <div className="grid grid-cols-1 gap-5">
                <TransaccionesDetallesPorFecha ordenes={ordenes} />
            </div>
        </div>
    );
};

export default Estadisticas;