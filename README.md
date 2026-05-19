# Salud Plena — Plataforma Clinica Odontologica (Demo)

Plataforma operativa moderna tipo SaaS clinico para gestion de pacientes, agenda, recordatorios, WhatsApp, CRM, pagos, archivos, odontologia, ortodoncia y consentimientos. Modernizacion del sistema legado de la clinica, preparada para futuras integraciones con agente IA, WhatsApp Business, n8n, recordatorios automaticos y descarga de paquetes documentales por entidad.

---

## Stack tecnico

- **Framework:** Next.js 15 (App Router) + React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 3
- **Iconografia:** lucide-react
- **ORM:** Prisma 5
- **Base de datos:** PostgreSQL 16
- **Visualizacion de BD:** Adminer
- **Despliegue:** Vercel

---

## Estructura de carpetas

```
salud_plena_demo/
├── prisma/
│   ├── schema.prisma           ← esquema completo (25+ tablas)
│   └── seed.ts                 ← datos de prueba (espejo de src/lib/mock-data.ts)
├── src/
│   ├── app/
│   │   ├── page.tsx            ← Dashboard principal
│   │   ├── pacientes/          ← Modulo Paciente (lista, crear, perfil, editar)
│   │   ├── agenda/             ← Agenda + nueva cita
│   │   ├── pagos/              ← Pagos
│   │   ├── archivos/           ← Adjuntar archivo
│   │   ├── recordatorios/      ← Matriz de recordatorios
│   │   ├── whatsapp/           ← Bandeja WhatsApp (simulada)
│   │   ├── crm/                ← Kanban CRM + descarga paquetes
│   │   ├── odontologia/        ← 5 submodulos: valoracion, HC, evolucion, historico, odontograma
│   │   ├── ortodoncia/         ← 5 submodulos (replicados)
│   │   └── consentimientos/    ← 9 submodulos
│   ├── components/
│   │   ├── layout/             ← Sidebar, Header
│   │   ├── ui/                 ← Card, Badge, PageHeader, StatusBadge, EmptyState
│   │   ├── clinic/             ← Formularios reusables (valoracion, HC, evolucion, etc.)
│   │   ├── odontograma.tsx     ← Componente visual de odontograma
│   │   └── patient-picker.tsx  ← Selector reutilizable de pacientes
│   └── lib/
│       ├── types.ts            ← Tipos compartidos
│       ├── mock-data.ts        ← Datos demo (alimenta toda la UI sin BD)
│       └── utils.ts            ← cn, formatCOP, calcAge, etc.
├── docker-compose.yml          ← Postgres + Adminer
├── .env.example
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## Variables de entorno

Copia `.env.example` a `.env` y ajusta:

```
DATABASE_URL="postgresql://saludplena:saludplena@localhost:5432/saludplena_demo?schema=public"
```

En produccion (Vercel) usa un Postgres administrado (Neon, Supabase, Vercel Postgres) con `sslmode=require`.

---

## Instalacion local

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Levantar PostgreSQL y Adminer con Docker

```bash
docker compose up -d
```

Esto expone:
- **Postgres** en `localhost:5432` (user/pass: `saludplena/saludplena`, db: `saludplena_demo`)
- **Adminer** en [http://localhost:8080](http://localhost:8080)

En Adminer entra con:
- Sistema: PostgreSQL
- Servidor: `postgres`
- Usuario: `saludplena`
- Contraseña: `saludplena`
- Base de datos: `saludplena_demo`

### 3. Configurar `.env`

```bash
cp .env.example .env
```

### 4. Generar cliente Prisma y crear esquema

```bash
npm run db:generate
npm run db:push
```

(O alternativamente `npm run db:migrate` para crear migraciones formales.)

### 5. Cargar datos de prueba

```bash
npm run db:seed
```

### 6. Arrancar la app en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

> Nota: la app esta diseñada para renderizarse incluso **sin** base de datos. Los datos de demo viven en `src/lib/mock-data.ts` y alimentan toda la UI por defecto. La conexion a Postgres queda lista para cuando quieras persistir datos reales.

---

## Comandos disponibles

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run start` | Arrancar build en local |
| `npm run lint` | ESLint |
| `npm run db:generate` | Genera el cliente Prisma |
| `npm run db:push` | Aplica el schema directo a la BD (sin migraciones) |
| `npm run db:migrate` | Crea y aplica migraciones |
| `npm run db:seed` | Carga datos ficticios |
| `npm run db:studio` | Abre Prisma Studio |

---

## Despliegue en Vercel

1. Sube el repo a GitHub.
2. En Vercel: **New Project → Import** el repo.
3. Configura `DATABASE_URL` en **Environment Variables** apuntando a un Postgres administrado (Neon recomendado, free tier).
4. **Build Command:** `prisma generate && next build` (Vercel detecta Next.js automaticamente). Si necesitas ejecutar migraciones en deploy, ajusta a `prisma migrate deploy && next build`.
5. Deploy. La URL pública queda lista para demos.

