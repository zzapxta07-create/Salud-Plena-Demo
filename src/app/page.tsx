import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileWarning,
  Kanban,
  ListChecks,
  PhoneOff,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AppointmentStatusBadge,
  ConfirmationBadge,
  CrmStatusBadge,
} from "@/components/ui/status-badge";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import { formatDateTime, formatTime, fullName, humanLabel } from "@/lib/utils";

export default async function DashboardPage() {
  // Verificar si DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Configuración incompleta</h1>
        <p className="text-ink-700 mb-4">DATABASE_URL no está configurada en Vercel.</p>
        <p className="text-sm text-ink-500">Pasos:</p>
        <ol className="list-decimal ml-5 text-sm text-ink-600">
          <li>Ve a Vercel Settings → Environment Variables</li>
          <li>Agrega: DATABASE_URL = postgresql://...</li>
          <li>Redeploy</li>
        </ol>
        <p className="mt-4 text-sm"><a href="/agenda" className="text-brand-600 hover:underline">Ir a Agenda →</a> (no requiere BD)</p>
      </div>
    );
  }

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [
      totalPatients,
      appointmentsToday,
      unconfirmedAppointments,
      pendingReminders,
      activeCrmCases,
      crmCasesWithPendingDocs,
      crmReadyToSchedule,
      patientsNotResponding,
      upcomingAppointments,
      recentCrmCases,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({ where: { startIso: { gte: todayStart, lt: todayEnd } } }),
      prisma.appointment.count({ where: { confirmationStatus: "PENDIENTE" } }),
      prisma.reminder.count({ where: { estadoRecordatorio: "PENDIENTE" } }),
      prisma.crmCase.count({ where: { status: { notIn: ["FINALIZADO", "PERDIDO"] } } }),
      prisma.crmCase.count({ where: { status: "DOCUMENTOS_PENDIENTES" } }),
      prisma.crmCase.count({ where: { status: "LISTO_PARA_AGENDAR" } }),
      prisma.reminder.count({ where: { estadoRecordatorio: "NO_RESPONDE" } }),
      prisma.appointment.findMany({
        where: { startIso: { gte: todayStart } },
        include: { patient: true, doctor: true, entity: true },
        orderBy: { startIso: "asc" },
        take: 6,
      }),
      prisma.crmCase.findMany({
        include: { patient: true, entity: true },
        orderBy: { lastInteraction: "desc" },
        take: 5,
      }),
    ]);

  const m = {
    registeredPatients: totalPatients,
    appointmentsToday,
    unconfirmedAppointments,
    pendingReminders,
    activeCrmCases,
    crmCasesWithPendingDocs,
    crmReadyToSchedule,
    patientsNotResponding,
  };

  const upcoming = upcomingAppointments;
  const recentCrm = recentCrmCases;

  const cards = [
    { label: "Pacientes registrados", value: m.registeredPatients, icon: UserRound, tone: "brand" as const, href: "/pacientes" },
    { label: "Citas de hoy", value: m.appointmentsToday, icon: CalendarDays, tone: "info" as const, href: "/agenda" },
    { label: "Citas sin confirmar", value: m.unconfirmedAppointments, icon: Clock, tone: "warning" as const, href: "/agenda" },
    { label: "Recordatorios pendientes", value: m.pendingReminders, icon: Bell, tone: "violet" as const, href: "/recordatorios" },
    { label: "Casos CRM activos", value: m.activeCrmCases, icon: Kanban, tone: "brand" as const, href: "/crm" },
    { label: "Documentos pendientes", value: m.crmCasesWithPendingDocs, icon: FileWarning, tone: "warning" as const, href: "/crm" },
    { label: "Listos para agendar", value: m.crmReadyToSchedule, icon: ListChecks, tone: "success" as const, href: "/crm" },
    { label: "Pacientes no responden", value: m.patientsNotResponding, icon: PhoneOff, tone: "danger" as const, href: "/recordatorios" },
  ];

  return (
    <>
      <PageHeader
        title="Resumen operativo"
        subtitle="Vision general de pacientes, agenda, recordatorios y CRM"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <MetricCard key={c.label} {...c} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Proximas citas</CardTitle>
              <p className="section-subtitle mt-0.5">Las siguientes 6 citas agendadas</p>
            </div>
            <Link href="/agenda" className="btn-ghost text-xs">
              Ver agenda <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <div className="divide-y divide-ink-200">
            {upcoming.map((a: any) => (
              <div key={a.id} className="px-5 py-3 flex items-center gap-4 hover:bg-ink-50 transition">
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex flex-col items-center justify-center shrink-0">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-900 truncate">
                    {a.patient ? fullName(a.patient) : (a.name ?? "—")} · {a.servicio ?? a.treatment ?? "—"}
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    {a.doctor ? `${a.doctor.firstName} ${a.doctor.lastName}` : (a.especialistaNombre ?? "—")} · {a.entity?.name ?? "—"} · {a.durationMinutes ?? "—"} min
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-medium text-ink-900">{formatTime(a.startIso ?? a.date)}</div>
                  <div className="text-[11px] text-ink-500">{formatDateTime(a.startIso ?? a.date).split(",")[0]}</div>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0 hidden sm:flex">
                  <AppointmentStatusBadge status={a.status} />
                  <ConfirmationBadge status={a.confirmationStatus} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas operativas</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {m.unconfirmedAppointments > 0 && (
              <Alert tone="warning" icon={<Clock className="w-4 h-4" />}
                title={`${m.unconfirmedAppointments} cita(s) sin confirmar`}
                description="Revisar recordatorios pendientes y respuestas del paciente."
                href="/recordatorios"
              />
            )}
            {m.crmCasesWithPendingDocs > 0 && (
              <Alert tone="warning" icon={<FileWarning className="w-4 h-4" />}
                title={`${m.crmCasesWithPendingDocs} caso(s) con documentos pendientes`}
                description="Validar carga de archivos por entidad y completar paquete."
                href="/crm"
              />
            )}
            {m.patientsNotResponding > 0 && (
              <Alert tone="danger" icon={<AlertTriangle className="w-4 h-4" />}
                title={`${m.patientsNotResponding} paciente(s) no responden`}
                description="Tomar decision manual: cancelar, reagendar o contactar de nuevo."
                href="/recordatorios"
              />
            )}
            {m.crmReadyToSchedule > 0 && (
              <Alert tone="success" icon={<CheckCircle2 className="w-4 h-4" />}
                title={`${m.crmReadyToSchedule} caso(s) listo para agendar`}
                description="Convertir casos en citas y notificar al paciente."
                href="/crm"
              />
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Casos CRM recientes</CardTitle>
            <p className="section-subtitle mt-0.5">Ultima interaccion con cada caso</p>
          </div>
          <Link href="/crm" className="btn-ghost text-xs">
            Ver tablero <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 bg-ink-50">
                <th className="px-5 py-2.5 font-medium">Paciente</th>
                <th className="px-5 py-2.5 font-medium">Entidad</th>
                <th className="px-5 py-2.5 font-medium">Tipo</th>
                <th className="px-5 py-2.5 font-medium">Estado</th>
                <th className="px-5 py-2.5 font-medium">Proxima accion</th>
                <th className="px-5 py-2.5 font-medium">Ultima interaccion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {recentCrm.map((c: any) => (
                <tr key={c.id} className="hover:bg-ink-50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink-900">{fullName(c.patient)}</div>
                    <div className="text-xs text-ink-500">CC {c.patient.documentNumber}</div>
                  </td>
                  <td className="px-5 py-3 text-ink-700">{c.entity?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-700">{humanLabel(c.type)}</td>
                  <td className="px-5 py-3"><CrmStatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-ink-700">{c.nextAction ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-500 text-xs">{formatDateTime(c.lastInteraction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Error en la base de datos</h1>
        <p className="text-ink-700 mb-4">No se pudo conectar a la base de datos.</p>
        <p className="text-sm text-ink-600 mb-4">{error instanceof Error ? error.message : 'Error desconocido'}</p>
        <div className="space-y-2">
          <p className="text-sm"><a href="/api/health" className="text-brand-600 hover:underline" target="_blank">Verificar health →</a></p>
          <p className="text-sm"><a href="/agenda" className="text-brand-600 hover:underline">Ir a Agenda →</a> (no requiere BD)</p>
        </div>
      </div>
    );
  }
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "brand" | "info" | "warning" | "violet" | "success" | "danger";
  href: string;
}) {
  const toneClasses: Record<typeof tone, string> = {
    brand:   "bg-brand-50 text-brand-700",
    info:    "bg-sky-50 text-sky-700",
    warning: "bg-amber-50 text-amber-700",
    violet:  "bg-violet-50 text-violet-700",
    success: "bg-emerald-50 text-emerald-700",
    danger:  "bg-red-50 text-red-700",
  };
  return (
    <Link href={href} className="card p-4 hover:shadow-soft transition group">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-semibold text-ink-900 mt-1">{value}</div>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${toneClasses[tone]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

function Alert({
  tone,
  title,
  description,
  icon,
  href,
}: {
  tone: "warning" | "danger" | "success";
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  const toneClasses: Record<typeof tone, string> = {
    warning: "border-amber-200 bg-amber-50/50",
    danger: "border-red-200 bg-red-50/50",
    success: "border-emerald-200 bg-emerald-50/50",
  };
  const iconClasses: Record<typeof tone, string> = {
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    success: "bg-emerald-100 text-emerald-700",
  };
  return (
    <Link href={href} className={`block rounded-lg border p-3 hover:shadow-card transition ${toneClasses[tone]}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${iconClasses[tone]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-ink-900">{title}</div>
          <div className="text-xs text-ink-600 mt-0.5">{description}</div>
        </div>
      </div>
    </Link>
  );
}
