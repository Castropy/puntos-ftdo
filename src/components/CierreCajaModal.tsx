import React, { useState } from "react";
import { X, DollarSign, PackageCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import type { Orden } from "../types";
import { ejecutarCierreCaja } from "../services/cierresService";
import { useAuth } from "../context/AuthContext";
import { formatBolivares } from "../utils/formatters";

interface CierreCajaModalProps {
    isOpen: boolean;
    onClose: () => void;
    ordenesConfirmadas: Orden[];
    onCierreExitoso: () => void;
}

export const CierreCajaModal: React.FC<CierreCajaModalProps> = ({
    isOpen,
    onClose,
    ordenesConfirmadas,
    onCierreExitoso,
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Estado para controlar la alerta/confirmación adicional
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState<boolean>(false);

    if (!isOpen) return null;

    // Cálculo total del monto cobrado en el corte actual
    const totalMonto = ordenesConfirmadas.reduce(
        (acc, orden) => acc + (orden.montoReal ?? orden.montoEsperado),
        0
    );

    const handleCerrarModal = () => {
        if (loading) return;
        setMostrarConfirmacion(false);
        setError("");
        onClose();
    };

    const handleConfirmarCierre = async () => {
        if (!user) {
            setError("No hay una sesión activa para registrar el cierre.");
            return;
        }

        if (ordenesConfirmadas.length === 0) {
            setError("No existen órdenes confirmadas para cerrar en este turno.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await ejecutarCierreCaja(ordenesConfirmadas, user.uid);
            setMostrarConfirmacion(false);
            onCierreExitoso();
            onClose();
        } catch (err: any) {
            console.error("Error al ejecutar cierre de caja:", err);
            setError(err.message || "Error al procesar el cierre de caja.");
            setMostrarConfirmacion(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden border border-gray-100">
                {/* Encabezado del Modal */}
                <div className="flex items-center justify-between px-6 py-4 bg-farmatodo-blue text-white">
                    <h2 className="text-lg font-bold">Confirmar Cierre de Caja</h2>
                    <button
                        onClick={handleCerrarModal}
                        disabled={loading}
                        className="p-1 hover:bg-farmatodo-blueHover rounded-full transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cuerpo del Modal */}
                <div className="p-6 space-y-5">
                    {error && (
                        <div className="flex items-center space-x-2 p-3 bg-red-50 text-farmatodo-red border-l-4 border-farmatodo-red rounded text-sm">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!mostrarConfirmacion ? (
                        <>
                            <p className="text-sm text-farmatodo-textSecondary">
                                Al realizar el cierre, todas las órdenes recibidas desde el último corte
                                se consolidarán y la vista del Dashboard se reiniciará para el siguiente tramo del día.
                            </p>

                            {/* Tarjetas de Resumen */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-farmatodo-blue mb-2">
                                        <span className="text-xs font-semibold uppercase">Total Puntos</span>
                                        <PackageCheck className="w-5 h-5" />
                                    </div>
                                    <span className="text-2xl font-bold text-farmatodo-textPrimary">
                                        {ordenesConfirmadas.length}
                                    </span>
                                </div>

                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-emerald-600 mb-2">
                                        <span className="text-xs font-semibold uppercase">Monto Total</span>
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <span className="text-2xl font-bold text-farmatodo-textPrimary">
                                        Bs. {formatBolivares(totalMonto)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded text-xs text-amber-800">
                                <strong>Atención:</strong> Esta acción asociará {ordenesConfirmadas.length} órdenes
                                a este nuevo corte contable. Asegúrese de haber recibido todos los dispositivos antes de proceder.
                            </div>
                        </>
                    ) : (
                        /* Vista de Confirmación Estricta / Alerta */
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                            <div className="flex items-center space-x-3 text-farmatodo-red">
                                <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                                <h3 className="font-bold text-base">¿Está completamente seguro?</h3>
                            </div>
                            <p className="text-sm text-gray-700">
                                Se registrará el cierre de caja por un total de{" "}
                                <strong>Bs. {formatBolivares(totalMonto)}</strong> correspondiendo a{" "}
                                <strong>{ordenesConfirmadas.length} puntos</strong>.
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                                Esta acción es irreversible y reiniciará el turno actual.
                            </p>
                        </div>
                    )}
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    {!mostrarConfirmacion ? (
                        <>
                            <button
                                type="button"
                                onClick={handleCerrarModal}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 text-farmatodo-textSecondary hover:bg-gray-100 text-sm font-medium rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => setMostrarConfirmacion(true)}
                                disabled={loading || ordenesConfirmadas.length === 0}
                                className="px-4 py-2 bg-farmatodo-blue hover:bg-farmatodo-blueHover text-white text-sm font-medium rounded-md shadow-sm transition-colors disabled:opacity-50"
                            >
                                Ejecutar Cierre
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setMostrarConfirmacion(false)}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium rounded-md transition-colors"
                            >
                                Volver Atrás
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmarCierre}
                                disabled={loading}
                                className="px-4 py-2 bg-farmatodo-red hover:bg-red-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors disabled:opacity-50"
                            >
                                {loading ? "Procesando Cierre..." : "Sí, Confirmar Cierre"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};