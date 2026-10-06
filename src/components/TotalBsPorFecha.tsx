import React, { useState, useMemo } from "react";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";
import type { Orden } from "../types";
import { formatBolivares } from "../utils/formatters";

interface TotalBsPorFechaProps {
    ordenes: Orden[];
}

// Auxiliar para formatear fecha a YYYY-MM-DD en hora local
const toLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const TotalBsPorFecha: React.FC<TotalBsPorFechaProps> = ({ ordenes }) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [fechaInicio, setFechaInicio] = useState<string>(toLocalDateString(firstDayOfMonth));
    const [fechaFin, setFechaFin] = useState<string>(toLocalDateString(now));

    const { totalMonto, ordenesContabilizadas } = useMemo(() => {
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

        const suma = filtradas.reduce(
            (acc, orden) => acc + (orden.montoReal ?? orden.montoEsperado ?? 0),
            0
        );

        return {
            totalMonto: suma,
            ordenesContabilizadas: filtradas.length,
        };
    }, [ordenes, fechaInicio, fechaFin]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            {/* Header del Componente */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base">Total recaudado (Bs.)</h3>
                        <p className="text-xs text-gray-500">Monto total de cobros por rango de fecha</p>
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
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 font-medium"
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
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 font-medium"
                        />
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                </div>
            </div>

            {/* Métrica Principal con Formato VE */}
            <div className="bg-emerald-50/60 rounded-lg p-4 flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Monto Total</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-0.5">
                        Bs. {formatBolivares(totalMonto)}
                    </div>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-emerald-600 border border-emerald-100 shadow-sm">
                        <TrendingUp className="w-3 h-3" />
                        {ordenesContabilizadas} {ordenesContabilizadas === 1 ? "orden" : "órdenes"}
                    </span>
                </div>
            </div>
        </div>
    );
};