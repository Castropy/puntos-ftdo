import React, { useMemo } from "react";
import { CheckCircle2, Award } from "lucide-react";
import type { Orden } from "../types";

interface TransaccionesExitosasPorFechaProps {
    ordenes: Orden[];
}

export const TransaccionesExitosasPorFecha: React.FC<TransaccionesExitosasPorFechaProps> = ({ ordenes }) => {
    const { exitosas, total, tasaExito } = useMemo(() => {
        const exitoConteo = ordenes.filter((o: any) => {
            if (typeof o.esExitosa === "boolean") {
                return o.esExitosa;
            }

            const esperado = o.montoEsperado ?? 0;
            const real = o.montoReal ?? esperado;
            const dif = o.diferencia ?? (real - esperado);

            return Math.abs(dif) < 0.01;
        }).length;

        const totalConteo = ordenes.length;
        const tasa = totalConteo > 0 ? (exitoConteo / totalConteo) * 100 : 0;

        return {
            exitosas: exitoConteo,
            total: totalConteo,
            tasaExito: tasa.toFixed(1),
        };
    }, [ordenes]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[170px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base leading-tight">Transacciones Exitosas</h3>
                        <p className="text-xs text-gray-500">Órdenes sin incidencias</p>
                    </div>
                </div>
            </div>

            <div className="bg-teal-50/60 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">Completadas</span>
                    <div className="text-2xl font-extrabold text-teal-600 mt-0.5">
                        {exitosas} <span className="text-xs font-medium text-teal-700">/ {total}</span>
                    </div>
                </div>
                <div className="shrink-0 self-start sm:self-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-teal-600 border border-teal-100 shadow-sm whitespace-nowrap">
                        <Award className="w-3.5 h-3.5 text-teal-500" />
                        Efectividad: {tasaExito}%
                    </span>
                </div>
            </div>
        </div>
    );
};