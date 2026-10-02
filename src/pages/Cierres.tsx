import React from "react";

// Vista de historial y auditoria para los cierres de caja realizados
export const Cierres: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-xl font-bold text-farmatodo-textPrimary">
                    Historial de Cierres de Caja
                </h1>
                <p className="text-sm text-farmatodo-textSecondary mt-1">
                    Registro consolidado de cortes y montos acumulados por turno.
                </p>
            </div>
        </div>
    );
};