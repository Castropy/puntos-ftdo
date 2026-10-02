import React from "react";
import { Clock, CreditCard, User, ArrowRightCircle } from "lucide-react";
import type { Orden } from "../types";

interface OrdenPendienteCardProps {
    orden: Orden;
    onConfirmar: (orden: Orden) => void;
}

// Formatea timestamps de Firestore o fechas a formato de hora legible HH:MM
const formatHora = (timestamp: Orden["horaCreacion"]): string => {
    if (!timestamp) return "--:--";
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Tarjeta para visualizar las ordenes que se encuentran activas en ruta
export const OrdenPendienteCard: React.FC<OrdenPendienteCardProps> = ({
    orden,
    onConfirmar,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
                {/* Encabezado con Punto asignado y Hora */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        Punto {orden.puntoId}
                    </span>
                    <div className="flex items-center text-xs text-farmatodo-textSecondary space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatHora(orden.horaCreacion)}</span>
                    </div>
                </div>

                {/* Informacion del domiciliario y monto a recibir */}
                <div className="space-y-1.5">
                    <div className="flex items-center text-sm font-medium text-farmatodo-textPrimary space-x-2">
                        <User className="w-4 h-4 text-farmatodo-blue flex-shrink-0" />
                        <span className="truncate">{orden.domiciliarioNombreCompleto}</span>
                    </div>

                    <div className="flex items-center text-lg font-bold text-farmatodo-blue space-x-2 pt-1">
                        <CreditCard className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span>Bs. {orden.montoEsperado.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Accion de recepcion/confirmacion */}
            <div className="pt-4 mt-2 border-t border-gray-50">
                <button
                    type="button"
                    onClick={() => onConfirmar(orden)}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-farmatodo-blue hover:bg-farmatodo-blueHover text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                >
                    <span>Recibir Punto</span>
                    <ArrowRightCircle className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};