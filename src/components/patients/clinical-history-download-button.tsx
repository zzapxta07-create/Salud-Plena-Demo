"use client";

import { FileText } from "lucide-react";
import { useSelectedPatient } from "@/lib/patient-context";

export function ClinicalHistoryDownloadButton() {
  const { selectedPatientId } = useSelectedPatient();

  if (!selectedPatientId) {
    return (
      <span className="text-xs text-ink-400 italic">
        Selecciona un paciente para descargar
      </span>
    );
  }

  return (
    <a
      href={`/api/patients/${selectedPatientId}/clinical-history/pdf`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ink-300 rounded-md hover:bg-ink-50 transition"
    >
      <FileText className="w-4 h-4 text-ink-600" />
      Descargar Historia Clínica PDF
    </a>
  );
}
