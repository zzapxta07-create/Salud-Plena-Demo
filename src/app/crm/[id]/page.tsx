import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, FileBox, FilePlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { CrmStatusBadge } from "@/components/ui/status-badge";
import { prisma } from "@/lib/db";
import { formatDateTime, fullName, humanLabel } from "@/lib/utils";
import { DocumentPackagePanel } from "./_document-package-panel";

export default async function CrmCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.crmCase.findUnique({
    where: { id },
    include: { patient: true, entity: true, files: true },
  });

  if (!c) notFound();

  const p = c.patient ? { ...c.patient, middleName: c.patient.middleName ?? undefined, secondLastName: c.patient.secondLastName ?? undefined } : null;
  const caseFiles = c.files || [];
  const entity = c.entity;

  return (
    <>
      <PageHeader
        title={`Caso CRM`}
        subtitle={`${humanLabel(c.type)} · ${p ? fullName(p) : "—"}`}
        breadcrumbs={[{ label: "CRM", href: "/crm" }, { label: "Detalle" }]}
        actions={<Link href="/crm" className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Volver</Link>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del caso</CardTitle>
              <CrmStatusBadge status={c.status} />
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Paciente" value={p ? fullName(p) : "—"} />
              <Field label="Documento" value={`${p?.documentType ?? ""} ${p?.documentNumber ?? ""}`} />
              <Field label="Telefono" value={p?.cellphone ?? "—"} />
              <Field label="Tipo de paciente" value={p ? humanLabel(p.patientType) : "—"} />
              <Field label="Entidad" value={entity?.name ?? "—"} />
              <Field label="Tipo de caso" value={humanLabel(c.type)} />
              <Field label="Responsable" value={c.responsible ?? "—"} />
              <Field label="Ultima interaccion" value={formatDateTime(c.lastInteraction)} />
              <div className="md:col-span-2">
                <div className="text-[11px] uppercase tracking-wide text-ink-500 font-medium">Proxima accion</div>
                <div className="text-sm text-ink-900 mt-1 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">{c.nextAction ?? "—"}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-[11px] uppercase tracking-wide text-ink-500 font-medium">Observaciones</div>
                <div className="text-sm text-ink-700 mt-1">{c.observations ?? "—"}</div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/agenda/nueva" className="btn-secondary"><CalendarPlus className="w-4 h-4" /> Crear cita desde este caso</Link>
              <Link href="/archivos" className="btn-secondary"><FilePlus className="w-4 h-4" /> Adjuntar archivo</Link>
              <button className="btn-secondary"><FileBox className="w-4 h-4" /> Cambiar estado</button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Archivos asociados</CardTitle>
              <span className="text-xs text-ink-500">{caseFiles.length} archivos</span>
            </CardHeader>
            <div className="divide-y divide-ink-200">
              {caseFiles.map((f: any) => (
                <div key={f.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-ink-900">{f.fileName}</div>
                    <div className="text-xs text-ink-500">{f.fileType}</div>
                  </div>
                  <button className="btn-ghost text-xs">Descargar</button>
                </div>
              ))}
              {caseFiles.length === 0 && <div className="text-center py-6 text-sm text-ink-500">Sin archivos</div>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <DocumentPackagePanel entity={entity ?? null} />
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-ink-500 font-medium">{label}</div>
      <div className="text-sm text-ink-900 mt-0.5">{value}</div>
    </div>
  );
}
