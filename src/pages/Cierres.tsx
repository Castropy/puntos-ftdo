import React, { useEffect, useState } from "react";
import { History, RefreshCw, Calendar, PackageCheck, DollarSign, AlertCircle } from "lucide-react";
import type { CierreCaja } from "../types";
import { getHistorialCierres } from "../services/cierresService";

export const Cierres: React.FC = () => {
    const [cierres, setCierres] = useState<CierreCaja[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const cargarHistorial = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getHistorialCierres();
            setCierres(data);
        } catch (err: any) {
            console.error("Error al obtener historial de cierres:", err);
            setError("No se pudo obtener el historial de cierres de caja.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarHistorial();
    }, []);

    // Formatea un Timestamp de Firestore a string legible
    const formatFecha = (timestamp: any) => {
        if (!timestamp) return "Fecha no disponible";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("es-VE", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl font-bold text-farmatodo-textPrimary flex items-center gap-2">
                        <History className="w-6 h-6 text-farmatodo-blue" />
                        <span>Historial de Cierres de Caja</span>
                    </h1>
                    <p className="text-sm text-farmatodo-textSecondary mt-1">
                        Registro acumulado de cortes de turno y liquidaciones contables.
                    </p>
                </div>

                <button
                    onClick={cargarHistorial}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-farmatodo-textSecondary hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    <span>Actualizar</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border-l-4 border-farmatodo-red text-farmatodo-red text-sm rounded">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Contenido Principal */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <RefreshCw className="w-8 h-8 text-farmatodo-blue animate-spin" />
                </div>
            ) : cierres.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-lg border border-dashed border-gray-300 text-farmatodo-textSecondary">
                    <p className="text-base font-medium">No se han registrado cierres de caja aún.</p>
                    <p className="text-sm mt-1 text-gray-400">
                        Los cierres procesados desde el Dashboard aparecerán en esta vista.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cierres.map((cierre) => (
                        <div
                            key={cierre.id}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow"
                        >
                            {/* Fecha y Hora del Cierre */}
                            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                                <div className="flex items-center space-x-2 text-farmatodo-textPrimary">
                                    <Calendar className="w-4 h-4 text-farmatodo-blue" />
                                    <span className="text-sm font-bold">
                                        {formatFecha(cierre.fechaCierre)}
                                    </span>
                                </div>
                            </div>

                            {/* Estadísticas del Corte */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center text-xs text-farmatodo-textSecondary mb-1">
                                        <PackageCheck className="w-3.5 h-3.5 mr-1 text-farmatodo-blue" />
                                        <span>Total Pedidos</span>
                                    </div>
                                    <span className="text-lg font-bold text-farmatodo-textPrimary">
                                        {cierre.totalPedidos}
                                    </span>
                                </div>

                                <div className="bg-emerald-50 p-3 rounded-md">
                                    <div className="flex items-center text-xs text-emerald-700 mb-1">
                                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                                        <span>Monto Cierre</span>
                                    </div>
                                    <span className="text-lg font-bold text-emerald-800">
                                        ${cierre.totalMonto.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* ID de Referencia */}
                            <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 truncate">
                                Ref ID: <span className="font-mono">{cierre.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};