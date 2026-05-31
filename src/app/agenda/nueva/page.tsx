"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPicker } from "@/components/patient-picker";
import { doctors, entities, findPatient } from "@/lib/mock-data";

const ES_DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export default function NuevaCitaPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [doctor, setDoctor] = useState(doctors[0]?.id ?? "");
  const [entity, setEntity] = useState("");
  const [treatment, setTreatment] = useState("");
  const [observation, setObservation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) {
      alert("Completa la fecha y hora.");
      return;
    }

    const startIso = new Date(`${date}T${time}`).toISOString();
    const endIso = new Date(new Date(`${date}T${time}`).getTime() + duration * 60000).toISOString();
    const startDate = new Date(startIso);
    const selectedDoctor = doctors.find((d) => d.id === doctor);
    const patient = patientId ? findPatient(patientId) : undefined;

    const appt = {
      startIso,
      endIso,
      fechaIsoDia: startDate.toISOString().split("T")[0],
      diaTexto: ES_DAYS[startDate.getDay()],
      servicio: treatment,
      name: patient ? `${patient.firstName} ${patient.firstLastName}` : undefined,
      phone: patient?.cellphone ?? patient?.phone,
      especialistaNombre: selectedDoctor
        ? `Dr(a). ${selectedDoctor.firstName} ${selectedDoctor.lastName}`
        : undefined,
      estadoCita: "pendiente",
      // legacy
      date: startIso,
      durationMinutes: duration,
      treatment,
      patientId: patientId ?? undefined,
      doctorId: doctor,
      entityId: entity || undefined,
      observation,
    };

    console.log("Nueva cita (demo):", appt);
    alert("Demo: cita registrada (no persiste sin BD).\n\nEstructura n8n-compatible generada en consola.");
    router.push("/agenda");
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
                {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
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
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" /> Agendar cita
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
