"use client";

import { useState } from "react";
import { CheckCircle2, Printer, Save } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPicker } from "@/components/patient-picker";
import { doctors, findPatient } from "@/lib/mock-data";
import { formatDateTime, fullName } from "@/lib/utils";

export function EvolucionForm({
  specialty,
  existing = [],
}: {
  specialty: "Odontologia" | "Ortodoncia";
  existing?: { id: string; patientId: string; treatment: string; note: string; doctorName: string; date: string }[];
}) {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [treatment, setTreatment] = useState("");
  const [doctor, setDoctor] = useState(doctors[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [signedDoc, setSignedDoc] = useState(false);
  const [signedPat, setSignedPat] = useState(false);

  return (
    <div className="space-y-6">
      <PatientPicker onSelect={setPatientId} />

      <Card>
        <CardHeader><CardTitle>Registrar evolucion — {specialty}</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tratamiento"><input className="input" value={treatment} onChange={(e) => setTreatment(e.target.value)} /></Field>
          <Field label="Doctor">
            <select className="input" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
              {doctors.map((d) => <option key={d.id} value={d.id}>{`Dr(a). ${d.firstName} ${d.lastName}`}</option>)}
            </select>
          </Field>
          <Field label="Nota / evolucion" className="md:col-span-2">
            <textarea className="input min-h-[140px]" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe el procedimiento realizado, hallazgos, indicaciones..." />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" className="rounded border-ink-300" checked={signedDoc} onChange={(e) => setSignedDoc(e.target.checked)} />
            Firma odontologo
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" className="rounded border-ink-300" checked={signedPat} onChange={(e) => setSignedPat(e.target.checked)} />
            Firma paciente
          </label>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2">
        <button className="btn-secondary"><Printer className="w-4 h-4" /> Imprimir</button>
        <button
          className="btn-primary"
          onClick={() => alert(patientId ? "Demo: evolucion guardada (no persiste sin BD)." : "Selecciona un paciente.")}
        >
          <Save className="w-4 h-4" /> Guardar evolucion
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evoluciones anteriores</CardTitle>
          <span className="text-xs text-ink-500">Toda evolucion firmada queda con trazabilidad</span>
        </CardHeader>
        <div className="divide-y divide-ink-200">
          {existing.length === 0 ? (
            <div className="text-center py-8 text-sm text-ink-500">Las evoluciones registradas apareceran aqui.</div>
          ) : existing.map((e) => {
            const p = findPatient(e.patientId);
            return (
              <div key={e.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-ink-900">{p ? fullName(p) : "—"} · {e.treatment}</div>
                  <div className="flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Firmada</div>
                </div>
                <div className="text-xs text-ink-500 mb-1.5">{e.doctorName} · {formatDateTime(e.date)}</div>
                <div className="text-sm text-ink-700">{e.note}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
