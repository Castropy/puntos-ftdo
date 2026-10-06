import React from "react";
import { CheckCircle2, AlertTriangle, Clock, User, Timer } from "lucide-react";
import type { Orden } from "../types";

interface OrdenConfirmadaCardProps {
    orden: Orden;
}

// Convierte timestamps de Firestore o Date a formato de hora legible HH:MM AM/PM
const formatHora = (timestamp: Orden["horaConfirmacion"] | Orden["horaCreacion"]): string => {
    if (!timestamp) return "--:--";
    const date = typeof timestamp === "object" && "toDate" in timestamp && typeof timestamp.toDate === "function"
        ? timestamp.toDate()
        : timestamp instanceof Date ? timestamp : null;

    return date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
};

// Calcula la duración total transcurrida fuera de tienda en minutos u horas
const calcularDuracion = (inicio: Orden["horaCreacion"], fin: Orden["horaConfirmacion"]): string => {
    if (!inicio || !fin) return "";

    const dateInicio = typeof inicio === "object" && "toDate" in inicio && typeof inicio.toDate === "function" ? inicio.toDate() : inicio instanceof Date ? inicio : null;
    const dateFin = typeof fin === "object" && "toDate" in fin && typeof fin.toDate === "function" ? fin.toDate() : fin instanceof Date ? fin : null;

    if (!dateInicio || !dateFin) return "";

    const diffMs = dateFin.getTime() - dateInicio.getTime();
    const diffMins = Math.max(0, Math.round(diffMs / (1000 * 60)));

    if (diffMins < 60) {
        return `${diffMins} min`;
    }
    const horas = Math.floor(diffMins / 60);
    const minsRestantes = diffMins % 60;
    return `${horas}h ${minsRestantes}m`;
};

// Tarjeta para visualizar las órdenes procesadas exitosamente o con discrepancia
export const OrdenConfirmadaCard: React.FC<OrdenConfirmadaCardProps> = ({ orden }) => {
    const esExitosa = orden.esExitosa ?? true;
    const horaSalida = formatHora(orden.horaCreacion);
    const horaLlegada = formatHora(orden.horaConfirmacion || orden.horaCreacion);
    const duracion = calcularDuracion(orden.horaCreacion, orden.horaConfirmacion);

    return (
        <div
            className={`bg-white rounded-lg border border-l-4 p-4 shadow-sm transition-shadow ${esExitosa
                    ? "border-emerald-200 border-l-emerald-500"
                    : "border-amber-300 border-l-amber-500 bg-amber-50/30"
                }`}
        >
            <div className="space-y-2.5">
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

                {/* Nombre del Domiciliario */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1.5 text-farmatodo-textPrimary font-medium truncate">
                        <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{orden.domiciliarioNombreCompleto}</span>
                    </div>
                </div>

                {/* Intervalo de tiempo en ruta y tiempo fuera de tienda */}
                <div className="bg-gray-50 p-2 rounded border border-gray-100 text-xs flex items-center justify-between text-farmatodo-textSecondary">
                    <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Ruta: {horaSalida} - {horaLlegada}</span>
                    </div>
                    {duracion && (
                        <div className="flex items-center space-x-1 font-semibold text-farmatodo-blue">
                            <Timer className="w-3.5 h-3.5" />
                            <span>{duracion} fuera</span>
                        </div>
                    )}
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