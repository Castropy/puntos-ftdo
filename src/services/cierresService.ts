import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    writeBatch,
    serverTimestamp,
    type DocumentData
} from "firebase/firestore";
import { db, auth } from "../firebase";
import type { CierreCaja, Orden } from "../types";

const COLLECTION_CIERRES = "cierres";
const COLLECTION_ORDENES = "ordenes";

/**
 * Mapea un documento de Firestore a la interfaz estricta CierreCaja.
 */
const mapDocumentToCierreCaja = (docId: string, data: DocumentData): CierreCaja => ({
    id: docId,
    fechaCierre: data.fechaCierre,
    horaApertura: data.horaApertura,
    horaCierre: data.horaCierre,
    totalMonto: data.totalMonto || 0,
    totalPedidos: data.totalPedidos || 0,
    usuarioCierreId: data.usuarioCierreId || "",
    tenantId: data.tenantId || "",
});

/**
 * Procesa el cierre de caja actual asociando las órdenes confirmadas
 * e inyectando el identificador del inquilino (tenantId) correspondiente al usuario activo.
 */
export const ejecutarCierreCaja = async (
    ordenesACerrar: Orden[],
    usuarioId: string
): Promise<string> => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        throw new Error("Se requiere un usuario autenticado para ejecutar el cierre de caja.");
    }

    if (ordenesACerrar.length === 0) {
        throw new Error("No hay órdenes confirmadas para realizar el cierre.");
    }

    // Calcula total cobrado y extrae la hora de inicio del turno
    const totalMonto = ordenesACerrar.reduce(
        (acc, orden) => acc + (orden.montoReal ?? orden.montoEsperado),
        0
    );

    const totalPedidos = ordenesACerrar.length;
    const horaApertura = ordenesACerrar[ordenesACerrar.length - 1].horaCreacion;

    // 1. Crea documento de cierre de caja en Firestore asociado al tenantId
    const cierreRef = await addDoc(collection(db, COLLECTION_CIERRES), {
        fechaCierre: serverTimestamp(),
        horaApertura,
        horaCierre: serverTimestamp(),
        totalMonto,
        totalPedidos,
        usuarioCierreId: usuarioId,
        tenantId: usuarioActual.uid,
    });

    // 2. Actualiza todas las órdenes confirmadas asociándolas al cierreId y cambiando su estado a cerrado en lote (batch)
    const batch = writeBatch(db);
    ordenesACerrar.forEach((orden) => {
        const ordenRef = doc(db, COLLECTION_ORDENES, orden.id);
        batch.update(ordenRef, {
            cierreId: cierreRef.id,
            status: "cerrado"
        });
    });

    await batch.commit();

    return cierreRef.id;
};

/**
 * Consulta la lista de cierres históricos ordenados cronológicamente de forma descendente,
 * filtrando exclusivamente por el tenantId del usuario autenticado actual.
 */
export const getHistorialCierres = async (): Promise<CierreCaja[]> => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        throw new Error("Se requiere un usuario autenticado para consultar el historial de cierres.");
    }

    const q = query(
        collection(db, COLLECTION_CIERRES),
        where("tenantId", "==", usuarioActual.uid),
        orderBy("fechaCierre", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => mapDocumentToCierreCaja(doc.id, doc.data()));
};