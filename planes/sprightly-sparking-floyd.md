# Plan: Reemplazar mock-data por BD real + Selector de Paciente Global

## Contexto
El proyecto Salud Plena Demo tiene un schema Prisma completo (26 modelos) ya conectado a PostgreSQL remoto, pero el 100% de las páginas consume datos hardcodeados de `src/lib/mock-data.ts`. Ningún formulario persiste datos — todos hacen `alert("Demo...")`. El objetivo es eliminar mock-data y conectar todo a la BD real.

---

## Arquitectura de solución

**Patrón híbrido:**
- **Server Components** (`page.tsx`, `pacientes/[id]/page.tsx`, `crm/[id]/page.tsx`): Prisma directo, sin API intermediaria
- **Client Components** con filtros (`pacientes`, `agenda`, `crm`, `pagos`, `recordatorios`, `whatsapp`): `useEffect` + `fetch` a API routes
- **Formularios**: `fetch POST` a la API route correspondiente (reemplaza `alert()`)
- **PatientPicker**: `fetch` a `/api/patients?q=<búsqueda>`

---

## Archivos críticos

| Rol | Ruta |
|---|---|
| ORM singleton | `src/lib/db.ts` (crear) |
| Mock data (eliminar) | `src/lib/mock-data.ts` |
| Dashboard | `src/app/page.tsx` |
| Pacientes lista | `src/app/pacientes/page.tsx` |
| Paciente detalle | `src/app/pacientes/[id]/page.tsx` |
| Paciente nuevo | `src/app/pacientes/_components/patient-form.tsx` |
| Agenda lista | `src/app/agenda/page.tsx` |
| Agenda nueva | `src/app/agenda/nueva/page.tsx` |
| CRM lista | `src/app/crm/page.tsx` |
| CRM detalle | `src/app/crm/[id]/page.tsx` |
| CRM nuevo | `src/app/crm/nuevo/page.tsx` |
| Pagos lista | `src/app/pagos/page.tsx` |
| Pagos nuevo | `src/app/pagos/nuevo/page.tsx` |
| Recordatorios | `src/app/recordatorios/page.tsx` |
| WhatsApp | `src/app/whatsapp/page.tsx` |
| PatientPicker | `src/components/patient-picker.tsx` |
| Schema Prisma | `prisma/schema.prisma` |

---

## Pasos de implementación

### Fase 1 — Infraestructura (1 archivo)
1. Crear `src/lib/db.ts` — Prisma client singleton con patrón global para evitar múltiples instancias en dev

### Fase 2 — API Routes (11 rutas)
Crear `src/app/api/`:

| Ruta | Métodos | Lógica |
|---|---|---|
| `/api/patients` | GET, POST | GET: lista con `include: { entity: true }`. POST: crea paciente |
| `/api/patients/[id]` | GET | JOIN a appointments, payments, files, consents, reminders, crmCases |
| `/api/doctors` | GET | Lista activos |
| `/api/entities` | GET | Lista activas |
| `/api/appointments` | GET, POST | GET: include patient+doctor+entity. POST: crea cita |
| `/api/crm` | GET, POST | GET: include patient+entity. POST: crea caso |
| `/api/crm/[id]` | GET | Include patient, entity, appointments, files |
| `/api/payments` | GET, POST | GET: include patient. POST: crea pago |
| `/api/reminders` | GET | Include appointment (con patient+doctor) |
| `/api/whatsapp` | GET | Include patient, messages |
| `/api/dashboard` | GET | Query agregada con counts y métricas |

### Fase 3 — Server Components (Prisma directo)
- `src/app/page.tsx`: reemplazar `getDashboardMetrics()` con `fetch('/api/dashboard')`
- `src/app/pacientes/[id]/page.tsx`: reemplazar `findPatient()` + arrays con `fetch('/api/patients/[id]')`
- `src/app/crm/[id]/page.tsx`: reemplazar arrays con `fetch('/api/crm/[id]')`

### Fase 4 — Client Components (useEffect + fetch)
Para cada página con filtros, agregar:
1. Estado `data` + `loading` con `useState`
2. `useEffect` que llama a la API correspondiente
3. Remover import de mock-data

Páginas afectadas: `pacientes`, `agenda`, `pagos`, `recordatorios`, `whatsapp`, `crm`

### Fase 5 — Formularios (fetch POST)
Reemplazar `alert("Demo...")` + `router.push()` con:
1. `fetch POST` a la API route
2. `await response.json()` para verificar éxito
3. `router.push()` solo si respuesta ok
4. Mostrar error inline si falla

Formularios: `patient-form.tsx`, `agenda/nueva`, `crm/nuevo`, `pagos/nuevo`

### Fase 6 — PatientPicker
- Agregar búsqueda debouncee contra `/api/patients?q=<query>&limit=10`
- Reemplazar filtro en memoria sobre mock-data

### Fase 7 — Limpieza
- Eliminar `src/lib/mock-data.ts`
- Verificar que no queden imports de mock-data

---

## Verificación
1. `npm run build` debe pasar sin errores
2. Abrir `/pacientes` — tabla carga datos reales de PostgreSQL
3. Crear paciente nuevo → aparece en la lista
4. Abrir `/agenda` — citas reales
5. Dashboard muestra métricas reales