> Recomendado: agregar `prisma generate` al script `postinstall` en `package.json` si Vercel da problemas con el cliente Prisma en cold start.

---

## Modulos implementados

### Sin submenu
- **Paciente** — Lista, crear, perfil completo, editar. Centro del sistema; desde aqui se accede a todos los modulos relacionados al paciente.
- **Agenda** — Vistas por hoy, semana, todos y sin confirmar. Filtros por doctor y busqueda. Vista por doctor.
- **Pagos** — Registro simple por paciente con estados (Pagado, Pendiente, Abono, Anulado).
- **Adjuntar archivo** — Carga por paciente con 9 tipos de archivo.
- **Recordatorios** — Matriz completa: 3 dias / 1 dia / 2 horas antes. Estados de paciente: Confirmo / Reagendar / Cancelar / No responde.
- **WhatsApp** — Bandeja simulada con conversaciones, intenciones detectadas y acciones (crear paciente, crear cita, crear caso CRM).
- **CRM** — Kanban con 12 estados, tabla, detalle de caso con descarga de paquete documental por entidad (MedPlus, Sura).

### Con submenu
- **Odontologia**: Valoracion, Historia clinica, Evolucion, Historico, Odontograma.
- **Ortodoncia**: Valoracion, Historia clinica, Evolucion, Historico, Odontograma.
- **Consentimientos**: Consultar + 8 tipos (Anestesia local, Odontologia restauradora, Endodoncia, Exodoncia simple, Periodoncia, Promocion y prevencion, Procedimientos implantologicos, COVID-19).

---

## Matriz de decisiones implementada visualmente

1. Paciente creado → habilitado para todos los modulos.
2. Cita creada → alimenta agenda y dispara recordatorios (3d / 1d / 2h).
3. Paciente confirma → cita Confirmada, recordatorio Confirmado, CRM (si aplica) Confirmado.
4. Paciente solicita reagendar → cita Reagendar, alerta en recordatorios, caso CRM actualizado.
5. Paciente cancela → cita Cancelada, caso CRM Cancelacion.
6. Paciente no responde → tras 3 recordatorios, **No responde**. El sistema NO cancela automaticamente.
7. WhatsApp simulado → puede crear paciente, caso CRM o cita.
8. Caso CRM = Solicitud de autorizacion → asocia entidad + archivos + paquete documental.
9. Entidades con paquete: **MedPlus** (Historia clinica PDF + Historico citas PDF + Excel autorizacion especial), **Sura** (Historia clinica PDF + Historico citas PDF + Soporte autorizacion PDF).
10. Caso CRM = Listo para agendar → boton para crear cita desde el caso.

---

## Alcance de la demo

Esta es una **demo funcional**. Lo que esta implementado vs. lo que esta simulado:

| Funcionalidad | Estado |
|---|---|
| Diseño UI completo de todos los modulos | ✅ Funcional |
| Sidebar con submenus | ✅ Funcional |
| Dashboard con metricas y alertas | ✅ Funcional |
| Modulo Paciente (CRUD visual) | ✅ Funcional |
| Agenda con filtros y vistas | ✅ Funcional |
| Kanban CRM | ✅ Funcional |
| Bandeja WhatsApp | ⚠️ Simulada (no envia mensajes reales) |
| Recordatorios | ⚠️ Logica visual (no envia notificaciones reales) |
| Paquetes documentales por entidad | ⚠️ UI completa, descarga simulada (no genera PDF/Excel) |
| Persistencia con Postgres + Prisma | ✅ Schema y seed listos. UI usa mock data por defecto. |
| Integracion WhatsApp Business / n8n | ❌ No incluida |
| Generacion real de PDF/Excel | ❌ No incluida |
| Modulo separado de autorizaciones | ❌ NO existe — se gestionan como casos CRM |
| Multiples roles | ❌ Solo `Administrador`. Arquitectura lista para ampliar. |
| Facturacion electronica | ❌ No incluida |

---

## Futuras integraciones

- **WhatsApp Business API** + agente IA: tomar conversaciones, detectar intencion, crear pacientes/casos/citas automaticamente.
- **n8n / webhooks** para automatizacion de recordatorios y notificaciones.
- **Generacion documental real** (PDF historia clinica, Excel autorizacion) con bibliotecas como `@react-pdf/renderer` y `exceljs`.
- **Roles adicionales:** Recepcion, Odontologo, Auditor, Aseguradora.
- **Modulo de reportes y analytics** para CRM y agenda.

---

## Notas de diseño

- Iconografia limpia con `lucide-react`. Sin emojis decorativos.
- Paleta primaria azul brand + escala gris neutra (`ink-*`).
- Componentes con bordes sutiles, sombras suaves y badges con tonos semanticos.
- Tablas con filtros, busqueda y estados visuales claros.
- Layout responsive (sidebar oculto en mobile a futuro).
- Header con buscador global, notificaciones y badge de "Conectado como: Administrador".
