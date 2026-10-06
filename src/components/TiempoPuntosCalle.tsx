import React, { useMemo } from "react";
import { Clock, Timer } from "lucide-react";
import type { Orden } from "../types";

interface TiempoPuntosCalleProps {
    ordenes: Orden[];
}

const formatDuracion = (minutosTotales: number): string => {
    if (minutosTotales <= 0) return "0 min";
    const horas = Math.floor(minutosTotales / 60);
    const mins = Math.round(minutosTotales % 60);

    if (horas === 0) return `${mins} min`;
    return `${horas}h ${mins}m`;
};

export const TiempoPuntosCalle: React.FC<TiempoPuntosCalleProps> = ({ ordenes }) => {
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
        });

        const promedio = conteo > 0 ? minutosAcumulados / conteo : 0;

        return {
            tiempoTotalMinutos: minutosAcumulados,
            tiempoPromedioMinutos: promedio,
            ordenesFinalizadas: conteo,
        };
    }, [ordenes]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[170px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base leading-tight">Tiempo en Calle</h3>
                        <p className="text-xs text-gray-500">Duración fuera de tienda</p>
                    </div>
                </div>
            </div>

            <div className="bg-purple-50/60 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
                <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Tiempo Acumulado</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-0.5 truncate">
                        {formatDuracion(tiempoTotalMinutos)}
                    </div>
                </div>
                <div className="shrink-0 self-start sm:self-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-purple-600 border border-purple-100 shadow-sm whitespace-nowrap">
                        <Timer className="w-3 h-3" />
                        Prom: {formatDuracion(tiempoPromedioMinutos)} ({ordenesFinalizadas})
                    </span>
                </div>
            </div>
        </div>
    );
};