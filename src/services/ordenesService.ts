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
import { db } from "../firebase";
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

// 1. Suscripción en tiempo real a las órdenes activas del turno (con orderBy para aprovechar el índice de Firestore)
export const subscribeOrdenesActivas = (
    onUpdate: (ordenes: Orden[]) => void,
    onError: (error: Error) => void
) => {
    const ref = collection(db, COLLECTION_NAME);

    const q = query(
        ref,
        where("status", "in", ["pendiente", "confirmado"]),
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

// 2. Registrar nueva orden en la colección
export const createOrden = async (nuevaOrden: Omit<Orden, "id" | "horaCreacion" | "status">) => {
    const ref = collection(db, COLLECTION_NAME);

    const docRef = await addDoc(ref, {
        ...nuevaOrden,
        status: "pendiente",
        horaCreacion: serverTimestamp(),
    });

    return docRef.id;
};

// 3. Confirmar la recepción del punto de venta filtrando campos undefined
export const confirmarOrden = async (
    ordenId: string,
    datosConfirmacion: ConfirmarOrdenParams
) => {
    const docRef = doc(db, COLLECTION_NAME, ordenId);

    // Construimos el payload básico con valores definidos
    const updatePayload: Record<string, any> = {
        status: "confirmado",
        montoReal: datosConfirmacion.montoReal,
        diferencia: datosConfirmacion.diferencia,
        esExitosa: datosConfirmacion.esExitosa,
        horaConfirmacion: serverTimestamp(),
    };

    // Solo adjuntamos los campos opcionales si vienen definidos
    if (datosConfirmacion.motivoCategoria !== undefined) {
        updatePayload.motivoCategoria = datosConfirmacion.motivoCategoria;
    }

    if (datosConfirmacion.motivoDetalle !== undefined && datosConfirmacion.motivoDetalle !== "") {
        updatePayload.motivoDetalle = datosConfirmacion.motivoDetalle;
    }

    await updateDoc(docRef, updatePayload);
};