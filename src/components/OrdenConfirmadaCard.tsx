import React from "react";
import { CheckCircle2, AlertTriangle, Clock, User } from "lucide-react";
import type { Orden } from "../types";

interface OrdenConfirmadaCardProps {
    orden: Orden;
}

// Formatea timestamps de Firestore o fechas a formato de hora legible HH:MM
const formatHora = (timestamp: Orden["horaConfirmacion"] | Orden["horaCreacion"]): string => {
    if (!timestamp) return "--:--";
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Tarjeta para visualizar las ordenes procesadas exitosamente o con discrepancia
export const OrdenConfirmadaCard: React.FC<OrdenConfirmadaCardProps> = ({ orden }) => {
    const esExitosa = orden.esExitosa ?? true;

    return (
        <div
            className={`bg-white rounded-lg border p-4 shadow-sm transition-shadow ${esExitosa ? "border-emerald-200" : "border-amber-300 bg-amber-50/30"
                }`}
        >
            <div className="space-y-2">
                {/* Encabezado con estado e identificador de punto */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center space-x-1.5">
                        {esExitosa ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                        )}
                        <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${esExitosa
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                        >
                            {esExitosa ? "Sin Discrepancia" : "Con Discrepancia"}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                        Punto {orden.puntoId}
                    </span>
                </div>

                {/* Nombre del Domiciliario y Hora de Confirmacion */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1.5 text-farmatodo-textPrimary font-medium truncate max-w-[180px]">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{orden.domiciliarioNombreCompleto}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-farmatodo-textSecondary">
                        <Clock className="w-3 h-3" />
                        <span>{formatHora(orden.horaConfirmacion || orden.horaCreacion)}</span>
                    </div>
                </div>

                {/* Desglose de Montos y Diferencia */}
                <div className="pt-2 text-xs space-y-1 bg-gray-50 p-2 rounded border border-gray-100">
                    <div className="flex justify-between text-gray-600">
                        <span>Monto Esperado:</span>
                        <span>Bs. {orden.montoEsperado.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-farmatodo-textPrimary">
                        <span>Monto Real:</span>
                        <span>Bs. {(orden.montoReal ?? orden.montoEsperado).toFixed(2)}</span>
                    </div>
                    {orden.diferencia !== undefined && orden.diferencia !== 0 && (
                        <div
                            className={`flex justify-between font-bold pt-1 border-t border-gray-200 ${orden.diferencia > 0 ? "text-emerald-600" : "text-farmatodo-red"
                                }`}
                        >
                            <span>Diferencia:</span>
                            <span>
                                {orden.diferencia > 0 ? "+" : ""}
                                Bs. {orden.diferencia.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Motivo registrado en caso de discrepancia */}
                {!esExitosa && orden.motivoDetalle && (
                    <div className="mt-2 text-xs text-amber-900 bg-amber-100/60 p-2 rounded border border-amber-200">
                        <span className="font-semibold block mb-0.5">Motivo:</span>
                        <p className="italic text-amber-800">{orden.motivoDetalle}</p>
                    </div>
                )}
            </div>
        </div>
    );
};