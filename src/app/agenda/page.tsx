"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Filter, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AppointmentStatusBadge,
  ConfirmationBadge,
} from "@/components/ui/status-badge";
import {
  appointments,
  doctorName,
  doctors,
  entityName,
  findPatient,
} from "@/lib/mock-data";
import { formatDate, formatTime, fullName } from "@/lib/utils";

type View = "DIA" | "SEMANA" | "TODOS" | "HOY" | "SIN_CONFIRMAR";

export default function AgendaPage() {
  const [view, setView] = useState<View>("HOY");
  const [doctorFilter, setDoctorFilter] = useState<string>("");
  const [q, setQ] = useState("");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const list = useMemo(() => {
    return appointments
      .filter((a) => {
        const d = new Date(a.date);
        if (view === "HOY") {
          if (!(d >= todayStart && d < tomorrow)) return false;
        } else if (view === "SEMANA") {
          if (!(d >= todayStart && d < weekEnd)) return false;
        } else if (view === "SIN_CONFIRMAR") {
          if (a.confirmationStatus !== "PENDIENTE") return false;
        }
        if (doctorFilter && a.doctorId !== doctorFilter) return false;
        if (q) {
          const p = findPatient(a.patientId);
          const blob = `${p ? fullName(p) : ""} ${a.treatment}`.toLowerCase();
          if (!blob.includes(q.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [view, doctorFilter, q, todayStart, tomorrow, weekEnd]);

  // Vista por doctor: agrupar
  const byDoctor = useMemo(() => {
    const map = new Map<string, typeof list>();
    list.forEach((a) => {
      const arr = map.get(a.doctorId) ?? [];
      arr.push(a);
      map.set(a.doctorId, arr);
    });
    return map;
  }, [list]);

  return (
    <>
      <PageHeader
        title="Agenda"
        subtitle="Gestion de citas: crear, reagendar, cancelar, confirmar y consultar"
        actions={
          <Link href="/agenda/nueva" className="btn-primary">
            <Plus className="w-4 h-4" /> Nueva cita
          </Link>
        }
      />

      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-ink-200 bg-ink-50/40">
          <div className="flex gap-1 bg-white rounded-lg border border-ink-200 p-1">
            {(["HOY","SEMANA","TODOS","SIN_CONFIRMAR"] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs rounded-md transition ${view===v?"bg-brand-600 text-white":"text-ink-700 hover:bg-ink-100"}`}>
                {v === "HOY" ? "Hoy" : v === "SEMANA" ? "Esta semana" : v === "TODOS" ? "Todas" : "Sin confirmar"}
              </button>
            ))}
          </div>
          <select className="input max-w-[220px]" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
            <option value="">Todos los doctores</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{`Dr(a). ${d.firstName} ${d.lastName} — ${d.specialty}`}</option>)}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Buscar paciente o tratamiento..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn-secondary"><Filter className="w-4 h-4" /> Filtros</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-left text-[11px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Fecha y hora</th>
                <th className="px-5 py-3 font-medium">Paciente</th>
                <th className="px-5 py-3 font-medium">Tratamiento</th>
                <th className="px-5 py-3 font-medium">Doctor</th>
                <th className="px-5 py-3 font-medium">Entidad</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Confirmacion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {list.map((a) => {
                const p = findPatient(a.patientId);
                return (
                  <tr key={a.id} className="hover:bg-ink-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink-900">{formatTime(a.date)}</div>
                      <div className="text-xs text-ink-500">{formatDate(a.date)}</div>
                    </td>
                    <td className="px-5 py-3">
                      {p ? (
                        <Link href={`/pacientes/${p.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                          {fullName(p)}
                        </Link>
                      ) : "—"}
                      <div className="text-xs text-ink-500">{p?.cellphone ?? ""}</div>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{a.treatment}</td>
                    <td className="px-5 py-3 text-ink-700">{doctorName(a.doctorId)}</td>
                    <td className="px-5 py-3 text-ink-700">{entityName(a.entityId)}</td>
                    <td className="px-5 py-3"><AppointmentStatusBadge status={a.status} /></td>
                    <td className="px-5 py-3"><ConfirmationBadge status={a.confirmationStatus} /></td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-ink-500 text-sm">Sin citas para mostrar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agenda por doctor</CardTitle>
            <span className="text-xs text-ink-500">Distribucion segun filtro actual</span>
          </CardHeader>
          <CardBody className="space-y-4">
            {Array.from(byDoctor.entries()).map(([docId, items]) => (
              <div key={docId} className="rounded-lg border border-ink-200">
                <div className="px-4 py-2 bg-ink-50 border-b border-ink-200 text-sm font-medium text-ink-900 flex items-center justify-between">
                  <span>{doctorName(docId)}</span>
                  <span className="text-xs text-ink-500">{items.length} cita(s)</span>
                </div>
                <div className="divide-y divide-ink-200">
                  {items.map((a) => {
                    const p = findPatient(a.patientId);
                    return (
                      <div key={a.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
                        <div>
                          <div className="font-medium text-ink-900">{p ? fullName(p) : ""}</div>
                          <div className="text-xs text-ink-500">{a.treatment}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-ink-900">{formatTime(a.date)}</div>
                          <div className="text-xs text-ink-500">{formatDate(a.date)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {byDoctor.size === 0 && (
              <div className="text-center py-8 text-ink-500 text-sm">Sin citas con los filtros actuales</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen rapido</CardTitle>
            <CalendarDays className="w-4 h-4 text-ink-500" />
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3">
            <Stat label="Total visibles" value={list.length} />
            <Stat label="Hoy" value={appointments.filter((a) => { const d = new Date(a.date); return d >= todayStart && d < tomorrow; }).length} />
            <Stat label="Sin confirmar" value={appointments.filter((a) => a.confirmationStatus === "PENDIENTE").length} />
            <Stat label="Reagendar" value={appointments.filter((a) => a.status === "REAGENDAR").length} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink-200 p-3 bg-white">
      <div className="text-xs uppercase tracking-wide text-ink-500 font-medium">{label}</div>
      <div className="text-xl font-semibold text-ink-900 mt-1">{value}</div>
    </div>
  );
}
