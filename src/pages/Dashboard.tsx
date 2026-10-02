import React from "react";

// Vista principal para el control y gestion operativa en tiempo real
export const Dashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-xl font-bold text-farmatodo-textPrimary">
                    Control de Puntos Externos
                </h1>
                <p className="text-sm text-farmatodo-textSecondary mt-1">
                    Gestion de entregas y confirmaciones de dispositivos en turno.
                </p>
            </div>
        </div>
    );
};