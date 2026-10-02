import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { createDomiciliario } from "../services/domiciliariosService";
import type { Domiciliario } from "../types";

interface DomiciliarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (nuevoDomiciliario: Domiciliario) => void;
}

// Modal interactivo para la creacion rapida de domiciliarios
export const DomiciliarioModal: React.FC<DomiciliarioModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [nombre, setNombre] = useState<string>("");
    const [apellido, setApellido] = useState<string>("");
    const [cedula, setCedula] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    if (!isOpen) return null;

    // Maneja el envio del formulario y la creacion en Firestore
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!nombre.trim() || !apellido.trim() || !cedula.trim()) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        setLoading(true);

        try {
            const nuevo = await createDomiciliario({
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                cedula: cedula.trim(),
            });

            // Limpia el formulario y notifica al componente padre
            setNombre("");
            setApellido("");
            setCedula("");
            onSuccess(nuevo);
            onClose();
        } catch (err) {
            console.error("Error al registrar domiciliario:", err);
            setError("No se pudo guardar el domiciliario. Intente nuevamente.");
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
                        <UserPlus className="w-5 h-5" />
                        <h2 className="font-bold text-lg">Registrar Domiciliario</h2>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cuerpo del Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-farmatodo-red text-farmatodo-red text-sm rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-farmatodo-textPrimary mb-1">
                            Nombre
                        </label>
                        <input
                            type="text"
                            required
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Juan"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-farmatodo-textPrimary mb-1">
                            Apellido
                        </label>
                        <input
                            type="text"
                            required
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            placeholder="Ej. Pérez"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-farmatodo-textPrimary mb-1">
                            Cédula de Identidad
                        </label>
                        <input
                            type="text"
                            required
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            placeholder="Ej. V-12345678"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue"
                        />
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
                            {loading ? "Guardando..." : "Guardar Domiciliario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};