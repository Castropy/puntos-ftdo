import React, { useState, useMemo } from "react";
import { Calendar, FileText, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import type { Orden } from "../types";
import { formatBolivares } from "../utils/formatters";

interface TransaccionesDetallesPorFechaProps {
    ordenes: Orden[];
}

export const TransaccionesDetallesPorFecha: React.FC<TransaccionesDetallesPorFechaProps> = ({ ordenes }) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const [fechaInicio, setFechaInicio] = useState<string>(todayStr);
    const [fechaFin, setFechaFin] = useState<string>(todayStr);
    const [expandido, setExpandido] = useState<boolean>(false);

    const ordenesFiltradas = useMemo(() => {
        return ordenes.filter((orden) => {
            const rawFecha = orden.horaCreacion;
            if (!rawFecha) return false;

            const fechaOrden = typeof rawFecha === "object" && "toDate" in rawFecha
                ? rawFecha.toDate()
                : new Date(rawFecha);

            if (isNaN(fechaOrden.getTime())) return false;

            const fechaStr = fechaOrden.toISOString().split("T")[0];
            return fechaStr >= fechaInicio && fechaStr <= fechaFin;
        });
    }, [ordenes, fechaInicio, fechaFin]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
            {/* Header del Componente */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base">Detalle de Transacciones</h3>
                        <p className="text-xs text-gray-500">Desglose de montos esperados vs. reales por orden</p>
                    </div>
                </div>
                <button
                    onClick={() => setExpandido(!expandido)}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                >
                    {expandido ? "Ocultar tabla" : "Ver detalles"}
                    {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Controles de Filtro por Fecha */}
            <div className="grid grid-cols-2 gap-3 my-4 max-w-md">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Desde</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700 font-medium"
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
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700 font-medium"
                        />
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                </div>
            </div>

            {/* Tabla desplegable de transacciones */}
            {expandido && (
                <div className="mt-2 overflow-x-auto border border-gray-100 rounded-lg">
                    {ordenesFiltradas.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            No hay transacciones registradas en el rango de fechas seleccionado.
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="p-3">Nro. Orden</th>
                                    <th className="p-3">Motorizado</th>
                                    <th className="p-3">Monto Esperado</th>
                                    <th className="p-3">Monto Real</th>
                                    <th className="p-3">Diferencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {ordenesFiltradas.map((orden: any) => {
                                    const real = orden.montoReal ?? 0;
                                    const esperado = orden.montoEsperado ?? 0;
                                    const dif = real - esperado;
                                    const numOrden = orden.numero || orden.numeroOrden || orden.id?.slice(0, 6);
                                    const motorizado = orden.motorizadoNombre || orden.nombreMotorizado || orden.motorizado || "Sin asignar";

                                    return (
                                        <tr key={orden.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-3 font-medium text-gray-800">#{numOrden}</td>
                                            <td className="p-3 text-gray-600">{motorizado}</td>
                                            <td className="p-3 font-semibold text-gray-700">Bs. {formatBolivares(esperado)}</td>
                                            <td className="p-3 font-semibold text-emerald-600">Bs. {formatBolivares(real)}</td>
                                            <td className={`p-3 font-bold ${dif < 0 ? "text-red-500" : dif > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                                                {dif === 0 ? "-" : `Bs. ${formatBolivares(dif)}`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};