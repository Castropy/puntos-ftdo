import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../firebase";
import type { Domiciliario } from "../types";

const COLECCION_DOMICILIARIOS = "domiciliarios";

/**
 * Suscribe en tiempo real a los domiciliarios filtrados exclusivamente por el tenantId activo.
 */
export const subscribeDomiciliarios = (
    onUpdate: (domiciliarios: Domiciliario[]) => void,
    onError: (error: Error) => void
) => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        onError(new Error("Se requiere un usuario autenticado para consultar los domiciliarios."));
        return () => { };
    }

    const q = query(
        collection(db, COLECCION_DOMICILIARIOS),
        where("tenantId", "==", usuarioActual.uid)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const lista = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Domiciliario[];
            onUpdate(lista);
        },
        (error) => {
            onError(error);
        }
    );
};

/**
 * Obtiene de forma síncrona/promesa la lista de domiciliarios del tenant actual.
 */
export const getDomiciliarios = async (): Promise<Domiciliario[]> => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        throw new Error("Se requiere un usuario autenticado para consultar los domiciliarios.");
    }

    const q = query(
        collection(db, COLECCION_DOMICILIARIOS),
        where("tenantId", "==", usuarioActual.uid)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Domiciliario[];
};

/**
 * Crea un nuevo domiciliario inyectando el tenantId del usuario activo.
 */
export const createDomiciliario = async (
    datos: Omit<Domiciliario, "id" | "createdAt" | "tenantId">
): Promise<string> => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        throw new Error("Se requiere un usuario autenticado para crear un domiciliario.");
    }

    const docRef = await addDoc(collection(db, COLECCION_DOMICILIARIOS), {
        ...datos,
        tenantId: usuarioActual.uid,
        createdAt: serverTimestamp(),
    });

    return docRef.id;
};

// Aliases por compatibilidad si se llaman en español
export const crearDomiciliario = createDomiciliario;