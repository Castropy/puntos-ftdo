# 🛒 Farmatodo - Puntos Externos

Sistema web de gestión, control de cierres de caja y analítica financiera para la administración de transacciones e iteración de domiciliarios en puntos de entrega externos de Farmatodo.

---

## 🚀 Características Clave

* **Dashboard Operativo:** Registro y monitoreo en tiempo real de transacciones por domiciliario.
* **Módulo de Estadísticas y Analítica:**
  * Métricas financieras globales y filtrado por rango de fechas/turnos.
  * Cálculo de efectividad considerando métricas reales vs. esperadas (`montoReal` vs `montoEsperado`).
  * Layout responsivo de alta amplitud (`max-w-[1800px]`) optimizado para grandes volúmenes de datos.
* **Historial de Cierres de Caja:**
  * Consulta por fecha con restricción de selección (sin fechas futuras).
  * Consolidado automático de montos y totales por turno.
* **Gestión de Domiciliarios:** Registro dinámico y formateo automático de cédulas de identidad venezolanas.
* **Rutas Autenticadas:** Seguridad en cliente vinculada a Firebase Auth con confirmación de cierre de sesión.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React 18, TypeScript, Vite.
* **Estilos & UI:** Tailwind CSS, Lucide React (iconografía).
* **Enrutamiento:** React Router DOM v6.
* **Backend & BD:** Firebase (Firestore & Authentication).
* **Despliegue & Hosting:** Cloudflare Pages (Edge Network CDN).

---

## 📁 Estructura del Proyecto

```text
puntos-farmatodo/
├── public/
│   ├── _redirects          # Regla de fallback SPA para React Router en Cloudflare
│   └── favicon.svg         # Ícono POS personalizado en formato vector
├── src/
│   ├── components/         # Componentes modulares (Modal, Selects, Layout)
│   ├── pages/              # Vistas principales (Dashboard, Cierres, Estadísticas)
│   ├── services/           # Consultas e integración con Firebase Firestore
│   ├── types/              # Definiciones e interfaces de TypeScript
│   ├── utils/              # Formateadores (moneda local Bs, cédulas, fechas)
│   ├── firebase.ts         # Inicialización de SDK de Firebase
│   └── main.tsx            # Punto de entrada de la aplicación
├── package.json
└── vite.config.ts