/**
 * Convierte un texto a formato 'Title Case' (Capitalizado).
 * La primera letra de cada palabra en mayúscula y el resto en minúscula.
 * Ejemplos:
 *  "mario peres" -> "Mario Peres"
 *  "JUAN CARLOS SANCHEZ" -> "Juan Carlos Sanchez"
 *  "dEIVIS" -> "Deivis"
 */
export const capitalizeWords = (str: string): string => {
    if (!str || typeof str !== "string") return "";

    return str
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(" ");
};