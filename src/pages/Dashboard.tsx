import React, { useEffect, useState } from "react";
import { Plus, Archive, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import type { Domiciliario, Orden } from "../types";
import { getDomiciliarios } from "../services/domiciliariosService";
import { subscribeOrdenesActivas } from "../services/ordenesService";
import { OrdenPendienteCard } from "../components/OrdenPendienteCard";
import { OrdenConfirmadaCard } from "../components/OrdenConfirmadaCard";
import { NuevaOrdenModal } from "../components/NuevaOrdenModal";
import { ConfirmarOrdenModal } from "../components/ConfirmarOrdenModal";
import { CierreCajaModal } from "../components/CierreCajaModal";

// Extrae una clave de fecha legible (ej. "28 de Febrero, 2026") a partir del timestamp
const obtenerFechaLegible = (timestamp: Orden["horaConfirmacion"] | Orden["horaCreacion"]): string => {
    if (!timestamp) return "Fecha sin registrar";
    const date = typeof timestamp === "object" && "toDate" in timestamp && typeof timestamp.toDate === "function"
        ? timestamp.toDate()
        : timestamp instanceof Date ? timestamp : null;

    if (!date) return "Fecha sin registrar";

    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

// Dashboard principal con monitoreo en tiempo real y cierre de caja
export const Dashboard: React.FC = () => {
    const [domiciliarios, setDomiciliarios] = useState<Domiciliario[]>([]);
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // Visibilidad de modales
    const [isNuevaOrdenOpen, setIsNuevaOrdenOpen] = useState<boolean>(false);
    const [isCierreModalOpen, setIsCierreModalOpen] = useState<boolean>(false);
    const [ordenAConfirmar, setOrdenAConfirmar] = useState<Orden | null>(null);

    // Carga inicial de domiciliarios
    useEffect(() => {
        const cargarDomiciliarios = async () => {
            try {
                const lista = await getDomiciliarios();
                setDomiciliarios(lista);
            } catch (err) {
                console.error("Error al cargar domiciliarios:", err);
            }
        };

        cargarDomiciliarios();
    }, []);

    // Suscripción en tiempo real a las órdenes activas del turno
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeOrdenesActivas(
            (nuevasOrdenes) => {
                setOrdenes(nuevasOrdenes);
                setLoading(false);
            },
            (err) => {
                console.error("Error en tiempo real de órdenes:", err);
                setError("Error de conexión en tiempo real con Firestore.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Incorpora un nuevo domiciliario al estado local tras crearlo en el modal
    const handleDomiciliarioCreado = (nuevo: Domiciliario) => {
        setDomiciliarios((prev) => [nuevo, ...prev]);
    };

    // Clasificación de órdenes por estado
    const ordenesPendientes = ordenes.filter((o) => o.status === "pendiente");
    const ordenesConfirmadas = ordenes.filter((o) => o.status === "confirmado");

    // Agrupa las órdenes confirmadas por fecha legible
    const ordenesConfirmadasPorFecha = ordenesConfirmadas.reduce<Record<string, Orden[]>>((acumulador, orden) => {
        const fechaClave = obtenerFechaLegible(orden.horaConfirmacion || orden.horaCreacion);
        if (!acumulador[fechaClave]) {
            acumulador[fechaClave] = [];
        }
        acumulador[fechaClave].push(orden);
        return acumulador;
    }, {});

    return (
        <div className="space-y-6">
            {/* Encabezado con acciones principales */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl font-bold text-farmatodo-textPrimary">
                        Control de Puntos Externos
                    </h1>
                    <p className="text-sm text-farmatodo-textSecondary mt-1">
                        Gestión de entregas y recepción de dispositivos en turno activo.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsCierreModalOpen(true)}
                        disabled={ordenesConfirmadas.length === 0}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors disabled:opacity-50"
                    >
                        <Archive className="w-4 h-4" />
                        <span>Cierre de Caja ({ordenesConfirmadas.length})</span>
                    </button>

                    <button
                        onClick={() => setIsNuevaOrdenOpen(true)}
                        className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-farmatodo-blue hover:bg-farmatodo-blueHover text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nueva Orden</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border-l-4 border-farmatodo-red text-farmatodo-red text-sm rounded">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Contenedor principal de dos columnas */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <RefreshCw className="w-8 h-8 text-farmatodo-blue animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sección 1: Órdenes Pendientes (En Ruta) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-farmatodo-textPrimary flex items-center gap-2">
                                <span>Puntos en Ruta</span>
                                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-semibold">
                                    {ordenesPendientes.length}
                                </span>
                            </h2>
                        </div>

                        {ordenesPendientes.length === 0 ? (
                            <div className="bg-white p-8 text-center rounded-lg border border-dashed border-gray-300 text-farmatodo-textSecondary text-sm">
                                No hay puntos asignados en la calle actualmente.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ordenesPendientes.map((orden) => (
                                    <OrdenPendienteCard
                                        key={orden.id}
                                        orden={orden}
                                        onConfirmar={(o) => setOrdenAConfirmar(o)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sección 2: Órdenes Confirmadas Agrupadas por Fecha */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-farmatodo-textPrimary flex items-center gap-2">
                                <span>Puntos Recibidos (Turno Activo)</span>
                                <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                                    {ordenesConfirmadas.length}
                                </span>
                            </h2>
                        </div>

                        {ordenesConfirmadas.length === 0 ? (
                            <div className="bg-white p-8 text-center rounded-lg border border-dashed border-gray-300 text-farmatodo-textSecondary text-sm">
                                Aún no se han recibido puntos en este turno.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(ordenesConfirmadasPorFecha).map(([fecha, listaOrdenes]) => (
                                    <div key={fecha} className="space-y-3">
                                        {/* Encabezado con la fecha de las órdenes */}
                                        <div className="flex items-center space-x-2 pb-1 border-b border-gray-200">
                                            <Calendar className="w-4 h-4 text-farmatodo-blue" />
                                            <h3 className="text-xs font-bold text-farmatodo-textPrimary uppercase tracking-wider">
                                                {fecha}
                                            </h3>
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({listaOrdenes.length} {listaOrdenes.length === 1 ? "punto" : "puntos"})
                                            </span>
                                        </div>

                                        {/* Renderizado de tarjetas del día */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {listaOrdenes.map((orden) => (
                                                <OrdenConfirmadaCard key={orden.id} orden={orden} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modales de Interacción */}
            <NuevaOrdenModal
                isOpen={isNuevaOrdenOpen}
                onClose={() => setIsNuevaOrdenOpen(false)}
                domiciliarios={domiciliarios}
                onDomiciliarioCreado={handleDomiciliarioCreado}
            />

            <ConfirmarOrdenModal
                orden={ordenAConfirmar}
                isOpen={!!ordenAConfirmar}
                onClose={() => setOrdenAConfirmar(null)}
            />

            <CierreCajaModal
                isOpen={isCierreModalOpen}
                onClose={() => setIsCierreModalOpen(false)}
                ordenesConfirmadas={ordenesConfirmadas}
                onCierreExitoso={() => setIsCierreModalOpen(false)}
            />
        </div>
    );
};