import React, { useState, useMemo } from "react";
import { Calendar, Clock, Timer } from "lucide-react";
import type { Orden } from "../types";

interface TiempoPuntosCalleProps {
    ordenes: Orden[];
}

// Auxiliar para formatear minutos totales a formato legible (Xh Ym o Z min)
const formatDuracion = (minutosTotales: number): string => {
    if (minutosTotales <= 0) return "0 min";
    const horas = Math.floor(minutosTotales / 60);
    const mins = Math.round(minutosTotales % 60);

    if (horas === 0) return `${mins} min`;
    return `${horas}h ${mins}m`;
};

export const TiempoPuntosCalle: React.FC<TiempoPuntosCalleProps> = ({ ordenes }) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const [fechaInicio, setFechaInicio] = useState<string>(todayStr);
    const [fechaFin, setFechaFin] = useState<string>(todayStr);

    const { tiempoTotalMinutos, tiempoPromedioMinutos, ordenesFinalizadas } = useMemo(() => {
        let minutosAcumulados = 0;
        let conteo = 0;

        ordenes.forEach((orden) => {
            const rawFecha = orden.horaCreacion;
            if (!rawFecha) return;

            const fechaCreacion = typeof rawFecha === "object" && "toDate" in rawFecha
                ? rawFecha.toDate()
                : new Date(rawFecha);

            if (isNaN(fechaCreacion.getTime())) return;

            const fechaStr = fechaCreacion.toISOString().split("T")[0];

            // Filtro por fecha
            if (fechaStr >= fechaInicio && fechaStr <= fechaFin) {
                // Soporte seguro para horaConfirmacion u otros campos de fecha de finalización
                const rawFechaConfirmacion = (orden as any).horaConfirmacion || (orden as any).fechaConfirmacion || (orden as any).updatedAt;
                if (rawFechaConfirmacion) {
                    const fechaConfirmacion = typeof rawFechaConfirmacion === "object" && "toDate" in rawFechaConfirmacion
                        ? rawFechaConfirmacion.toDate()
                        : new Date(rawFechaConfirmacion);

                    if (!isNaN(fechaConfirmacion.getTime())) {
                        const diffMs = fechaConfirmacion.getTime() - fechaCreacion.getTime();
                        const diffMinutos = Math.max(0, diffMs / (1000 * 60));

                        minutosAcumulados += diffMinutos;
                        conteo += 1;
                    }
                }
            }
        });

        const promedio = conteo > 0 ? minutosAcumulados / conteo : 0;

        return {
            tiempoTotalMinutos: minutosAcumulados,
            tiempoPromedioMinutos: promedio,
            ordenesFinalizadas: conteo,
        };
    }, [ordenes, fechaInicio, fechaFin]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            {/* Header del Componente */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base">Tiempo en Calle</h3>
                        <p className="text-xs text-gray-500">Duración de puntos fuera de tienda</p>
                    </div>
                </div>
            </div>

            {/* Controles de Filtro por Fecha */}
            <div className="grid grid-cols-2 gap-3 my-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Desde</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 font-medium"
                        />
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Hasta</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 font-medium"
                        />
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                </div>
            </div>

            {/* Métrica Principal */}
            <div className="bg-purple-50/60 rounded-lg p-4 flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">Tiempo Acumulado</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-0.5">
                        {formatDuracion(tiempoTotalMinutos)}
                    </div>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-purple-600 border border-purple-100 shadow-sm">
                        <Timer className="w-3 h-3" />
                        Prom: {formatDuracion(tiempoPromedioMinutos)} / punto ({ordenesFinalizadas})
                    </span>
                </div>
            </div>
        </div>
    );
};