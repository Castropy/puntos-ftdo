import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

const UID_TIENDA_PRINCIPAL = "hprhgrFRSAa32yIJVr3lLEMYwYh1";
const COLECCIONES = ["ordenes", "domiciliarios", "cierres"];

/**
 * Ejecuta una migración única para asignar el tenantId de la tienda principal
 * a todos los documentos huérfanos que carezcan de él.
 */
export const migrarDatosHuerfanos = async (): Promise<void> => {
    try {
        console.log("Iniciando migración de datos huérfanos para multi-tenant...");
        const batch = writeBatch(db);
        let contadorActualizados = 0;

        for (const nombreColeccion of COLECCIONES) {
            const refColeccion = collection(db, nombreColeccion);
            const snapshot = await getDocs(refColeccion);

            snapshot.docs.forEach((documento) => {
                const data = documento.data();
                // Si el documento no posee tenantId o está vacío, se le asigna el de la tienda principal
                if (!data.tenantId || data.tenantId === "") {
                    const docRef = doc(db, nombreColeccion, documento.id);
                    batch.update(docRef, { tenantId: UID_TIENDA_PRINCIPAL });
                    contadorActualizados++;
                }
            });
        }

        if (contadorActualizados > 0) {
            await batch.commit();
            console.log(`Migración completada con éxito. Se actualizaron ${contadorActualizados} documentos huérfanos.`);
        } else {
            console.log("No se encontraron documentos huérfanos pendientes de migración.");
        }
    } catch (error) {
        console.error("Error crítico durante la migración de datos huérfanos:", error);
        throw error;
    }
};