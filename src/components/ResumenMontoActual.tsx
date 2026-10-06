import React from "react";
import { DollarSign, Store, Wallet } from "lucide-react";
import { formatBolivares } from "../utils/formatters";

interface TransaccionPunto {
    punto: "A1" | "A2" | "A3" | "A4" | string;
    monto: number;
}

interface ResumenMontoActualProps {
    /** Lista de transacciones registradas en el turno actual (después del último cierre) */
    transaccionesTurno: TransaccionPunto[];
}

export const ResumenMontoActual: React.FC<ResumenMontoActualProps> = ({
    transaccionesTurno,
}) => {
    // Puntos fijos a monitorear
    const puntosFijos = ["A1", "A2", "A3", "A4"];

    // Calcular el monto acumulado por cada punto específico
    const desglosePuntos = puntosFijos.map((punto) => {
        const totalPunto = transaccionesTurno
            .filter((t) => t.punto.toUpperCase() === punto)
            .reduce((acc, t) => acc + (t.monto || 0), 0);

        return { punto, total: totalPunto };
    });

    // Suma total general que debe haber en caja antes del cierre
    const totalGeneral = desglosePuntos.reduce((acc, p) => acc + p.total, 0);

    return (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 space-y-4">
            {/* Encabezado del Arqueo Proyectado */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2 text-farmatodo-textPrimary">
                    <div className="p-2 bg-blue-50 text-farmatodo-blue rounded-lg">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold">Ingreso acumulado en puntos externos</h2>
                        <p className="text-xs text-farmatodo-textSecondary">
                            Monto esperado en caja antes del próximo cierre
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
                        Total Esperado
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600 flex items-center justify-end">
                        <DollarSign className="w-5 h-5 mr-0.5 stroke-[2.5]" />
                        Bs. {formatBolivares(totalGeneral)}
                    </span>
                </div>
            </div>

            {/* Desglose por Puntos (A1, A2, A3, A4) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {desglosePuntos.map(({ punto, total }) => (
                    <div
                        key={punto}
                        className="bg-gray-50 border border-gray-200/60 rounded-md p-3 transition-colors hover:bg-gray-100/80"
                    >
                        <div className="flex items-center justify-between text-xs text-farmatodo-textSecondary mb-1.5">
                            <span className="font-bold text-farmatodo-blue flex items-center gap-1">
                                <Store className="w-3.5 h-3.5" />
                                Punto {punto}
                            </span>
                        </div>
                        <p className="text-base font-bold text-farmatodo-textPrimary">
                            Bs. {formatBolivares(total)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};