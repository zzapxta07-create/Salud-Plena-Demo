"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/components/ui/status-badge";
import { formatCOP, formatDate, fullName, humanLabel } from "@/lib/utils";

interface Patient { id: string; firstName: string; firstLastName: string; documentNumber: string }
interface Payment {
  id: string; patientId: string; concept: string; amount: number; method: string;
  paidAt?: string | null; status: string; observation?: string | null;
  patient?: Patient | null;
}

export default function PagosPage() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return data.filter((p) => {
      const name = p.patient ? fullName(p.patient as any) : "";
      const blob = `${name} ${p.concept}`.toLowerCase();
      const matchQ = !q || blob.includes(q.toLowerCase());
      const matchStatus = !status || p.status === status;
      return matchQ && matchStatus;
    });
  }, [data, q, status]);

  const totalPagado = data.filter((p) => p.status === "PAGADO").reduce((s, p) => s + p.amount, 0);
  const totalPendiente = data.filter((p) => p.status === "PENDIENTE").reduce((s, p) => s + p.amount, 0);
  const totalAbono = data.filter((p) => p.status === "ABONO").reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <PageHeader
        title="Pagos"
        subtitle="Registro simple de pagos por paciente"
        actions={
          <Link href="/pagos/nuevo" className="btn-primary"><Plus className="w-4 h-4" /> Registrar pago</Link>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card><CardBody><div className="text-xs uppercase tracking-wide text-ink-500 font-medium">Total recaudado</div><div className="text-xl font-semibold text-ink-900 mt-1">{formatCOP(totalPagado)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs uppercase tracking-wide text-ink-500 font-medium">Abonos</div><div className="text-xl font-semibold text-ink-900 mt-1">{formatCOP(totalAbono)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs uppercase tracking-wide text-ink-500 font-medium">Pendientes</div><div className="text-xl font-semibold text-ink-900 mt-1">{formatCOP(totalPendiente)}</div></CardBody></Card>
      </div>

      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-ink-200 bg-ink-50/40">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Buscar paciente o concepto..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {["PAGADO", "PENDIENTE", "ABONO", "ANULADO"].map((s) => (
              <option key={s} value={s}>{humanLabel(s)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-ink-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white text-left text-[11px] uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Paciente</th>
                  <th className="px-5 py-3 font-medium">Concepto</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Metodo</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Observacion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50">
                    <td className="px-5 py-3">
                      {p.patient ? (
                        <Link href={`/pacientes/${p.patient.id}`} className="font-medium text-ink-900 hover:text-brand-700">{fullName(p.patient as any)}</Link>
                      ) : "—"}
                      <div className="text-xs text-ink-500">CC {p.patient?.documentNumber}</div>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{p.concept}</td>
                    <td className="px-5 py-3 font-semibold text-ink-900">{formatCOP(p.amount)}</td>
                    <td className="px-5 py-3 text-ink-700">{p.method}</td>
                    <td className="px-5 py-3 text-ink-500 text-xs">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                    <td className="px-5 py-3"><PaymentStatusBadge status={p.status as any} /></td>
                    <td className="px-5 py-3 text-ink-500 text-xs">{p.observation ?? "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={7} className="text-center py-8 text-ink-500 text-sm">Sin pagos registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
