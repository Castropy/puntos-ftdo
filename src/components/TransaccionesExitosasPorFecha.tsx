import React, { useState, useMemo } from "react";
import { Calendar, CheckCircle2, Award } from "lucide-react";
import type { Orden } from "../types";

interface TransaccionesExitosasPorFechaProps {
    ordenes: Orden[];
}

// Auxiliar para formatear fecha a YYYY-MM-DD en hora local
const toLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const TransaccionesExitosasPorFecha: React.FC<TransaccionesExitosasPorFechaProps> = ({ ordenes }) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [fechaInicio, setFechaInicio] = useState<string>(toLocalDateString(firstDayOfMonth));
    const [fechaFin, setFechaFin] = useState<string>(toLocalDateString(now));

    const { exitosas, total, tasaExito } = useMemo(() => {
        const filtradas = ordenes.filter((orden) => {
            const rawFecha = orden.horaCreacion;
            if (!rawFecha) return false;

            const fechaOrden = typeof rawFecha === "object" && "toDate" in rawFecha
                ? rawFecha.toDate()
                : new Date(rawFecha);

            if (isNaN(fechaOrden.getTime())) return false;

            const fechaStr = toLocalDateString(fechaOrden);
            return fechaStr >= fechaInicio && fechaStr <= fechaFin;
        });

        // Una transacción es exitosa si `esExitosa` es true,
        // o si no hay discrepancia entre montoReal y montoEsperado.
        const exitoConteo = filtradas.filter((o: any) => {
            if (typeof o.esExitosa === "boolean") {
                return o.esExitosa;
            }

            const esperado = o.montoEsperado ?? 0;
            const real = o.montoReal ?? esperado;
            const dif = o.diferencia ?? (real - esperado);

            return Math.abs(dif) < 0.01;
        }).length;

        const totalConteo = filtradas.length;
        const tasa = totalConteo > 0 ? (exitoConteo / totalConteo) * 100 : 0;

        return {
            exitosas: exitoConteo,
            total: totalConteo,
            tasaExito: tasa.toFixed(1),
        };
    }, [ordenes, fechaInicio, fechaFin]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            {/* Header del Componente */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base">Transacciones Exitosas</h3>
                        <p className="text-xs text-gray-500">Órdenes completadas sin incidencias</p>
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
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 font-medium"
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
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 font-medium"
                        />
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                </div>
            </div>

            {/* Métrica Principal */}
            <div className="bg-teal-50/60 rounded-lg p-4 flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Completadas</span>
                    <div className="text-3xl font-extrabold text-teal-600 mt-0.5">
                        {exitosas} <span className="text-base font-medium text-teal-700">/ {total}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-teal-600 border border-teal-100 shadow-sm">
                        <Award className="w-3.5 h-3.5 text-teal-500" />
                        Efectividad: {tasaExito}%
                    </span>
                </div>
            </div>
        </div>
    );
};