import React, { useState, useMemo } from "react";
import { Calendar, ShoppingBag, Filter } from "lucide-react";
import type { Orden } from "../types";

interface TotalOrdenesPorFechaProps {
    ordenes: Orden[];
}

// Auxiliar para formatear fecha a YYYY-MM-DD en hora local
const toLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const TotalOrdenesPorFecha: React.FC<TotalOrdenesPorFechaProps> = ({ ordenes }) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [fechaInicio, setFechaInicio] = useState<string>(toLocalDateString(firstDayOfMonth));
    const [fechaFin, setFechaFin] = useState<string>(toLocalDateString(now));

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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-farmatodo-blue rounded-lg">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base">Total de Órdenes</h3>
                        <p className="text-xs text-gray-500">Conteo de pedidos en rango de fechas</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Desde</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-farmatodo-blue text-gray-700 font-medium"
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
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-farmatodo-blue text-gray-700 font-medium"
                        />
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                </div>
            </div>

            <div className="bg-blue-50/60 rounded-lg p-4 flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Órdenes Procesadas</span>
                    <div className="text-3xl font-extrabold text-farmatodo-blue mt-0.5">
                        {ordenesFiltradas.length}
                    </div>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-farmatodo-blue border border-blue-100 shadow-sm">
                        <Filter className="w-3 h-3" />
                        {fechaInicio === fechaFin ? "Día seleccionado" : "Rango personalizado"}
                    </span>
                </div>
            </div>
        </div>
    );
};