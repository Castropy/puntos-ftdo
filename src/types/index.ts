import { Timestamp } from "firebase/firestore";

// Define los identificadores físicos asignados a los puntos externos de venta
export type PuntoId = 'A1' | 'A2' | 'A3' | 'A4';

// Define el estado operativo actual de una orden registrada
export type OrdenStatus = 'pendiente' | 'confirmado' | 'cerrado';

// Define las categorías predeterminadas para los motivos de discrepancia monetaria
export type MotivoCategoria =
    | 'mas_de_1_transaccion'
    | 'efectivo_complementario'
    | 'propina'
    | 'otro';

// Estructura de datos para la entidad de Domiciliario
export interface Domiciliario {
    id: string;
    nombre: string;
    apellido: string;
    cedula: string;
    createdAt?: Timestamp;
    tenantId?: string; // Identificador del inquilino (tenant) para aislamiento multi-tenant
}

// Estructura de datos para la entidad de Orden
export interface Orden {
    id: string;
    domiciliarioId: string;
    domiciliarioNombreCompleto: string;
    montoEsperado: number;
    puntoId: PuntoId;
    status: OrdenStatus;
    esExitosa?: boolean;
    montoReal?: number;
    diferencia?: number;
    motivoCategoria?: MotivoCategoria;
    motivoDetalle?: string;
    horaCreacion: Timestamp;
    horaConfirmacion?: Timestamp;
    cierreId?: string;
    tenantId?: string; // Identificador del inquilino (tenant) para aislamiento multi-tenant
}

// Estructura de datos para el registro de Cierre de Caja
export interface CierreCaja {
    id: string;
    fechaCierre: Timestamp;
    horaApertura: Timestamp;
    horaCierre: Timestamp;
    totalMonto: number;
    totalPedidos: number;
    usuarioCierreId: string;
    tenantId?: string; // Identificador del inquilino (tenant) para aislamiento multi-tenant
}

// Contexto global del estado de autenticación de usuario
export interface AuthState {
    user: {
        uid: string;
        email: string | null;
    } | null;
    loading: boolean;
}