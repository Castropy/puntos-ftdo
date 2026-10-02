import React, { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import type { Domiciliario } from "../types";
import { DomiciliarioModal } from "./DomiciliarioModal";

interface DomiciliarioSelectProps {
    domiciliarios: Domiciliario[];
    selectedId: string;
    onChange: (id: string, nombreCompleto: string) => void;
    onDomiciliarioCreado: (nuevo: Domiciliario) => void;
}

// Componente selector de domiciliarios con opcion de registro directo
export const DomiciliarioSelect: React.FC<DomiciliarioSelectProps> = ({
    domiciliarios,
    selectedId,
    onChange,
    onDomiciliarioCreado,
}) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Procesa el cambio en la seleccion de la lista desplegable
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const dom = domiciliarios.find((d) => d.id === id);
        const nombreCompleto = dom ? `${dom.nombre} ${dom.apellido}` : "";
        onChange(id, nombreCompleto);
    };

    // Recibe el nuevo domiciliario creado y actualiza el valor seleccionado
    const handleSuccessModal = (nuevo: Domiciliario) => {
        onDomiciliarioCreado(nuevo);
        onChange(nuevo.id, `${nuevo.nombre} ${nuevo.apellido}`);
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-farmatodo-textPrimary">
                Domiciliario
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <select
                        value={selectedId}
                        onChange={handleSelectChange}
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue text-sm"
                    >
                        <option value="">Seleccione un domiciliario...</option>
                        {domiciliarios.map((dom) => (
                            <option key={dom.id} value={dom.id}>
                                {dom.nombre} {dom.apellido} ({dom.cedula})
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-farmatodo-textPrimary rounded-md transition-colors text-sm font-medium border border-gray-300"
                    title="Registrar nuevo domiciliario"
                >
                    <UserPlus className="w-4 h-4 text-farmatodo-blue" />
                    <span className="hidden sm:inline">Registrar</span>
                </button>
            </div>

            {/* Modal flotante anidado */}
            <DomiciliarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccessModal}
            />
        </div>
    );
};