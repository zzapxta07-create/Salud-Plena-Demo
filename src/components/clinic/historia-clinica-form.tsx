"use client";

import { useState } from "react";
import { FileDown, Printer, Save } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPicker } from "@/components/patient-picker";

export function HistoriaClinicaForm({ specialty }: { specialty: "Odontologia" | "Ortodoncia" }) {
  const [patientId, setPatientId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PatientPicker onSelect={setPatientId} />

      <Card>
        <CardHeader><CardTitle>Responsable (si es menor de edad)</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Nombre responsable","Parentesco","Identificacion","Telefono residencia","Telefono laboral"].map((l) => (
            <Field key={l} label={l}><input className="input" /></Field>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Motivo de consulta y evolucion</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Field label="Motivo de consulta"><textarea className="input min-h-[80px]" /></Field>
          <Field label="Evolucion y estado actual"><textarea className="input min-h-[80px]" /></Field>
          <Field label="Antecedentes familiares"><textarea className="input min-h-[60px]" /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Anamnesis</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              "Alergias","Discrasias sanguineas","Cardiopatias","Embarazo",
              "Alteraciones de presion arterial","Toma de medicamentos","Tratamiento medico actual",
              "Hepatitis","Diabetes","Fiebre reumatica","VIH/SIDA","Inmunosupresion",
              "Patologias renales","Patologias respiratorias","Trastornos gastricos",
              "Trastornos emocionales","Sinusitis","Cirugias orales","Exodoncias",
              "Enfermedades orales","Uso de protesis o aparatologia oral","Otras patologias",
              "Habitos asociados a cavidad oral",
            ].map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-ink-700 p-1.5 rounded hover:bg-ink-50">
                <input type="checkbox" className="rounded border-ink-300" /> {item}
              </label>
            ))}
          </div>
          <div className="mt-4">
            <Field label="Observaciones"><textarea className="input min-h-[80px]" /></Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Examen estomatologico</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            "Labio inferior","Labio superior","Comisuras","Mucosa oral","Surcos","Frenillos",
            "Orofaringe","Paladar","Glandulas salivales","Piso de boca","Dorso de lengua",
            "Vientre de lengua","ATM","Ruidos","Desviacion","Cambio de volumen",
            "Bloqueo mandibular","Limitacion de apertura","Dolor articular","Dolor muscular",
            "Indice COP","Cariados","Obturados","Exfoliados","Sanos",
          ].map((item) => (
            <Field key={item} label={item}><input className="input text-sm" /></Field>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Examen pulpar</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["Cuellos sensibles","Abscesos","Exposicion pulpar","Cambio de color"].map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-ink-700 p-1.5 rounded hover:bg-ink-50">
              <input type="checkbox" className="rounded border-ink-300" /> {item}
            </label>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tejidos dentarios y oclusion</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            "Supernumerarios","Decoloracion","Descalcificacion","Facetas de desgaste",
            "Abrasion o erosion","Tipo de oclusion","Lectura radiografica",
          ].map((item) => (
            <Field key={item} label={item}><input className="input text-sm" /></Field>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Alteraciones periodontales</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {["Sangrado","Registro placa bacteriana","Higiene oral","Exudado","Supuracion","Calculos","Inflamacion","Retracciones","Presencia de bolsas"].map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-ink-700 p-1.5 rounded hover:bg-ink-50">
              <input type="checkbox" className="rounded border-ink-300" /> {item}
            </label>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Diagnosticos</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["Articular","Pulpar","Periodontal","Dental","CyD - Oclusion","Tejidos blandos","Otros"].map((item) => (
            <Field key={item} label={item}><input className="input" /></Field>
          ))}
          <Field label="Diagnostico principal" className="md:col-span-2"><input className="input" /></Field>
          <Field label="Observaciones" className="md:col-span-2"><textarea className="input min-h-[80px]" /></Field>
        </CardBody>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <button className="btn-secondary"><FileDown className="w-4 h-4" /> Exportar PDF</button>
        <button className="btn-secondary"><Printer className="w-4 h-4" /> Imprimir</button>
        <button
          className="btn-primary"
          onClick={() => alert(patientId ? `Demo: historia clinica de ${specialty} guardada.` : "Selecciona un paciente.")}
        >
          <Save className="w-4 h-4" /> Guardar historia clinica
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
