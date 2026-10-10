import React, { useState, useMemo, useRef, useEffect } from "react";
import { UserPlus, Search, ChevronDown, Check } from "lucide-react";
import type { Domiciliario } from "../types";
import { DomiciliarioModal } from "./DomiciliarioModal";
import { formatCedula } from "../utils/formatters";
import { capitalizeWords } from "../utils/textFormatters";

interface DomiciliarioSelectProps {
    domiciliarios: Domiciliario[];
    selectedId: string;
    onChange: (id: string, nombreCompleto: string) => void;
    onDomiciliarioCreado: (nuevo: Domiciliario) => void;
}

export const DomiciliarioSelect: React.FC<DomiciliarioSelectProps> = ({
    domiciliarios,
    selectedId,
    onChange,
    onDomiciliarioCreado,
}) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false);
    const [busqueda, setBusqueda] = useState<string>("");

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Lista de domiciliarios garantizada como arreglo válido
    const listaSegura = useMemo(() => {
        return Array.isArray(domiciliarios) ? domiciliarios.filter((d) => Boolean(d)) : [];
    }, [domiciliarios]);

    // Encontrar el domiciliario seleccionado actualmente
    const domiciliarioSeleccionado = useMemo(() => {
        if (!selectedId || listaSegura.length === 0) return undefined;
        return listaSegura.find((d) => String(d.id) === String(selectedId));
    }, [listaSegura, selectedId]);

    // Filtrar domiciliarios por nombre, apellido o cédula
    const domiciliariosFiltrados = useMemo(() => {
        if (!busqueda.trim()) return listaSegura;

        const query = busqueda.toLowerCase().trim();
        return listaSegura.filter((d) => {
            const nombreCompleto = `${d.nombre || ""} ${d.apellido || ""}`.toLowerCase();
            const cedulaStr = String(d.cedula || "").toLowerCase();
            return nombreCompleto.includes(query) || cedulaStr.includes(query);
        });
    }, [listaSegura, busqueda]);

    // Cerrar el dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectOption = (dom: Domiciliario) => {
        if (!dom || !dom.id) return;
        const nombreFormateado = capitalizeWords(dom.nombre || "");
        const apellidoFormateado = capitalizeWords(dom.apellido || "");
        onChange(String(dom.id), `${nombreFormateado} ${apellidoFormateado}`.trim());
        setIsOpenDropdown(false);
        setBusqueda("");
    };

    const handleSuccessModal = (nuevo: Domiciliario) => {
        onDomiciliarioCreado(nuevo);
        if (nuevo && nuevo.id) {
            const nombreFormateado = capitalizeWords(nuevo.nombre || "");
            const apellidoFormateado = capitalizeWords(nuevo.apellido || "");
            onChange(String(nuevo.id), `${nombreFormateado} ${apellidoFormateado}`.trim());
        }
        setIsOpenDropdown(false);
    };

    const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-farmatodo-textPrimary">
                Domiciliario
            </label>
            <div className="flex gap-2">
                {/* Caja tipo Select personalizada con buscador */}
                <div className="relative flex-1">
                    <div
                        onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue"
                    >
                        <span className={domiciliarioSeleccionado ? "text-farmatodo-textPrimary font-medium" : "text-gray-400"}>
                            {domiciliarioSeleccionado
                                ? `${capitalizeWords(domiciliarioSeleccionado.nombre || "")} ${capitalizeWords(domiciliarioSeleccionado.apellido || "")} (${formatCedula(domiciliarioSeleccionado.cedula)})`
                                : "Seleccione un domiciliario..."}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
                    </div>

                    {/* Menú desplegable con buscador */}
                    {isOpenDropdown && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                            {/* Barra de búsqueda */}
                            <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o cédula..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    autoFocus
                                    className="w-full bg-transparent text-sm focus:outline-none text-farmatodo-textPrimary"
                                />
                            </div>

                            {/* Lista de opciones filtradas */}
                            <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                                {domiciliariosFiltrados.length === 0 ? (
                                    <div className="p-3 text-center text-xs text-gray-400">
                                        No se encontraron domiciliarios.
                                    </div>
                                ) : (
                                    domiciliariosFiltrados.map((dom, index) => {
                                        const domId = dom.id ? String(dom.id) : `dom-${index}`;
                                        const isSelected = String(selectedId) === String(dom.id);
                                        const nombreFormatted = capitalizeWords(dom.nombre || "");
                                        const apellidoFormatted = capitalizeWords(dom.apellido || "");

                                        return (
                                            <div
                                                key={domId}
                                                onClick={() => handleSelectOption(dom)}
                                                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors ${isSelected ? "bg-blue-50 text-farmatodo-blue font-semibold" : "hover:bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                <span>
                                                    {nombreFormatted} {apellidoFormatted} <span className="text-xs text-gray-500">({formatCedula(dom.cedula)})</span>
                                                </span>
                                                {isSelected && <Check className="w-4 h-4 text-farmatodo-blue" />}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Botón de Registrar */}
                <button
                    type="button"
                    onClick={handleOpenModal}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-farmatodo-textPrimary rounded-md transition-colors text-sm font-medium border border-gray-300 shrink-0"
                    title="Registrar nuevo domiciliario"
                >
                    <UserPlus className="w-4 h-4 text-farmatodo-blue" />
                    <span className="hidden sm:inline">Registrar</span>
                </button>
            </div>

            {/* Modal flotante de registro */}
            <DomiciliarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccessModal}
            />
        </div>
    );
};