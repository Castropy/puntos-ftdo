import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../firebase";
import type { Orden, MotivoCategoria } from "../types";

const COLLECTION_NAME = "ordenes";

// Interfaz para la actualización de confirmación de orden
export interface ConfirmarOrdenParams {
    montoReal: number;
    diferencia: number;
    esExitosa: boolean;
    motivoCategoria?: MotivoCategoria;
    motivoDetalle?: string;
}

/**
 * Suscribe en tiempo real a las órdenes activas del turno (excluye las liquidadas en un cierre)
 * filtrando exclusivamente por el inquilino (tenantId) del usuario autenticado actual.
 */
export const subscribeOrdenesActivas = (
    onUpdate: (ordenes: Orden[]) => void,
    onError: (error: Error) => void
) => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        onError(new Error("Se requiere un usuario autenticado para consultar las órdenes activas."));
        return () => { };
    }

    const ref = collection(db, COLLECTION_NAME);

    // Consulta filtrada por tenantId, estado y sin cierre previo
    const q = query(
        ref,
        where("tenantId", "==", usuarioActual.uid),
        where("status", "in", ["pendiente", "confirmado"]),
        where("cierreId", "==", null),
        orderBy("horaCreacion", "desc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const ordenes: Orden[] = snapshot.docs.map((documento) => {
                const data = documento.data();
                return {
                    id: documento.id,
                    ...data,
                } as Orden;
            });
            onUpdate(ordenes);
        },
        (error) => {
            console.error("Error en subscribeOrdenesActivas:", error);
            onError(error);
        }
    );
};

/**
 * Suscribe en tiempo real a TODAS las órdenes (para Estadísticas e Históricos)
 * limitadas de manera exclusiva al tenant autenticado actual.
 */
export const subscribeTodasLasOrdenes = (
    onUpdate: (ordenes: Orden[]) => void,
    onError: (error: Error) => void
) => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        onError(new Error("Se requiere un usuario autenticado para consultar el historial de órdenes."));
        return () => { };
    }

    const ref = collection(db, COLLECTION_NAME);

    // Consulta de la totalidad de órdenes del tenant ordenadas cronológicamente
    const q = query(
        ref,
        where("tenantId", "==", usuarioActual.uid),
        orderBy("horaCreacion", "desc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const ordenes: Orden[] = snapshot.docs.map((documento) => {
                const data = documento.data();
                return {
                    id: documento.id,
                    ...data,
                } as Orden;
            });
            onUpdate(ordenes);
        },
        (error) => {
            console.error("Error en subscribeTodasLasOrdenes:", error);
            onError(error);
        }
    );
};

/**
 * Registra una nueva orden inyectando el tenantId del usuario activo actual.
 */
export const createOrden = async (nuevaOrden: Omit<Orden, "id" | "horaCreacion" | "status" | "tenantId">) => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        throw new Error("Se requiere un usuario autenticado para crear una orden.");
    }

    const ref = collection(db, COLLECTION_NAME);

    const docRef = await addDoc(ref, {
        ...nuevaOrden,
        status: "pendiente",
        cierreId: null,
        tenantId: usuarioActual.uid,
        horaCreacion: serverTimestamp(),
    });

    return docRef.id;
};

/**
 * Confirma la recepción del punto de venta filtrando campos undefined
 * validando implícitamente la pertenencia mediante el UID activo.
 */
export const confirmarOrden = async (
    ordenId: string,
    datosConfirmacion: ConfirmarOrdenParams
) => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        throw new Error("Se requiere un usuario autenticado para confirmar una orden.");
    }

    const docRef = doc(db, COLLECTION_NAME, ordenId);

    // Construye el payload básico con valores definidos
    const updatePayload: Record<string, any> = {
        status: "confirmado",
        montoReal: datosConfirmacion.montoReal,
        diferencia: datosConfirmacion.diferencia,
        esExitosa: datosConfirmacion.esExitosa,
        horaConfirmacion: serverTimestamp(),
    };

    // Adjunta los campos opcionales si vienen definidos
    if (datosConfirmacion.motivoCategoria !== undefined) {
        updatePayload.motivoCategoria = datosConfirmacion.motivoCategoria;
    }

    if (datosConfirmacion.motivoDetalle !== undefined && datosConfirmacion.motivoDetalle !== "") {
        updatePayload.motivoDetalle = datosConfirmacion.motivoDetalle;
    }

    await updateDoc(docRef, updatePayload);
};