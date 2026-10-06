import React, { useMemo } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import type { Orden } from "../types";
import { formatBolivares } from "../utils/formatters";

interface TotalBsPorFechaProps {
    ordenes: Orden[];
}

export const TotalBsPorFecha: React.FC<TotalBsPorFechaProps> = ({ ordenes }) => {
    const totalMonto = useMemo(() => {
        return ordenes.reduce(
            (acc, orden) => acc + (orden.montoReal ?? orden.montoEsperado ?? 0),
            0
        );
    }, [ordenes]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[170px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base leading-tight">Total recaudado (Bs.)</h3>
                        <p className="text-xs text-gray-500">Monto total de cobros efectuados</p>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-50/60 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
                <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Monto Total</span>
                    <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-emerald-600 leading-snug truncate">
                        Bs. {formatBolivares(totalMonto)}
                    </div>
                </div>
                <div className="shrink-0 self-start sm:self-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-emerald-600 border border-emerald-100 shadow-sm whitespace-nowrap">
                        <TrendingUp className="w-3 h-3" />
                        {ordenes.length} {ordenes.length === 1 ? "orden" : "órdenes"}
                    </span>
                </div>
            </div>
        </div>
    );
};