# Changelog

All notable changes to honeyMoney are documented here.

## [Unreleased] — develop

### Added
- **Módulo de Presupuestos** (`/budgets`) — nueva tab en la navegación
  - Presupuesto mensual por categoría con barra de progreso individual
  - Tarjeta de resumen global: total presupuestado, gastado y disponible
  - Recomendaciones automáticas: alertas de límite excedido, categorías casi al límite, sugerencias de categorías con gasto alto sin presupuesto
  - CRUD completo: crear, editar monto y eliminar presupuestos
  - Navegación libre entre meses (pasado y futuro)
  - Traspaso de presupuesto: copiar al mes siguiente o copiar desde el mes anterior
  - Realtime: cambios del otro miembro se reflejan al instante
- **Layout desktop responsivo** — nueva experiencia a partir de 768px
  - Sidebar de navegación con labels completos y active state tipo iOS/macOS
  - Dashboard en grid 2 columnas: balance a la izquierda, movimientos a la derecha
  - Presupuestos y Metas en grid 2 columnas
  - Botón "Registrar" inline en desktop (sin FAB flotante)
  - Wallet indicator en sidebar; bottom nav oculto en desktop

- **Pagos recurrentes — Registrar gasto** (`/recurring`)
  - Cada pago no pagado muestra ahora dos acciones: "Marcar pagado" (solo log) y "Registrar gasto" (crea transacción de gasto + marca pagado en un paso)
  - Sheet de categoría con pre-selección automática por coincidencia de color; fecha de la transacción usa el `día de cobro` del mes seleccionado
  - Navegador de meses sin bloqueo: ahora permite avanzar a meses futuros

### Changed
- `Layout.tsx` — soporte responsivo completo (mobile + desktop)
- `FinanceContext` — añade estado `budgets`, `currentMonthBudgets`, acciones `addBudget`, `updateBudget`, `deleteBudget`, `copyBudgetsToMonth`; suscripción Realtime a tabla `budgets`
- `src/utils/format.ts` — añade helper `monthKey(date)`
- `src/types/index.ts` — añade interfaces `Budget` y `BudgetInsert`
- Tabs de navegación renombradas: "Movimientos" → "Gastos" (label mobile), "Ppto." (label mobile presupuesto)
- `RecurringPage` — botón "›" desbloqueado para meses futuros; pill de acción dividido en "Marcar pagado" / "Registrar gasto"

### Database
- Nueva tabla `budgets` con constraint único `(wallet_id, category_id, month)`
- RLS policy: solo miembros del wallet pueden gestionar sus presupuestos

---

## [0.4.0] — Pagos recurrentes

### Added
- Módulo de pagos recurrentes (`/recurring`)
- Sugerencia de transacciones existentes al crear un pago recurrente
- Marcado de pagos como pagados por mes

---

## [0.3.0] — Polish iOS-native

### Changed
- Refinamiento visual hacia feel nativo iOS
- Mejoras en AddTransactionModal
- Ajustes de CSS y animaciones

---

## [0.1.0] — MVP

### Added
- Autenticación con Supabase Auth
- Wallets compartidos con código de invitación
- Transacciones (ingresos y gastos) por categoría
- Metas de ahorro con progreso
- Dashboard con balance mensual
- PWA mobile-first
