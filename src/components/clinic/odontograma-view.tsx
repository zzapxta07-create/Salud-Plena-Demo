"use client";

import { useState } from "react";
import { Printer, Save } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Odontograma } from "@/components/odontograma";
import { PatientPicker } from "@/components/patient-picker";

export function OdontogramaView({ specialty }: { specialty: "Odontologia" | "Ortodoncia" }) {
  const [patientId, setPatientId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PatientPicker onSelect={setPatientId} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Odontograma del paciente — {specialty}</CardTitle>
            <p className="section-subtitle">Ver y editar el odontograma como seccion independiente. Cambios quedan en historico.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs"><Printer className="w-3.5 h-3.5" /> Imprimir</button>
            <button className="btn-primary text-xs" onClick={() => alert(patientId ? "Demo: cambios guardados (no persiste sin BD)." : "Selecciona paciente.")}>
              <Save className="w-3.5 h-3.5" /> Guardar
            </button>
          </div>
        </CardHeader>
        <CardBody>
          {patientId ? <Odontograma /> : (
            <div className="text-center py-12 text-sm text-ink-500">Selecciona un paciente para ver su odontograma.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
