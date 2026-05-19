"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { CrmStatusBadge } from "@/components/ui/status-badge";
import { crmCases, entityName, findPatient } from "@/lib/mock-data";
import { formatDate, fullName, humanLabel } from "@/lib/utils";
import type { CrmStatus } from "@/lib/types";

const COLUMNS: { key: CrmStatus; label: string }[] = [
  { key: "NUEVO", label: "Nuevo" },
  { key: "DATOS_INCOMPLETOS", label: "Datos incompletos" },
  { key: "DOCUMENTOS_PENDIENTES", label: "Documentos pendientes" },
  { key: "PENDIENTE_REVISION_HUMANA", label: "Pendiente revision" },
  { key: "EN_PREPARACION_DOCUMENTAL", label: "En preparacion documental" },
  { key: "RADICADO_SOLICITADO", label: "Radicado solicitado" },
  { key: "RADICADO_RECIBIDO", label: "Radicado recibido" },
  { key: "LISTO_PARA_AGENDAR", label: "Listo para agendar" },
  { key: "AGENDADO", label: "Agendado" },
  { key: "CONFIRMADO", label: "Confirmado" },
  { key: "FINALIZADO", label: "Finalizado" },
  { key: "PERDIDO", label: "Perdido" },
];

export default function CrmPage() {
  const [view, setView] = useState<"KANBAN" | "TABLA">("KANBAN");
  const grouped = useMemo(() => {
    const map = new Map<CrmStatus, typeof crmCases>();
    COLUMNS.forEach((c) => map.set(c.key, []));
    crmCases.forEach((c) => {
      const arr = map.get(c.status) ?? [];
      arr.push(c);
      map.set(c.status, arr);
    });
    return map;
  }, []);

  return (
    <>
      <PageHeader
        title="CRM operativo"
        subtitle="Gestion de casos: autorizaciones, cotizaciones, documentos pendientes y agendamiento"
        actions={
          <>
            <div className="flex gap-1 bg-white rounded-lg border border-ink-200 p-1">
              <button onClick={() => setView("KANBAN")} className={`px-3 py-1.5 text-xs rounded-md transition flex items-center gap-1.5 ${view==="KANBAN"?"bg-brand-600 text-white":"text-ink-700 hover:bg-ink-100"}`}>
                <LayoutGrid className="w-3.5 h-3.5" /> Kanban
              </button>
              <button onClick={() => setView("TABLA")} className={`px-3 py-1.5 text-xs rounded-md transition flex items-center gap-1.5 ${view==="TABLA"?"bg-brand-600 text-white":"text-ink-700 hover:bg-ink-100"}`}>
                <List className="w-3.5 h-3.5" /> Tabla
              </button>
            </div>
            <Link href="/crm/nuevo" className="btn-primary">
              <Plus className="w-4 h-4" /> Nuevo caso
            </Link>
          </>
        }
      />

      {view === "KANBAN" ? (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-fit pb-2">
            {COLUMNS.map((col) => {
              const items = grouped.get(col.key) ?? [];
              return (
                <div key={col.key} className="w-72 shrink-0">
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">{col.label}</div>
                    <div className="text-xs text-ink-500 bg-ink-100 px-1.5 rounded">{items.length}</div>
                  </div>
                  <div className="space-y-2">
                    {items.map((c) => {
                      const p = findPatient(c.patientId);
                      return (
                        <Link
                          key={c.id}
                          href={`/crm/${c.id}`}
                          className="block bg-white rounded-lg border border-ink-200 p-3 hover:shadow-card hover:border-brand-300 transition"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium text-ink-900 truncate">{p ? fullName(p) : "—"}</div>
                            <span className="text-[10px] text-ink-500 shrink-0">{formatDate(c.lastInteraction)}</span>
                          </div>
                          <div className="text-xs text-ink-500 mt-0.5">{humanLabel(c.type)}</div>
                          {c.entityId && <div className="text-xs text-ink-700 mt-2">{entityName(c.entityId)}</div>}
                          {c.nextAction && <div className="text-[11px] text-ink-600 mt-2 line-clamp-2 bg-ink-50 rounded p-1.5">{c.nextAction}</div>}
                        </Link>
                      );
                    })}
                    {items.length === 0 && (
                      <div className="text-xs text-ink-400 text-center py-6 border border-dashed border-ink-200 rounded-lg">Vacio</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white text-left text-[11px] uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Paciente</th>
                  <th className="px-5 py-3 font-medium">Entidad</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Proxima accion</th>
                  <th className="px-5 py-3 font-medium">Responsable</th>
                  <th className="px-5 py-3 font-medium">Ultima interaccion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {crmCases.map((c) => {
                  const p = findPatient(c.patientId);
                  return (
                    <tr key={c.id} className="hover:bg-ink-50">
                      <td className="px-5 py-3">
                        <Link href={`/crm/${c.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                          {p ? fullName(p) : "—"}
                        </Link>
                        <div className="text-xs text-ink-500">CC {p?.documentNumber}</div>
                      </td>
                      <td className="px-5 py-3 text-ink-700">{entityName(c.entityId)}</td>
                      <td className="px-5 py-3 text-ink-700">{humanLabel(c.type)}</td>
                      <td className="px-5 py-3"><CrmStatusBadge status={c.status} /></td>
                      <td className="px-5 py-3 text-ink-700">{c.nextAction ?? "—"}</td>
                      <td className="px-5 py-3 text-ink-700">{c.responsible ?? "—"}</td>
                      <td className="px-5 py-3 text-ink-500 text-xs">{formatDate(c.lastInteraction)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
