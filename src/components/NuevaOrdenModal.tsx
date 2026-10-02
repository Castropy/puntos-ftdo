import React, { useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { createOrden } from "../services/ordenesService";
import { DomiciliarioSelect } from "./DomiciliarioSelect";
import type { Domiciliario, PuntoId } from "../types";

interface NuevaOrdenModalProps {
    isOpen: boolean;
    onClose: () => void;
    domiciliarios: Domiciliario[];
    onDomiciliarioCreado: (nuevo: Domiciliario) => void;
}

// Modal para la creacion e inicio del flujo de salida de un punto externo
export const NuevaOrdenModal: React.FC<NuevaOrdenModalProps> = ({
    isOpen,
    onClose,
    domiciliarios,
    onDomiciliarioCreado,
}) => {
    const [domiciliarioId, setDomiciliarioId] = useState<string>("");
    const [domiciliarioNombreCompleto, setDomiciliarioNombreCompleto] = useState<string>("");
    const [montoEsperado, setMontoEsperado] = useState<string>("");
    const [puntoId, setPuntoId] = useState<PuntoId>("A1");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    if (!isOpen) return null;

    // Actualiza la seleccion del domiciliario desde el componente hijo
    const handleDomiciliarioChange = (id: string, nombreCompleto: string) => {
        setDomiciliarioId(id);
        setDomiciliarioNombreCompleto(nombreCompleto);
    };

    // Maneja el envio e insercion de la nueva orden en Firestore
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const montoNumerico = parseFloat(montoEsperado);

        if (!domiciliarioId) {
            setError("Debe seleccionar un domiciliario.");
            return;
        }

        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            setError("Ingrese un monto valido mayor a 0.");
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

            // Limpia los campos y cierra el modal tras guardar exitosamente
            setDomiciliarioId("");
            setDomiciliarioNombreCompleto("");
            setMontoEsperado("");
            setPuntoId("A1");
            onClose();
        } catch (err) {
            console.error("Error al registrar orden:", err);
            setError("No se pudo crear la orden. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                {/* Encabezado del Modal */}
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

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-farmatodo-red text-farmatodo-red text-sm rounded">
                            {error}
                        </div>
                    )}

                    {/* Componente Selector de Domiciliarios */}
                    <DomiciliarioSelect
                        domiciliarios={domiciliarios}
                        selectedId={domiciliarioId}
                        onChange={handleDomiciliarioChange}
                        onDomiciliarioCreado={onDomiciliarioCreado}
                    />

                    {/* Campo de Monto Esperado */}
                    <div>
                        <label className="block text-sm font-medium text-farmatodo-textPrimary mb-1">
                            Monto a Cobrar (Bs.)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={montoEsperado}
                            onChange={(e) => setMontoEsperado(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue text-sm"
                        />
                    </div>

                    {/* Selector de Punto de Venta Externalizado */}
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

                    {/* Botones de Accion */}
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