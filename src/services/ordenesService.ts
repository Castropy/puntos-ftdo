import {
    collection,
    addDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    type DocumentData
} from "firebase/firestore";
import { db } from "../firebase";
import type { Orden, PuntoId, MotivoCategoria } from "../types";

const COLLECTION_NAME = "ordenes";

// Mapea un documento de Firestore a la interfaz estricta Orden
const mapDocumentToOrden = (docId: string, data: DocumentData): Orden => ({
    id: docId,
    domiciliarioId: data.domiciliarioId || "",
    domiciliarioNombreCompleto: data.domiciliarioNombreCompleto || "",
    montoEsperado: data.montoEsperado || 0,
    puntoId: (data.puntoId as PuntoId) || "A1",
    status: data.status || "pendiente",
    esExitosa: data.esExitosa,
    montoReal: data.montoReal,
    diferencia: data.diferencia,
    motivoCategoria: data.motivoCategoria,
    motivoDetalle: data.motivoDetalle,
    horaCreacion: data.horaCreacion,
    horaConfirmacion: data.horaConfirmacion,
    cierreId: data.cierreId,
});

// Registra una nueva orden en estado pendiente dentro de Firestore
export const createOrden = async (ordenData: {
    domiciliarioId: string;
    domiciliarioNombreCompleto: string;
    montoEsperado: number;
    puntoId: PuntoId;
}): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...ordenData,
        status: "pendiente",
        horaCreacion: serverTimestamp(),
    });

    return docRef.id;
};

// Actualiza el estado de una orden a confirmado con su respectivo desglose monetario
export const confirmarOrden = async (
    ordenId: string,
    datosConfirmacion: {
        montoReal: number;
        diferencia: number;
        esExitosa: boolean;
        motivoCategoria?: MotivoCategoria;
        motivoDetalle?: string;
    }
): Promise<void> => {
    const ordenRef = doc(db, COLLECTION_NAME, ordenId);
    await updateDoc(ordenRef, {
        ...datosConfirmacion,
        status: "confirmado",
        horaConfirmacion: serverTimestamp(),
    });
};

// Escucha en tiempo real las ordenes activas que no han sido asociadas a un cierre de caja
export const subscribeOrdenesActivas = (
    onUpdate: (ordenes: Orden[]) => void,
    onError: (error: Error) => void
) => {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("cierreId", "==", null),
        orderBy("horaCreacion", "desc")
    );

    return onSnapshot(
        q,
        (querySnapshot) => {
            const ordenes = querySnapshot.docs.map((doc) =>
                mapDocumentToOrden(doc.id, doc.data())
            );
            onUpdate(ordenes);
        },
        (error) => {
            onError(error);
        }
    );
};