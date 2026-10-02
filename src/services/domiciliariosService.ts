import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    type DocumentData
} from "firebase/firestore";
import { db } from "../firebase";
import type { Domiciliario } from "../types";

const COLLECTION_NAME = "domiciliarios";

// Mapea un documento de Firestore al tipo estricto Domiciliario
const mapDocumentToDomiciliario = (docId: string, data: DocumentData): Domiciliario => ({
    id: docId,
    nombre: data.nombre || "",
    apellido: data.apellido || "",
    cedula: data.cedula || "",
    createdAt: data.createdAt,
});

// Obtiene la lista completa de domiciliarios ordenados por fecha de registro
export const getDomiciliarios = async (): Promise<Domiciliario[]> => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => mapDocumentToDomiciliario(doc.id, doc.data()));
};

// Registra un nuevo domiciliario en la base de datos de Firestore
export const createDomiciliario = async (
    domiciliarioData: Omit<Domiciliario, "id" | "createdAt">
): Promise<Domiciliario> => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...domiciliarioData,
        createdAt: serverTimestamp(),
    });

    return {
        id: docRef.id,
        ...domiciliarioData,
    };
};