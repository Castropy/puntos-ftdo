import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    doc,
    writeBatch,
    serverTimestamp,
    type DocumentData
} from "firebase/firestore";
import { db } from "../firebase";
import type { CierreCaja, Orden } from "../types";

const COLLECTION_CIERRES = "cierres";
const COLLECTION_ORDENES = "ordenes";

// Mapea un documento de Firestore a la interfaz estricta CierreCaja
const mapDocumentToCierreCaja = (docId: string, data: DocumentData): CierreCaja => ({
    id: docId,
    fechaCierre: data.fechaCierre,
    horaApertura: data.horaApertura,
    horaCierre: data.horaCierre,
    totalMonto: data.totalMonto || 0,
    totalPedidos: data.totalPedidos || 0,
    usuarioCierreId: data.usuarioCierreId || "",
});

// Procesa el cierre de caja actual asociando las ordenes confirmadas
export const ejecutarCierreCaja = async (
    ordenesACerrar: Orden[],
    usuarioId: string
): Promise<string> => {
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

    // 1. Crear documento de cierre de caja en Firestore
    const cierreRef = await addDoc(collection(db, COLLECTION_CIERRES), {
        fechaCierre: serverTimestamp(),
        horaApertura,
        horaCierre: serverTimestamp(),
        totalMonto,
        totalPedidos,
        usuarioCierreId: usuarioId,
    });

    // 2. Actualizar todas las ordenes confirmadas asociandolas al cierreId en lote (batch)
    const batch = writeBatch(db);
    ordenesACerrar.forEach((orden) => {
        const ordenRef = doc(db, COLLECTION_ORDENES, orden.id);
        batch.update(ordenRef, { cierreId: cierreRef.id });
    });

    await batch.commit();

    return cierreRef.id;
};

// Consulta la lista de cierres historicos ordenados cronologicamente descendentemente
export const getHistorialCierres = async (): Promise<CierreCaja[]> => {
    const q = query(collection(db, COLLECTION_CIERRES), orderBy("fechaCierre", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => mapDocumentToCierreCaja(doc.id, doc.data()));
};