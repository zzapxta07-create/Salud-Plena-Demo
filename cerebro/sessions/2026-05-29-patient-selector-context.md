---
name: 2026-05-29-patient-selector-context
type: session
area: frontend, architecture
date: 2026-05-29
author: claude
status: active
tags: [context-api, state-management, patient-filtering]
related: [[2026-05-27-api-routes-prisma-migration]]
sources: [repo:src/lib/patient-context.tsx, repo:src/components/patient-context-selector.tsx, repo:src/app/layout.tsx]
---

# Selector de Paciente Global con Context API

## Contexto

El usuario solicitó: **"Al seleccionar un paciente, todos los otros apartados cambien según el paciente"**.

Implementación de un selector global que:
- Permite seleccionar paciente desde Sidebar o Header
- Filtra automáticamente todas las páginas para mostrar solo datos de ese paciente
- Usa React Context API para compartir estado

## Trabajo realizado

### Infraestructura (Context API)
- ✅ Crear `src/lib/patient-context.tsx`:
  - Exporta `PatientProvider` (wrapper)
  - Exporta hook `useSelectedPatient()` → `{ selectedPatientId, setSelectedPatientId }`
  - Estado: `selectedPatientId: string | null` (null = ver todos)

- ✅ Modificar `src/app/layout.tsx`:
  - Importar `PatientProvider`
  - Envolver layout: `<PatientProvider><div className="flex">...</div></PatientProvider>`
  - Aplica a toda la app (todo componente puede usar el hook)

### Componente de Selector
- ✅ Crear `src/components/patient-context-selector.tsx`:
  - Búsqueda de pacientes contra `/api/patients`
  - Muestra: Avatar, Nombre, Documento, Edad, Entidad
  - Dropdown con resultado de búsqueda
  - OnSelect: `setSelectedPatientId(id)`
  - Botón "Ver todos" para limpiar selección
  - Estado visual de paciente seleccionado (dot azul)

### Integración en UI
- ✅ Modificar `src/components/layout/sidebar.tsx`:
  - Agregar sección "Paciente activo" al tope (debajo del logo)
  - Mostrar `PatientContextSelector` en esa sección
  - Selector visible permanentemente mientras se navega

### Integración en Pacientes
- ✅ Modificar `src/app/pacientes/page.tsx`:
  - Importar `useSelectedPatient()`
  - Al clickear nombre de paciente → `setSelectedPatientId(p.id)`
  - Al clickear "Abrir perfil" → también `setSelectedPatientId(p.id)`
  - Próximo paso: Filtrar tabla por paciente seleccionado (pendiente)

### Correcciones de tipo
- 🔧 Cambiar `fullName(p)` a `fullName(p as any)` en `pacientes/[id]/page.tsx` (mismatch null vs undefined)
- 🔧 Cambiar `p.entityName` a `p.entity?.name` en `pacientes/[id]/page.tsx` (campo Prisma vs mock)
- 🔧 Agregar `export const dynamic = 'force-dynamic'` a dashboard para evitar SSG errors con Prisma

### Build
- ✅ `npm run build` compila sin errores

## Decisiones

| Decisión | Rationale |
|---|---|
| **React Context** vs Redux/Zustand | Context es suficiente para esta aplicación médica. No requiere tiempo real, no hay caché compleja, state tree es simple (1 ID) |
| **Dropdown en Sidebar** | Visible permanentemente, accesible desde cualquier página, menos modal bloqueante que un dialog |
| **localStorage?** | No implementado aún. Podría persistir selección entre sesiones, pero por ahora resetea al recargar (más limpio) |
| **Fetch en cada cambio** | El selector hace un fetch a `/api/patients` para tener datos frescos cada vez que se abre |

## Output

### Archivos creados
- `src/lib/patient-context.tsx` (20 líneas)
- `src/components/patient-context-selector.tsx` (125 líneas)

### Archivos modificados
- `src/app/layout.tsx` (+3 líneas)
- `src/components/layout/sidebar.tsx` (+5 líneas)
- `src/app/pacientes/page.tsx` (+5 líneas)
- `src/app/page.tsx` (+1 línea)
- `src/app/pacientes/[id]/page.tsx` (+3 líneas)

### Commit
```
eb45af8 Fase 4: Implementar selector de paciente global con Context
```

## Pendientes

| Tarea | Estado | Nota |
|---|---|---|
| Filtrar tabla `pacientes/page.tsx` por `selectedPatientId` | ⏳ pending | Mostrar solo citas del paciente seleccionado |
| Actualizar `agenda/page.tsx` (fetch + filtro) | ⏳ pending | Mostrar solo citas del paciente |
| Actualizar `pagos/page.tsx` (fetch + filtro) | ⏳ pending |  |
| Actualizar `recordatorios/page.tsx` (fetch + filtro) | ⏳ pending |  |
| Actualizar `crm/page.tsx` (fetch + filtro) | ⏳ pending |  |
| Actualizar `whatsapp/page.tsx` (fetch + filtro) | ⏳ pending |  |
| Actualizar `archivos/page.tsx` (fetch + filtro) | ⏳ pending |  |
| Mostrar paciente actual en Header (chip) | ⏳ pending | Badge visual adicional |
| Persistencia en localStorage | ⏳ pending | Opcional: recordar paciente entre sesiones |

**Estimación**: 1-2 horas más para completar filtrado en todas las páginas. Patrón idéntico en todas.

## Cross-refs

- [[2026-05-27-api-routes-prisma-migration]] — APIs que consumen las páginas filtradas
- [[2026-05-27-deploy-vercel-postgres]] — Contexto desplegado en Vercel
