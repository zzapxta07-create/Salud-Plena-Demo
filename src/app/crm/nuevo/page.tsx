"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPicker } from "@/components/patient-picker";
import { entities } from "@/lib/mock-data";
import { humanLabel } from "@/lib/utils";

export default function NuevoCasoCrmPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [type, setType] = useState("SOLICITUD_AUTORIZACION");
  const [entity, setEntity] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [observations, setObservations] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return alert("Selecciona un paciente primero.");
    alert("Demo: caso CRM creado (no persiste sin BD).");
    router.push("/crm");
  }

  return (
    <>
      <PageHeader
        title="Nuevo caso CRM"
        subtitle="Gestiona solicitudes de autorizacion, cotizaciones, reagendamientos y mas"
        breadcrumbs={[{ label: "CRM", href: "/crm" }, { label: "Nuevo caso" }]}
        actions={<Link href="/crm" className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Volver</Link>}
      />
      <form onSubmit={submit} className="space-y-6">
        <PatientPicker onSelect={setPatientId} />
        <Card>
          <CardHeader><CardTitle>Detalles del caso</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de caso</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {["SOLICITUD_AUTORIZACION","PARTICULAR_INTERESADO","COTIZACION_PENDIENTE","REAGENDAMIENTO","CANCELACION","DOCUMENTO_PENDIENTE","RADICADO_PENDIENTE","LISTO_PARA_AGENDAR"].map((t) => (
                  <option key={t} value={t}>{humanLabel(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Entidad</label>
              <select className="input" value={entity} onChange={(e) => setEntity(e.target.value)}>
                <option value="">— Sin entidad —</option>
                {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Proxima accion</label>
              <input className="input" placeholder="Ej. Solicitar documentos basicos" value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Observaciones</label>
              <textarea className="input min-h-[100px]" value={observations} onChange={(e) => setObservations(e.target.value)} />
            </div>
          </CardBody>
        </Card>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => router.back()}><X className="w-4 h-4" /> Cancelar</button>
          <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> Crear caso</button>
        </div>
      </form>
    </>
  );
}
