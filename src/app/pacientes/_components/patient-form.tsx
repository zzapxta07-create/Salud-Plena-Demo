"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, UserRound } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { entities, findPatientByDoc } from "@/lib/mock-data";
import { calcAge, humanLabel } from "@/lib/utils";
import type { Patient } from "@/lib/types";

export function PatientForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Patient;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Patient>>(
    initial ?? {
      documentType: "CC",
      gender: "Femenino",
      patientType: "PARTICULAR",
    },
  );

  const age = useMemo(() => (form.birthDate ? calcAge(form.birthDate) : "—"), [form.birthDate]);

  const existing = mode === "create" && form.documentNumber ? findPatientByDoc(form.documentNumber) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Demo: paciente guardado (no persiste en esta demo sin BD conectada).");
    router.push("/pacientes");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {existing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Ya existe un paciente con ese documento: <strong>{existing.firstName} {existing.firstLastName}</strong>.
          Para evitar duplicados, abre su perfil existente.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Identificacion</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Tipo de documento">
              <select className="input" value={form.documentType ?? ""} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
                {["CC","TI","RC","CE","PA","NIT"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Numero de documento" required>
              <input className="input" required value={form.documentNumber ?? ""} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} />
            </Field>
            <Field label="Lugar de expedicion">
              <input className="input" value={form.expeditionPlace ?? ""} onChange={(e) => setForm({ ...form, expeditionPlace: e.target.value })} />
            </Field>

            <Field label="Primer nombre" required>
              <input className="input" required value={form.firstName ?? ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </Field>
            <Field label="Segundo nombre">
              <input className="input" value={form.middleName ?? ""} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
            </Field>
            <Field label="Genero">
              <select className="input" value={form.gender ?? ""} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>Femenino</option>
                <option>Masculino</option>
                <option>Otro</option>
              </select>
            </Field>
            <Field label="Primer apellido" required>
              <input className="input" required value={form.firstLastName ?? ""} onChange={(e) => setForm({ ...form, firstLastName: e.target.value })} />
            </Field>
            <Field label="Segundo apellido">
              <input className="input" value={form.secondLastName ?? ""} onChange={(e) => setForm({ ...form, secondLastName: e.target.value })} />
            </Field>
            <Field label="Fecha de nacimiento">
              <input type="date" className="input" value={form.birthDate ?? ""} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            </Field>
            <Field label="Edad (calculada)">
              <input className="input bg-ink-50" value={age} disabled />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Foto del paciente</CardTitle></CardHeader>
          <CardBody className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full bg-ink-100 flex items-center justify-center text-ink-400">
              <UserRound className="w-12 h-12" />
            </div>
            <button type="button" className="btn-secondary text-xs">Cargar foto</button>
            <p className="text-xs text-ink-500 text-center">JPG, PNG. Maximo 2MB.</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Clasificacion y aseguradora</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Tipo de paciente">
            <select className="input" value={form.patientType ?? ""} onChange={(e) => setForm({ ...form, patientType: e.target.value as Patient["patientType"] })}>
              {["PARTICULAR","ASEGURADORA","ARL","CONVENIO"].map((t) => <option key={t} value={t}>{humanLabel(t)}</option>)}
            </select>
          </Field>
          <Field label="Entidad">
            <select className="input" value={form.entityId ?? ""} onChange={(e) => setForm({ ...form, entityId: e.target.value })}>
              <option value="">— Selecciona entidad —</option>
              {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Field>
          <Field label="Estado operativo">
            <select className="input" value={form.status ?? "NUEVO"} onChange={(e) => setForm({ ...form, status: e.target.value as Patient["status"] })}>
              {["NUEVO","ACTIVO","EN_AUTORIZACION","PENDIENTE_DOCUMENTOS","AGENDADO","EN_TRATAMIENTO","FINALIZADO","INACTIVO"].map((s) => (
                <option key={s} value={s}>{humanLabel(s)}</option>
              ))}
            </select>
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contacto</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Telefono">
            <input className="input" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Celular (WhatsApp / recordatorios)">
            <input className="input" value={form.cellphone ?? ""} onChange={(e) => setForm({ ...form, cellphone: e.target.value })} />
          </Field>
          <Field label="Correo electronico">
            <input type="email" className="input" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Direccion" className="md:col-span-2">
            <input className="input" value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Barrio">
            <input className="input" value={form.neighborhood ?? ""} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
          </Field>
          <Field label="Ciudad">
            <input className="input" value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="Departamento">
            <input className="input" value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </Field>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button type="submit" className="btn-primary">
          <Save className="w-4 h-4" /> Guardar paciente
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
