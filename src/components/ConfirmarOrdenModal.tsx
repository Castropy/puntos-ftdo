import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import type { Orden, MotivoCategoria } from "../types";
import { confirmarOrden } from "../services/ordenesService";

interface ConfirmarOrdenModalProps {
    orden: Orden | null;
    isOpen: boolean;
    onClose: () => void;
}

// Componente modal para confirmar la recepción de puntos de venta y registrar descuadres
export const ConfirmarOrdenModal: React.FC<ConfirmarOrdenModalProps> = ({
    orden,
    isOpen,
    onClose,
}) => {
    const [montoReal, setMontoReal] = useState<string>("");
    const [motivoCategoria, setMotivoCategoria] = useState<MotivoCategoria>("efectivo_complementario");
    const [motivoDetalle, setMotivoDetalle] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Asigna el monto esperado como valor por defecto al seleccionar una orden
    useEffect(() => {
        if (orden) {
            setMontoReal(orden.montoEsperado.toString());
            setMotivoDetalle("");
            setError("");
        }
    }, [orden]);

    if (!isOpen || !orden) return null;

    const montoEsperado = orden.montoEsperado;
    const montoRealNum = parseFloat(montoReal) || 0;
    const diferencia = montoRealNum - montoEsperado;
    const hayDiferencia = montoReal !== "" && Math.abs(diferencia) > 0.01;

    // Maneja el procesamiento y la confirmación de la orden
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (isNaN(montoRealNum) || montoRealNum <= 0) {
            setError("Ingrese un monto real cobrado válido.");
            return;
        }

        if (hayDiferencia && !motivoDetalle.trim()) {
            setError("Debe proporcionar una explicación detallada de la discrepancia.");
            return;
        }

        setLoading(true);

        try {
            const esExitosa = !hayDiferencia;

            // Transfiere los datos de confirmación a la capa de servicio
            await confirmarOrden(orden.id, {
                montoReal: montoRealNum,
                diferencia,
                esExitosa,
                motivoCategoria: hayDiferencia ? motivoCategoria : undefined,
                motivoDetalle: hayDiferencia ? motivoDetalle.trim() : undefined,
            });

            // Cierra el modal tras procesar la orden exitosamente
            onClose();
        } catch (err) {
            console.error("Error al confirmar orden:", err);
            setError("No se pudo procesar la confirmación. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                {/* Encabezado del modal */}
                <div className="flex items-center justify-between px-6 py-4 bg-farmatodo-blue text-white">
                    <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <h2 className="font-bold text-lg">Recepción de Punto {orden.puntoId}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Formulario de recepción */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-farmatodo-red text-farmatodo-red text-sm rounded">
                            {error}
                        </div>
                    )}

                    {/* Banner informativo de ayuda visual */}
                    <div className="flex items-start space-x-2.5 p-3 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-900">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p>
                            El monto coincide con el registrado. <span className="font-semibold">Si el cobro fue diferente</span>, modifique la cifra para indicar el motivo de la diferencia.
                        </p>
                    </div>

                    {/* Resumen del domiciliario y monto esperado */}
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-100 space-y-1">
                        <p className="text-xs text-farmatodo-textSecondary">Domiciliario:</p>
                        <p className="text-sm font-semibold text-farmatodo-textPrimary">
                            {orden.domiciliarioNombreCompleto}
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                            <span className="text-xs text-farmatodo-textSecondary">Monto Esperado:</span>
                            <span className="text-base font-bold text-farmatodo-blue">
                                Bs. {montoEsperado.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Campo para ingresar el monto real cobrado */}
                    <div>
                        <label className="block text-sm font-medium text-farmatodo-textPrimary mb-1">
                            Monto Real Cobrado (Bs.)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={montoReal}
                            onChange={(e) => setMontoReal(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder={`Ej. ${montoEsperado.toFixed(2)}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue text-sm font-semibold text-farmatodo-textPrimary"
                        />
                    </div>

                    {/* Sección condicional para indicar discrepancias */}
                    {hayDiferencia && (
                        <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <div className="flex items-center space-x-2 text-amber-800 font-semibold text-xs">
                                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                <span>
                                    Discrepancia detectada: {diferencia > 0 ? "+" : ""}
                                    Bs. {diferencia.toFixed(2)}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-amber-900 mb-1">
                                    Categoría del Motivo
                                </label>
                                <select
                                    value={motivoCategoria}
                                    onChange={(e) => setMotivoCategoria(e.target.value as MotivoCategoria)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                                >
                                    <option value="efectivo_complementario">Efectivo complementario</option>
                                    <option value="mas_de_1_transaccion">Más de 1 transacción</option>
                                    <option value="propina">Propina / Ajuste</option>
                                    <option value="otro">Otro motivo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-amber-900 mb-1">
                                    Explicación Detallada
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={motivoDetalle}
                                    onChange={(e) => setMotivoDetalle(e.target.value)}
                                    placeholder="Escriba la razón de la diferencia..."
                                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Botones de control del modal */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-farmatodo-textSecondary hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-farmatodo-blue hover:bg-farmatodo-blueHover rounded-md shadow-sm disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Procesando..." : "Confirmar Recepción"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};