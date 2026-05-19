"use client";

import { useState } from "react";
import { Printer, RotateCcw, Save } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPicker } from "@/components/patient-picker";
import { doctors, entities } from "@/lib/mock-data";

export function ConsentForm({
  consentType,
  description,
  consentText,
}: {
  consentType: string;
  description: string;
  consentText: string;
}) {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [doctor, setDoctor] = useState(doctors[0]?.id ?? "");
  const [entity, setEntity] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [consultation, setConsultation] = useState("");

  return (
    <div className="space-y-6">
      <PatientPicker onSelect={setPatientId} />

      <Card>
        <CardHeader>
          <CardTitle>Datos del consentimiento</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tipo de consentimiento"><input className="input bg-ink-50" value={consentType} disabled /></Field>
          <Field label="Fecha"><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Doctor">
            <select className="input" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
              {doctors.map((d) => <option key={d.id} value={d.id}>{`Dr(a). ${d.firstName} ${d.lastName}`}</option>)}
            </select>
          </Field>
          <Field label="Convenio / entidad">
            <select className="input" value={entity} onChange={(e) => setEntity(e.target.value)}>
              <option value="">Particular / sin convenio</option>
              {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Field>
          <Field label="Consulta" className="md:col-span-2">
            <input className="input" value={consultation} onChange={(e) => setConsultation(e.target.value)} placeholder="Descripcion breve de la consulta o procedimiento" />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Texto del consentimiento</CardTitle>
            <p className="section-subtitle">{description}</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="prose prose-sm max-w-none text-ink-700 bg-ink-50 rounded-lg p-4 border border-ink-200 whitespace-pre-line">
            {consentText}
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <Signature label="Firma del paciente / acudiente" />
            <Signature label="Firma del odontologo" />
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <button className="btn-secondary"><RotateCcw className="w-4 h-4" /> Crear nuevo</button>
        <button className="btn-secondary"><Printer className="w-4 h-4" /> Imprimir</button>
        <button
          className="btn-primary"
          onClick={() => alert(patientId ? "Demo: consentimiento guardado (no persiste sin BD)." : "Selecciona un paciente.")}
        >
          <Save className="w-4 h-4" /> Guardar consentimiento
        </button>
      </div>
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

function Signature({ label }: { label: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="h-24 border border-dashed border-ink-300 rounded-lg bg-white flex items-center justify-center text-xs text-ink-400">
        Area de firma
      </div>
    </div>
  );
}