---

# PLAN 2: Selector de Paciente Global (Contexto + Filtrado automático)

## Contexto

Una vez que el mock-data esté reemplazado por Prisma, el usuario quiere que:
- Al seleccionar un paciente en cualquier lugar (Header, Sidebar, o página de listado)
- **Todas las demás páginas se filtren automáticamente** para mostrar solo datos de ese paciente
- El selector sea visible en **Sidebar + Header** con información del paciente: Nombre, Documento+Edad, Entidad, Estado

## Arquitectura de solución

**Usar React Context API** (`src/lib/patient-context.tsx`) para mantener el `selectedPatientId`:
- ✅ Aplicación médica típica: Context es suficiente
- ✅ No requiere Redux/Zustand
- ✅ Persiste con localStorage (opcional)
- ✅ Resetea al recargar (limpio)

## Archivos a crear/modificar

| Archivo | Acción | Descripción |
|---|---|---|
| `src/lib/patient-context.tsx` | CREATE | Context + hook `useSelectedPatient()` |
| `src/app/layout.tsx` | MODIFY | Wrap con `PatientProvider` |
| `src/components/layout/sidebar.tsx` | MODIFY | Mostrar selector de paciente + detalles |
| `src/components/layout/header.tsx` | MODIFY | Mostrar paciente actual como chip/badge |
| `src/components/patient-context-selector.tsx` | CREATE | Componente reutilizable de selector |
| `src/app/pacientes/page.tsx` | MODIFY | Click en paciente → `useSelectedPatient().setId()` |
| `src/app/agenda/page.tsx` | MODIFY | Leer `selectedPatientId`, filtrar en useEffect |
| `src/app/pagos/page.tsx` | MODIFY | Leer `selectedPatientId`, filtrar en useEffect |
| `src/app/recordatorios/page.tsx` | MODIFY | Leer `selectedPatientId`, filtrar en useEffect |
| `src/app/crm/page.tsx` | MODIFY | Leer `selectedPatientId`, filtrar en useEffect |
| `src/app/whatsapp/page.tsx` | MODIFY | Leer `selectedPatientId`, filtrar en useEffect |
| `src/app/archivos/page.tsx` | MODIFY | Leer `selectedPatientId`, filtrar en useEffect |

## Pasos

### Fase A: Contexto
1. Crear `src/lib/patient-context.tsx`:
   - Export `PatientProvider` (wrapper)
   - Export hook `useSelectedPatient()` → `{ selectedPatientId, setSelectedPatientId }`

2. Modificar `src/app/layout.tsx`:
   - Wrap `<PatientProvider>` alrededor del layout

### Fase B: UI de selector
1. Crear `src/components/patient-context-selector.tsx`:
   - Búsqueda + listado de pacientes (reutiliza PatientPicker lógica)
   - Muestra: Nombre, Documento+Edad, Entidad, Estado
   - OnSelect: `setSelectedPatientId(id)`

2. Modificar `src/components/layout/sidebar.tsx`:
   - Agregar selector al tope
   - Mostrar paciente actual: `{selectedPatient?.firstName} {selectedPatient?.firstLastName}`
   - Link para limpiar selección ("Ver todos")

3. Modificar `src/components/layout/header.tsx`:
   - Mostrar como chip: `[Avatar] Paciente actual`
   - Click abre modal de cambio (reutiliza selector)

### Fase C: Páginas (filtrado automático)
Para cada página Client Component:

```tsx
const { selectedPatientId } = useSelectedPatient();
const [data, setData] = useState([]);

useEffect(() => {
  let url = '/api/{endpoint}';
  if (selectedPatientId) {
    url += `?patientId=${selectedPatientId}`; // Query param opcional
  }
  fetch(url).then(r => r.json()).then(setData);
}, [selectedPatientId]); // Re-fetch cuando cambia

// Filtrar en memoria SI es necesario
const filtered = selectedPatientId 
  ? data.filter(item => item.patientId === selectedPatientId) 
  : data;
```

**Páginas a actualizar:**
- `agenda/page.tsx` → filtra appointments por paciente
- `pagos/page.tsx` → filtra payments por paciente
- `recordatorios/page.tsx` → filtra reminders por paciente
- `crm/page.tsx` → filtra cases por paciente
- `whatsapp/page.tsx` → filtra conversations por paciente
- `archivos/page.tsx` → filtra files por paciente

### Fase D: Integración en listados
En `src/app/pacientes/page.tsx`:
- Hacer el nombre del paciente clickeable
- OnClick: `setSelectedPatientId(p.id)` + scroll a top
- Mostrar visual de "paciente seleccionado" (highlight)

## Verificación

1. Abrir `/pacientes` → ver listado
2. Clickear un paciente → se selecciona, brilla nombre en Sidebar
3. Navegar a `/agenda` → muestra solo citas de ese paciente
4. Navegar a `/pagos` → muestra solo pagos de ese paciente
5. Cambiar paciente → todas las páginas se actualizan al instante
6. Limpiar selección ("Ver todos") → vuelven a mostrar todos los datos
