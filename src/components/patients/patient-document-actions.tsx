"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface Props {
  patientId: string;
  isMedPlus: boolean;
  patientName: string;
}

function triggerDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function PatientDocumentActions({ patientId, isMedPlus, patientName }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => triggerDownload(`/api/patients/${patientId}/clinical-history/pdf`)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ink-300 rounded-md hover:bg-ink-50 transition"
        title={`Descargar historia clínica de ${patientName}`}
      >
        <FileText className="w-4 h-4 text-ink-600" />
        Historia Clínica PDF
      </button>

      {isMedPlus && (
        <>
          <button
            onClick={() => triggerDownload(`/api/patients/${patientId}/medplus-package/pdf`)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ink-300 rounded-md hover:bg-ink-50 transition"
            title="Descargar paquete documental MedPlus"
          >
            <Download className="w-4 h-4 text-ink-600" />
            Paquete MedPlus PDF
          </button>
          <button
            onClick={() => triggerDownload(`/api/patients/${patientId}/medplus-authorization/excel`)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ink-300 rounded-md hover:bg-ink-50 transition"
            title="Descargar autorización MedPlus en Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-ink-600" />
            Autorización Excel
          </button>
        </>
      )}
    </div>
  );
}
