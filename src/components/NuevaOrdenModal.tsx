import React, { useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { createOrden } from "../services/ordenesService";
import { DomiciliarioSelect } from "./DomiciliarioSelect";
import { formatBolivares } from "../utils/formatters";
import type { Domiciliario, PuntoId } from "../types";

interface NuevaOrdenModalProps {
    isOpen: boolean;
    onClose: () => void;
    domiciliarios: Domiciliario[];
    onDomiciliarioCreado: (nuevo: Domiciliario) => void;
}

// Convierte un string de input (que puede contener comas o puntos) a un float numérico limpio
const parseMontoInput = (value: string): number => {
    if (!value) return 0;
    // Remueve puntos de miles y cambia comas por punto decimal
    const cleanValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanValue);
};

export const NuevaOrdenModal: React.FC<NuevaOrdenModalProps> = ({
    isOpen,
    onClose,
    domiciliarios,
    onDomiciliarioCreado,
}) => {
    const [domiciliarioId, setDomiciliarioId] = useState<string>("");
    const [domiciliarioNombreCompleto, setDomiciliarioNombreCompleto] = useState<string>("");
    const [montoInput, setMontoInput] = useState<string>("");
    const [puntoId, setPuntoId] = useState<PuntoId>("A1");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    if (!isOpen) return null;

    const handleDomiciliarioChange = (id: string, nombreCompleto: string) => {
        setDomiciliarioId(id);
        setDomiciliarioNombreCompleto(nombreCompleto);
    };

    // Formatea el valor al perder el foco (onBlur) para mostrar la sintaxis VE (1.234,56)
    const handleMontoBlur = () => {
        const montoNum = parseMontoInput(montoInput);
        if (!isNaN(montoNum) && montoNum > 0) {
            setMontoInput(formatBolivares(montoNum));
        }
    };

    // Al enfocar (onFocus), remueve los puntos de miles para permitir una edición más sencilla
    const handleMontoFocus = () => {
        const montoNum = parseMontoInput(montoInput);
        if (!isNaN(montoNum) && montoNum > 0) {
            setMontoInput(montoNum.toString().replace(".", ","));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setError("");

        const montoNumerico = parseMontoInput(montoInput);

        if (!domiciliarioId) {
            setError("Debe seleccionar un domiciliario.");
            return;
        }

        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            setError("Ingrese un monto válido mayor a 0.");
            return;
        }

        setLoading(true);

        try {
            await createOrden({
                domiciliarioId,
                domiciliarioNombreCompleto,
                montoEsperado: montoNumerico,
                puntoId,
            });

            setDomiciliarioId("");
            setDomiciliarioNombreCompleto("");
            setMontoInput("");
            setPuntoId("A1");
            onClose();
        } catch (err) {
            console.error("Error al registrar orden:", err);
            setError("No se pudo crear la orden. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const montoCalculado = parseMontoInput(montoInput);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-farmatodo-blue text-white">
                    <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5" />
                        <h2 className="font-bold text-lg">Nueva Orden</h2>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-farmatodo-red text-farmatodo-red text-sm rounded">
                            {error}
                        </div>
                    )}

                    <DomiciliarioSelect
                        domiciliarios={domiciliarios}
                        selectedId={domiciliarioId}
                        onChange={handleDomiciliarioChange}
                        onDomiciliarioCreado={onDomiciliarioCreado}
                    />

                    {/* Campo de Monto Esperado Formateado */}
                    <div>
                        <label className="block text-sm font-medium text-farmatodo-textPrimary mb-1">
                            Monto a Cobrar
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 font-semibold text-sm">Bs.</span>
                            </div>
                            <input
                                type="text"
                                inputMode="decimal"
                                required
                                value={montoInput}
                                onChange={(e) => setMontoInput(e.target.value)}
                                onBlur={handleMontoBlur}
                                onFocus={handleMontoFocus}
                                placeholder="0,00"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue text-sm font-bold text-farmatodo-textPrimary"
                            />
                        </div>
                        {/* Previsualización del formato VE mientras se edita */}
                        {montoInput && !isNaN(montoCalculado) && montoCalculado > 0 && (
                            <p className="mt-1 text-xs text-farmatodo-textSecondary text-right">
                                Confirmado: <span className="font-bold text-farmatodo-blue">Bs. {formatBolivares(montoCalculado)}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-farmatodo-textPrimary mb-1">
                            Punto de Venta Asignado
                        </label>
                        <select
                            value={puntoId}
                            onChange={(e) => setPuntoId(e.target.value as PuntoId)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue text-sm"
                        >
                            <option value="A1">Punto A1</option>
                            <option value="A2">Punto A2</option>
                            <option value="A3">Punto A3</option>
                            <option value="A4">Punto A4</option>
                        </select>
                    </div>

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
                            {loading ? "Creando..." : "Crear Orden"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};