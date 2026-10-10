import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import type { Domiciliario } from "../types";

const COLECCION_DOMICILIARIOS = "domiciliarios";

/**
 * Consulta la lista de domiciliarios en Firestore filtrando de manera exclusiva
 * por el identificador del inquilino (tenantId) correspondiente al usuario autenticado.
 */
export const getDomiciliarios = async (): Promise<Domiciliario[]> => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        throw new Error("Se requiere un usuario autenticado para consultar los domiciliarios.");
    }

    const consultaDomiciliarios = query(
        collection(db, COLECCION_DOMICILIARIOS),
        where("tenantId", "==", usuarioActual.uid)
    );

    const snapshot = await getDocs(consultaDomiciliarios);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Domiciliario[];
};

/**
 * Registra un nuevo domiciliario en Firestore asignándole el tenantId del usuario
 * activo actual para garantizar el aislamiento de datos multi-tenant.
 */
export const crearDomiciliario = async (
    datos: Omit<Domiciliario, "id" | "createdAt">
): Promise<Domiciliario> => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
        throw new Error("Se requiere un usuario autenticado para registrar un domiciliario.");
    }

    const datosConTenant = {
        ...datos,
        tenantId: usuarioActual.uid,
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLECCION_DOMICILIARIOS), datosConTenant);

    return {
        id: docRef.id,
        ...datos,
    } as Domiciliario;
};