import React, { useEffect, useState, useMemo } from "react";
import { BarChart3, RefreshCw, Calendar } from "lucide-react";
import { subscribeTodasLasOrdenes } from "../services/ordenesService";
import type { Orden } from "../types";
import { TotalOrdenesPorFecha } from "../components/TotalOrdenesPorFecha";
import { TotalBsPorFecha } from "../components/TotalBsPorFecha";
import { TiempoPuntosCalle } from "../components/TiempoPuntosCalle";
import { TransaccionesExitosasPorFecha } from "../components/TransaccionesExitosasPorFecha";
import { TransaccionesDetallesPorFecha } from "../components/TransaccionesDetallesPorFecha";

const toLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const Estadisticas: React.FC = () => {
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fechas límites
    const now = new Date();
    const todayStr = toLocalDateString(now);
    const firstDayOfMonthStr = toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));

    const [fechaInicio, setFechaInicio] = useState<string>(firstDayOfMonthStr);
    const [fechaFin, setFechaFin] = useState<string>(todayStr);

    useEffect(() => {
        setLoading(true);

        const unsubscribe = subscribeTodasLasOrdenes(
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

    // Manejadores con validación estricta de fechas
    const handleFechaInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) return;
        if (val > todayStr) return; // Prevenir fecha futura
        setFechaInicio(val);
        if (val > fechaFin) {
            setFechaFin(val);
        }
    };

    const handleFechaFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) return;
        if (val > todayStr) return; // Prevenir fecha futura
        if (val < fechaInicio) {
            setFechaInicio(val);
        }
        setFechaFin(val);
    };

    // Ordenes filtradas por fecha global
    const ordenesFiltradas = useMemo(() => {
        return ordenes.filter((orden) => {
            const rawFecha = orden.horaCreacion;
            if (!rawFecha) return false;

            const fechaOrden = typeof rawFecha === "object" && "toDate" in rawFecha
                ? rawFecha.toDate()
                : new Date(rawFecha);

            if (isNaN(fechaOrden.getTime())) return false;

            const fechaStr = toLocalDateString(fechaOrden);
            return fechaStr >= fechaInicio && fechaStr <= fechaFin;
        });
    }, [ordenes, fechaInicio, fechaFin]);

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
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {/* Header de la página + Selector de Fechas Unificado */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Panel de Estadísticas</h1>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Métricas de rendimiento, tiempos en calle y recaudación en bolívares
                        </p>
                    </div>
                </div>

                {/* Filtro Global de Fechas */}
                <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200 self-start md:self-auto">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Desde</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={fechaInicio}
                                max={todayStr}
                                onChange={handleFechaInicioChange}
                                className="pl-7 pr-2 py-1 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-semibold"
                            />
                            <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1.5" />
                        </div>
                    </div>
                    <span className="text-gray-300 font-bold self-end pb-1.5">-</span>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Hasta</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={fechaFin}
                                max={todayStr}
                                onChange={handleFechaFinChange}
                                className="pl-7 pr-2 py-1 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-semibold"
                            />
                            <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1.5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Métricas Principales (Adaptativo a pantallas anchas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
                <TotalOrdenesPorFecha ordenes={ordenesFiltradas} fechaInicio={fechaInicio} fechaFin={fechaFin} />
                <TotalBsPorFecha ordenes={ordenesFiltradas} />
                <TiempoPuntosCalle ordenes={ordenesFiltradas} />
                <TransaccionesExitosasPorFecha ordenes={ordenesFiltradas} />
            </div>

            {/* Sección de Detalle General */}
            <div className="grid grid-cols-1 gap-6">
                <TransaccionesDetallesPorFecha ordenes={ordenesFiltradas} />
            </div>
        </div>
    );
};

export default Estadisticas;