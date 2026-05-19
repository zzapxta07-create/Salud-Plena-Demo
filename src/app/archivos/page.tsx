"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPicker } from "@/components/patient-picker";
import { attachedFiles, findPatient } from "@/lib/mock-data";
import { formatDate, fullName } from "@/lib/utils";

const FILE_TYPES = [
  "Documento de identidad",
  "Autorizacion de aseguradora",
  "Historia clinica",
  "Historico de citas",
  "Consentimiento firmado",
  "Soporte de pago",
  "Orden medica",
  "Archivo de entidad",
  "Otro",
];

export default function ArchivosPage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [fileType, setFileType] = useState(FILE_TYPES[0]);

  return (
    <>
      <PageHeader
        title="Adjuntar archivo"
        subtitle="Carga documentos por paciente. Los archivos asociados a casos CRM se enlazan automaticamente."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <PatientPicker onSelect={setPatientId} />
          <Card>
            <CardHeader><CardTitle>Subir archivo</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="label">Tipo de archivo</label>
                <select className="input" value={fileType} onChange={(e) => setFileType(e.target.value)}>
                  {FILE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <label className="block border-2 border-dashed border-ink-300 rounded-lg p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition">
                <Upload className="w-7 h-7 text-ink-400 mx-auto mb-2" />
                <div className="text-sm text-ink-700 font-medium">Selecciona o arrastra un archivo</div>
                <div className="text-xs text-ink-500 mt-1">PDF, imagen o documento. Maximo 10MB</div>
                <input type="file" className="hidden" />
              </label>
              <button className="btn-primary w-full" disabled={!patientId} onClick={(e) => { e.preventDefault(); alert("Demo: archivo cargado (no persiste sin almacenamiento)."); }}>
                Cargar archivo
              </button>
              {!patientId && <p className="text-xs text-ink-500 text-center">Selecciona primero un paciente</p>}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Archivos recientes</CardTitle>
              <FolderOpen className="w-4 h-4 text-ink-500" />
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wide text-ink-500 bg-white">
                  <tr>
                    <th className="px-5 py-3 font-medium">Archivo</th>
                    <th className="px-5 py-3 font-medium">Tipo</th>
                    <th className="px-5 py-3 font-medium">Paciente</th>
                    <th className="px-5 py-3 font-medium">Subido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200">
                  {attachedFiles.map((f) => {
                    const p = findPatient(f.patientId);
                    return (
                      <tr key={f.id} className="hover:bg-ink-50">
                        <td className="px-5 py-3 text-ink-900 font-medium">{f.fileName}</td>
                        <td className="px-5 py-3 text-ink-700">{f.fileType}</td>
                        <td className="px-5 py-3">
                          {p ? <Link href={`/pacientes/${p.id}`} className="text-brand-700 hover:underline">{fullName(p)}</Link> : "—"}
                        </td>
                        <td className="px-5 py-3 text-ink-500 text-xs">{formatDate(f.uploadedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
