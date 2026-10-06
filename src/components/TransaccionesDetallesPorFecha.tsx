import React, { useState, useMemo } from "react";
import { FileText, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import type { Orden } from "../types";
import { formatBolivares } from "../utils/formatters";

interface TransaccionesDetallesPorFechaProps {
    ordenes: Orden[];
}

export const TransaccionesDetallesPorFecha: React.FC<TransaccionesDetallesPorFechaProps> = ({ ordenes }) => {
    const [expandido, setExpandido] = useState<boolean>(true);

    const discrepanciasFiltradas = useMemo(() => {
        return ordenes.filter((orden: any) => {
            const esperado = orden.montoEsperado ?? 0;
            const real = orden.montoReal ?? esperado;
            const dif = orden.diferencia ?? (real - esperado);

            return Math.abs(dif) > 0.01 || real !== esperado;
        });
    }, [ordenes]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base">Discrepancias en Transacciones</h3>
                        <p className="text-xs text-gray-500">Transacciones donde el monto real difiere del monto esperado</p>
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

            {expandido && (
                <div className="mt-4 overflow-x-auto border border-gray-100 rounded-lg">
                    {discrepanciasFiltradas.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" />
                            No hay discrepancias registradas en el rango de fechas seleccionado.
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="p-3">Punto</th>
                                    <th className="p-3">Monto Esperado</th>
                                    <th className="p-3">Monto Real</th>
                                    <th className="p-3">Diferencia</th>
                                    <th className="p-3">Categoría</th>
                                    <th className="p-3">Detalle / Motivo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {discrepanciasFiltradas.map((orden: any) => {
                                    const esperado = orden.montoEsperado ?? 0;
                                    const real = orden.montoReal ?? 0;
                                    const dif = orden.diferencia ?? (real - esperado);
                                    const punto = orden.puntoId || orden.punto || "S/N";
                                    const categoria = orden.motivoCategoria || "N/A";
                                    const detalle = orden.motivoDetalle || "-";

                                    return (
                                        <tr key={orden.id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="p-3 font-bold text-gray-800">{punto}</td>
                                            <td className="p-3 font-semibold text-gray-700">Bs. {formatBolivares(esperado)}</td>
                                            <td className="p-3 font-semibold text-gray-900">Bs. {formatBolivares(real)}</td>
                                            <td className={`p-3 font-bold ${dif < 0 ? "text-red-500" : "text-emerald-600"}`}>
                                                Bs. {formatBolivares(dif)}
                                            </td>
                                            <td className="p-3 capitalize text-gray-600 font-medium">{categoria}</td>
                                            <td className="p-3 text-gray-500 italic">{detalle}</td>
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