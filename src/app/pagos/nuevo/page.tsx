"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPicker } from "@/components/patient-picker";

export default function NuevoPagoPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("Efectivo");
  const [status, setStatus] = useState("PAGADO");
  const [observation, setObservation] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return alert("Selecciona un paciente primero.");
    alert("Demo: pago registrado (no persiste sin BD).");
    router.push("/pagos");
  }

  return (
    <>
      <PageHeader
        title="Registrar pago"
        breadcrumbs={[{ label: "Pagos", href: "/pagos" }, { label: "Nuevo pago" }]}
        actions={<Link href="/pagos" className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Volver</Link>}
      />
      <form onSubmit={submit} className="space-y-6">
        <PatientPicker onSelect={setPatientId} />
        <Card>
          <CardHeader><CardTitle>Detalles del pago</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Concepto</label>
              <input className="input" required value={concept} onChange={(e) => setConcept(e.target.value)} />
            </div>
            <div>
              <label className="label">Valor (COP)</label>
              <input type="number" className="input" required value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Metodo</label>
              <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                {["Efectivo","Tarjeta debito","Tarjeta credito","Transferencia","Nequi","Daviplata","Convenio"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {["PAGADO","PENDIENTE","ABONO","ANULADO"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Observacion</label>
              <textarea className="input min-h-[80px]" value={observation} onChange={(e) => setObservation(e.target.value)} />
            </div>
          </CardBody>
        </Card>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => router.back()}><X className="w-4 h-4" /> Cancelar</button>
          <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> Registrar</button>
        </div>
      </form>
    </>
  );
}
