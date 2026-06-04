"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPicker } from "@/components/patient-picker";

const ES_DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
interface Doctor { id: string; firstName: string; lastName: string; specialty: string }
interface Entity { id: string; name: string }

export default function NuevaCitaPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [doctor, setDoctor] = useState("");
  const [entity, setEntity] = useState("");
  const [treatment, setTreatment] = useState("");
  const [observation, setObservation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/doctors").then((r) => r.json()),
      fetch("/api/entities").then((r) => r.json()),
    ]).then(([docs, ents]) => {
      const docList = Array.isArray(docs) ? docs : [];
      setDoctors(docList);
      setEntities(Array.isArray(ents) ? ents : []);
      if (docList.length > 0) setDoctor(docList[0].id);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) { setError("Completa la fecha y hora."); return; }
    setSaving(true);
    setError(null);
    try {
      const startIso = new Date(`${date}T${time}`).toISOString();
      const endIso = new Date(new Date(`${date}T${time}`).getTime() + duration * 60000).toISOString();
      const startDate = new Date(startIso);
      const selectedDoctor = doctors.find((d) => d.id === doctor);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startIso,
          endIso,
          fechaIsoDia: startDate.toISOString().split("T")[0],
          diaTexto: ES_DAYS[startDate.getDay()],
          servicio: treatment,
          especialistaNombre: selectedDoctor ? `Dr(a). ${selectedDoctor.firstName} ${selectedDoctor.lastName}` : undefined,
          estadoCita: "pendiente",
          durationMinutes: duration,
          treatment,
          patientId: patientId ?? undefined,
          doctorId: doctor || undefined,
          entityId: entity || undefined,
          observation: observation || undefined,
          status: "AGENDADA",
          confirmationStatus: "PENDIENTE",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      router.push("/agenda");
    } catch (err: any) {
      setError(err.message ?? "Error al guardar");
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Nueva cita"
        subtitle="Crear cita asociada a paciente, doctor y tratamiento. Alimenta agenda y recordatorios automaticamente."
        breadcrumbs={[{ label: "Agenda", href: "/agenda" }, { label: "Nueva cita" }]}
        actions={
          <Link href="/agenda" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <PatientPicker onSelect={setPatientId} />

        <Card>
          <CardHeader><CardTitle>Detalles de la cita</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Fecha"><input type="date" className="input" required value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Hora"><input type="time" className="input" required value={time} onChange={(e) => setTime(e.target.value)} /></Field>
            <Field label="Duracion (min)"><input type="number" min={15} step={15} className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></Field>
            <Field label="Doctor">
              <select className="input" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                {doctors.map((d) => <option key={d.id} value={d.id}>{`Dr(a). ${d.firstName} ${d.lastName} — ${d.specialty}`}</option>)}
              </select>
            </Field>
            <Field label="Entidad / convenio">
              <select className="input" value={entity} onChange={(e) => setEntity(e.target.value)}>
                <option value="">Particular / sin entidad</option>
                {entities.map((ent) => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
              </select>
            </Field>
            <Field label="Tratamiento">
              <input className="input" placeholder="Ej. Limpieza dental, Endodoncia 16..." value={treatment} onChange={(e) => setTreatment(e.target.value)} />
            </Field>
            <Field label="Observacion" className="md:col-span-3">
              <textarea className="input min-h-[80px]" value={observation} onChange={(e) => setObservation(e.target.value)} />
            </Field>
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>
            <X className="w-4 h-4" /> Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "Agendando..." : "Agendar cita"}
          </button>
        </div>
      </form>
    </>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
