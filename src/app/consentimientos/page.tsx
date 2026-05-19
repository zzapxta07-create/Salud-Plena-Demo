"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { consents, doctorName, findPatient } from "@/lib/mock-data";
import { formatDate, fullName, humanLabel } from "@/lib/utils";

const TYPES = [
  { slug: "anestesia-local", label: "Anestesia local" },
  { slug: "odontologia-restauradora", label: "Odontologia restauradora" },
  { slug: "endodoncia", label: "Endodoncia" },
  { slug: "exodoncia-simple", label: "Exodoncia simple" },
  { slug: "periodoncia", label: "Periodoncia" },
  { slug: "promocion-prevencion", label: "Promocion y prevencion" },
  { slug: "implantologicos", label: "Procedimientos implantologicos" },
  { slug: "covid-19", label: "COVID-19" },
];

export default function ConsentimientosPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    return consents.filter((c) => {
      const p = findPatient(c.patientId);
      const blob = `${p ? fullName(p) : ""} ${humanLabel(c.type)} ${c.consultation ?? ""}`.toLowerCase();
      return !q || blob.includes(q.toLowerCase());
    });
  }, [q]);

  return (
    <>
      <PageHeader
        title="Consentimientos"
        subtitle="Genera, consulta, guarda e imprime consentimientos informados por paciente"
      />

      <Card className="mb-6">
        <div className="p-4">
          <div className="text-xs uppercase tracking-wide text-ink-500 font-medium mb-3">Crear nuevo consentimiento</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {TYPES.map((t) => (
              <Link key={t.slug} href={`/consentimientos/${t.slug}`} className="flex items-center gap-2 p-3 rounded-lg border border-ink-200 hover:border-brand-300 hover:bg-brand-50/40 transition">
                <div className="w-8 h-8 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                <div className="text-sm text-ink-900 font-medium">{t.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-ink-200 bg-ink-50/40">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Buscar por paciente, tipo o consulta..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-left text-[11px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Paciente</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Consulta</th>
                <th className="px-5 py-3 font-medium">Entidad</th>
                <th className="px-5 py-3 font-medium">Doctor</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {filtered.map((c) => {
                const p = findPatient(c.patientId);
                return (
                  <tr key={c.id} className="hover:bg-ink-50">
                    <td className="px-5 py-3">
                      {p ? <Link href={`/pacientes/${p.id}`} className="font-medium text-ink-900 hover:text-brand-700">{fullName(p)}</Link> : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-700">{humanLabel(c.type)}</td>
                    <td className="px-5 py-3 text-ink-700">{c.consultation ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-700">{c.entityName ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-700">{doctorName(c.doctorId)}</td>
                    <td className="px-5 py-3 text-ink-500 text-xs">{formatDate(c.signedAt)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-ink-500">Sin consentimientos registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
