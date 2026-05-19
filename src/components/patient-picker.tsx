"use client";

import { useState } from "react";
import { Search, UserRound } from "lucide-react";
import { patients } from "@/lib/mock-data";
import { fullName, calcAge } from "@/lib/utils";
import { Card, CardBody } from "./ui/card";

export function PatientPicker({
  onSelect,
}: {
  onSelect?: (patientId: string) => void;
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const matches = q.trim()
    ? patients.filter(
        (p) =>
          p.documentNumber.includes(q) ||
          fullName(p).toLowerCase().includes(q.toLowerCase()),
      )
    : [];

  const selectedPatient = selected ? patients.find((p) => p.id === selected) : null;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <label className="label">Buscar paciente</label>
          <div className="relative">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="input pl-9"
              placeholder="Documento o nombre"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSelected(null);
              }}
            />
          </div>
          {q && matches.length > 0 && !selected && (
            <div className="mt-2 border border-ink-200 rounded-lg max-h-64 overflow-y-auto bg-white shadow-soft">
              {matches.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className="w-full text-left px-3 py-2 hover:bg-ink-50 flex items-center gap-3 border-b last:border-b-0"
                  onClick={() => {
                    setSelected(p.id);
                    setQ("");
                    onSelect?.(p.id);
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-medium">
                    {p.firstName[0]}{p.firstLastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-900">{fullName(p)}</div>
                    <div className="text-xs text-ink-500">CC {p.documentNumber} · {calcAge(p.birthDate)} años · {p.entityName ?? "Particular"}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPatient && (
          <div className="grid sm:grid-cols-2 gap-3 p-4 bg-ink-50 rounded-lg border border-ink-200">
            <Field label="Documento" value={`${selectedPatient.documentType} ${selectedPatient.documentNumber}`} />
            <Field label="Expedida en" value={selectedPatient.expeditionPlace ?? "—"} />
            <Field label="Primer nombre" value={selectedPatient.firstName} />
            <Field label="Segundo nombre" value={selectedPatient.middleName ?? "—"} />
            <Field label="Primer apellido" value={selectedPatient.firstLastName} />
            <Field label="Segundo apellido" value={selectedPatient.secondLastName ?? "—"} />
            <Field label="Genero" value={selectedPatient.gender} />
            <Field label="Fecha nacimiento" value={selectedPatient.birthDate} />
            <Field label="Edad" value={`${calcAge(selectedPatient.birthDate)} años`} />
            <Field label="Entidad" value={selectedPatient.entityName ?? "—"} />
            <div className="sm:col-span-2 flex items-center gap-3 mt-1">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                <UserRound className="w-5 h-5" />
              </div>
              <div className="text-xs text-ink-500">Foto del paciente</div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
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
