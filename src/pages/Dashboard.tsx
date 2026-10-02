import React, { useEffect, useState } from "react";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import type { Domiciliario, Orden } from "../types";
import { getDomiciliarios } from "../services/domiciliariosService";
import { subscribeOrdenesActivas } from "../services/ordenesService";
import { OrdenPendienteCard } from "../components/OrdenPendienteCard";
import { OrdenConfirmadaCard } from "../components/OrdenConfirmadaCard";
import { NuevaOrdenModal } from "../components/NuevaOrdenModal";
import { ConfirmarOrdenModal } from "../components/ConfirmarOrdenModal";

// Dashboard principal con flujo de monitoreo en tiempo real
export const Dashboard: React.FC = () => {
    const [domiciliarios, setDomiciliarios] = useState<Domiciliario[]>([]);
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // Control de visibilidad de modales
    const [isNuevaOrdenOpen, setIsNuevaOrdenOpen] = useState<boolean>(false);
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

    // Suscripcion en tiempo real a las ordenes activas
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeOrdenesActivas(
            (nuevasOrdenes) => {
                setOrdenes(nuevasOrdenes);
                setLoading(false);
            },
            (err) => {
                console.error("Error en tiempo real de ordenes:", err);
                setError("Error de conexion en tiempo real con Firestore.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Incorpora un nuevo domiciliario al estado local tras su creacion en modal
    const handleDomiciliarioCreado = (nuevo: Domiciliario) => {
        setDomiciliarios((prev) => [nuevo, ...prev]);
    };

    // Clasificacion de ordenes por estado
    const ordenesPendientes = ordenes.filter((o) => o.status === "pendiente");
    const ordenesConfirmadas = ordenes.filter((o) => o.status === "confirmado");

    return (
        <div className="space-y-6">
            {/* Encabezado con indicador de accion principal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl font-bold text-farmatodo-textPrimary">
                        Control de Puntos Externos
                    </h1>
                    <p className="text-sm text-farmatodo-textSecondary mt-1">
                        Gestion de entregas y recepcion de dispositivos en turno activo.
                    </p>
                </div>

                <button
                    onClick={() => setIsNuevaOrdenOpen(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-farmatodo-blue hover:bg-farmatodo-blueHover text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Orden</span>
                </button>
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
                    {/* Seccion 1: Ordenes Pendientes */}
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

                    {/* Seccion 2: Ordenes Confirmadas */}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ordenesConfirmadas.map((orden) => (
                                    <OrdenConfirmadaCard key={orden.id} orden={orden} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modales de Interaccion */}
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
        </div>
    );
};