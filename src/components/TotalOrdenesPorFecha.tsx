import React from "react";
import { ShoppingBag, Filter } from "lucide-react";
import type { Orden } from "../types";

interface TotalOrdenesPorFechaProps {
    ordenes: Orden[];
    fechaInicio: string;
    fechaFin: string;
}

export const TotalOrdenesPorFecha: React.FC<TotalOrdenesPorFechaProps> = ({ ordenes, fechaInicio, fechaFin }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[170px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-farmatodo-blue rounded-lg shrink-0">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base leading-tight">Total de Órdenes</h3>
                        <p className="text-xs text-gray-500">Conteo de pedidos procesados</p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50/60 rounded-lg p-3.5 flex items-center justify-between gap-2 mt-4">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Órdenes Procesadas</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-farmatodo-blue mt-0.5">
                        {ordenes.length}
                    </div>
                </div>
                <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-farmatodo-blue border border-blue-100 shadow-sm whitespace-nowrap">
                        <Filter className="w-3 h-3" />
                        {fechaInicio === fechaFin ? "Día seleccionado" : "Rango activo"}
                    </span>
                </div>
            </div>
        </div>
    );
};