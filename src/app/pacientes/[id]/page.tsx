import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CreditCard,
  FileSignature,
  FolderOpen,
  Kanban,
  Mail,
  MapPin,
  MessageSquareText,
  Pencil,
  Phone,
  Smile,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AppointmentStatusBadge,
  PatientStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui/status-badge";
import { PatientDocumentActions } from "@/components/patients/patient-document-actions";
import { prisma } from "@/lib/db";
import { calcAge, formatCOP, formatDate, formatDateTime, fullName, humanLabel } from "@/lib/utils";

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.patient.findUnique({
    where: { id },
    include: {
      entity: true,
      appointments: { include: { doctor: true } },
      payments: true,
      attachedFiles: true,
      crmCases: true,
      consents: true,
    },
  });

  if (!p) notFound();

  const patientAppointments = p.appointments || [];
  const patientPayments = p.payments || [];
  const patientFiles = p.attachedFiles || [];
  const patientCrm = p.crmCases || [];
  const patientConsents = p.consents || [];
  const patientReminders: any[] = [];

  const quickLinks = [
    { label: "Agenda", icon: CalendarDays, href: "/agenda" },
    { label: "Pagos", icon: CreditCard, href: "/pagos" },
    { label: "Adjuntar archivo", icon: FolderOpen, href: "/archivos" },
    { label: "Recordatorios", icon: Bell, href: "/recordatorios" },
    { label: "WhatsApp", icon: MessageSquareText, href: "/whatsapp" },
    { label: "CRM", icon: Kanban, href: "/crm" },
    { label: "Odontologia", icon: Smile, href: "/odontologia/valoracion" },
    { label: "Ortodoncia", icon: Stethoscope, href: "/ortodoncia/valoracion" },
    { label: "Consentimientos", icon: FileSignature, href: "/consentimientos" },
  ];

  return (
    <>
      <PageHeader
        title={fullName(p as any)}
        subtitle={`${p.documentType} ${p.documentNumber} · ${calcAge(p.birthDate)} años · ${p.gender}`}
        breadcrumbs={[{ label: "Pacientes", href: "/pacientes" }, { label: fullName(p as any) }]}
        actions={
          <>
            <PatientDocumentActions
              patientId={id}
              isMedPlus={p.entity?.name === "MedPlus"}
              patientName={fullName(p as any)}
            />
            <Link href={`/pacientes/${id}/editar`} className="btn-secondary">
              <Pencil className="w-4 h-4" /> Editar
            </Link>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-semibold">
              {p.firstName[0]}{p.firstLastName[0]}
            </div>
            <div className="mt-3 text-base font-semibold text-ink-900">{fullName(p as any)}</div>
            <div className="text-xs text-ink-500 mt-0.5">{p.documentType} {p.documentNumber}</div>
            <div className="mt-3"><PatientStatusBadge status={p.status} /></div>
            <div className="mt-5 w-full text-left space-y-2 text-sm">
              {p.cellphone && (
                <Row icon={<Phone className="w-4 h-4 text-ink-500" />} label="Celular" value={p.cellphone} />
              )}
              {p.email && (
                <Row icon={<Mail className="w-4 h-4 text-ink-500" />} label="Correo" value={p.email} />
              )}
              {(p.address || p.city) && (
                <Row icon={<MapPin className="w-4 h-4 text-ink-500" />} label="Direccion" value={[p.address, p.neighborhood, p.city, p.state].filter(Boolean).join(", ")} />
              )}
              <Row icon={<UserRound className="w-4 h-4 text-ink-500" />} label="Tipo" value={`${humanLabel(p.patientType)} · ${p.entity?.name ?? "Particular"}`} />
            </div>
            <div className="border-t border-ink-200 mt-5 pt-4 w-full text-left text-xs text-ink-500">
              Creado {formatDate(p.createdAt)} · Actualizado {formatDate(p.updatedAt)}
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Modulos relacionados</CardTitle></CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickLinks.map((q) => {
                  const Icon = q.icon;
                  return (
                    <Link key={q.label} href={q.href} className="flex items-center gap-3 p-3 rounded-lg border border-ink-200 hover:border-brand-300 hover:bg-brand-50/40 transition">
                      <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-sm text-ink-900 font-medium">{q.label}</div>
                    </Link>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Citas</CardTitle>
                <span className="text-xs text-ink-500">{patientAppointments.length} citas</span>
              </CardHeader>
              <div className="divide-y divide-ink-200">
                {patientAppointments.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-ink-900">{a.treatment}</div>
                      <div className="text-xs text-ink-500">{a.doctor.firstName} {a.doctor.lastName} · {formatDateTime(a.date)}</div>
                    </div>
                    <AppointmentStatusBadge status={a.status} />
                  </div>
                ))}
                {patientAppointments.length === 0 && (
                  <div className="px-5 py-6 text-center text-sm text-ink-500">Sin citas registradas</div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagos</CardTitle>
                <span className="text-xs text-ink-500">{patientPayments.length} pagos</span>
              </CardHeader>
              <div className="divide-y divide-ink-200">
                {patientPayments.slice(0, 5).map((py: any) => (
                  <div key={py.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-ink-900">{py.concept}</div>
                      <div className="text-xs text-ink-500">{py.method} · {py.paidAt ? formatDate(py.paidAt) : "Pendiente"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-ink-900">{formatCOP(py.amount)}</div>
                      <PaymentStatusBadge status={py.status} />
                    </div>
                  </div>
                ))}
                {patientPayments.length === 0 && (
                  <div className="px-5 py-6 text-center text-sm text-ink-500">Sin pagos registrados</div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Archivos</CardTitle>
                <span className="text-xs text-ink-500">{patientFiles.length} archivos</span>
              </CardHeader>
              <div className="divide-y divide-ink-200">
                {patientFiles.map((f: any) => (
                  <div key={f.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-ink-900">{f.fileName}</div>
                      <div className="text-xs text-ink-500">{f.fileType} · {formatDate(f.uploadedAt)}</div>
                    </div>
                  </div>
                ))}
                {patientFiles.length === 0 && (
                  <div className="px-5 py-6 text-center text-sm text-ink-500">Sin archivos</div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Casos CRM</CardTitle>
                <span className="text-xs text-ink-500">{patientCrm.length} casos</span>
              </CardHeader>
              <div className="divide-y divide-ink-200">
                {patientCrm.map((c: any) => (
                  <div key={c.id} className="px-5 py-3">
                    <div className="text-sm font-medium text-ink-900">{humanLabel(c.type)}</div>
                    <div className="text-xs text-ink-500 mt-0.5">{c.observations}</div>
                  </div>
                ))}
                {patientCrm.length === 0 && (
                  <div className="px-5 py-6 text-center text-sm text-ink-500">Sin casos CRM</div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consentimientos</CardTitle>
                <span className="text-xs text-ink-500">{patientConsents.length} firmados</span>
              </CardHeader>
              <div className="divide-y divide-ink-200">
                {patientConsents.map((c: any) => (
                  <div key={c.id} className="px-5 py-3">
                    <div className="text-sm font-medium text-ink-900">{humanLabel(c.type)}</div>
                    <div className="text-xs text-ink-500">{c.consultation} · {formatDate(c.signedAt)}</div>
                  </div>
                ))}
                {patientConsents.length === 0 && (
                  <div className="px-5 py-6 text-center text-sm text-ink-500">Sin consentimientos</div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recordatorios</CardTitle>
                <span className="text-xs text-ink-500">{patientReminders.length} eventos</span>
              </CardHeader>
              <div className="divide-y divide-ink-200">
                {patientReminders.map((r: any) => (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-ink-900">{humanLabel(r.stage)}</div>
                      <div className="text-xs text-ink-500">{formatDateTime(r.scheduledAt)}</div>
                    </div>
                    <div className="text-xs text-ink-700">{humanLabel(r.status)}</div>
                  </div>
                ))}
                {patientReminders.length === 0 && (
                  <div className="px-5 py-6 text-center text-sm text-ink-500">Sin recordatorios</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-ink-500">{label}</div>
        <div className="text-sm text-ink-900 break-words">{value}</div>
      </div>
    </div>
  );
}
