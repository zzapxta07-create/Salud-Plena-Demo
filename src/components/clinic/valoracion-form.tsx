"use client";

import { useState } from "react";
import { Printer, Save, Search } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Odontograma } from "@/components/odontograma";
import { PatientPicker } from "@/components/patient-picker";

export function ValoracionForm({ specialty }: { specialty: "Odontologia" | "Ortodoncia" }) {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [obs, setObs] = useState("");

  return (
    <div className="space-y-6">
      <PatientPicker onSelect={setPatientId} />

      <Card>
        <CardHeader>
          <CardTitle>Odontograma — {specialty}</CardTitle>
          <p className="section-subtitle">Aplica estados por pieza dental</p>
        </CardHeader>
        <CardBody>
          <Odontograma />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Observaciones generales de la valoracion</CardTitle></CardHeader>
        <CardBody>
          <textarea
            className="input min-h-[120px]"
            placeholder="Notas, hallazgos, recomendaciones..."
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </CardBody>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <button className="btn-secondary"><Search className="w-4 h-4" /> Consultar valoraciones anteriores</button>
        <button className="btn-secondary"><Printer className="w-4 h-4" /> Imprimir</button>
        <button
          className="btn-primary"
          onClick={() => alert(patientId ? "Demo: valoracion guardada (no persiste sin BD)." : "Selecciona un paciente.")}
        >
          <Save className="w-4 h-4" /> Guardar valoracion
        </button>
      </div>
    </div>
  );
}
