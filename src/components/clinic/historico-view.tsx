"use client";

import { useMemo, useState } from "react";
import { FileDown, Filter, Printer, Search } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPicker } from "@/components/patient-picker";
import { appointments, doctorName, doctors } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

export function HistoricoView({ specialty }: { specialty: "Odontologia" | "Ortodoncia" }) {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [fromDate, setFromDate] = useState("");

  const data = useMemo(() => {
    if (!patientId) return [];
    return appointments
      .filter((a) => a.patientId === patientId)
      .filter((a) => !doctorId || a.doctorId === doctorId)
      .filter((a) => !fromDate || new Date(a.startIso ?? a.date ?? "") >= new Date(fromDate))
      .filter((a) => !q || (a.observation ?? "").toLowerCase().includes(q.toLowerCase()) || (a.servicio ?? a.treatment ?? "").toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => new Date(b.startIso ?? b.date ?? "").getTime() - new Date(a.startIso ?? a.date ?? "").getTime());
  }, [patientId, q, doctorId, fromDate]);

  return (
    <div className="space-y-6">
      <PatientPicker onSelect={setPatientId} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Historico — {specialty}</CardTitle>
            <p className="section-subtitle">Eventos clinicos y administrativos anteriores. La recepcion usa este historico para ubicar indicaciones del odontologo.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs"><FileDown className="w-3.5 h-3.5" /> Exportar</button>
            <button className="btn-secondary text-xs"><Printer className="w-3.5 h-3.5" /> Imprimir</button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input className="input pl-9" placeholder="Buscar en observaciones..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <select className="input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">Todos los doctores</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{`Dr(a). ${d.firstName} ${d.lastName}`}</option>)}
            </select>
            <input type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          {!patientId ? (
            <div className="text-center py-12 text-sm text-ink-500">Selecciona un paciente para ver su historico.</div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-sm text-ink-500">Sin eventos registrados con esos filtros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Fecha</th>
                    <th className="px-4 py-2.5 font-medium">Motivo / Tratamiento</th>
                    <th className="px-4 py-2.5 font-medium">Doctor</th>
                    <th className="px-4 py-2.5 font-medium">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200">
                  {data.map((a) => (
                    <tr key={a.id} className="hover:bg-ink-50">
                      <td className="px-4 py-3 text-ink-700 whitespace-nowrap">{formatDateTime(a.startIso ?? a.date ?? "")}</td>
                      <td className="px-4 py-3 text-ink-900 font-medium">{a.servicio ?? a.treatment ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-700">{doctorName(a.doctorId)}</td>
                      <td className="px-4 py-3 text-ink-700">{a.observation ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
