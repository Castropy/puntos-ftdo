// src/utils/formatters.ts

/**
 * Formatea un número al estándar monetario de Bolívares (es-VE)
 * Ejemplo: 137577.23 -> "137.577,23"
 */
export const formatBolivares = (monto: number): string => {
    if (isNaN(monto) || monto === null || monto === undefined) return "0,00";

    return new Intl.NumberFormat("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(monto);
};