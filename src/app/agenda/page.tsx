"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import {
  AppointmentStatusBadge,
  ConfirmationBadge,
} from "@/components/ui/status-badge";
import {
  formatDate,
  formatTime,
  fullName,
  getWeekStart,
  getWeekDays,
  groupAppointmentsByDay,
  getCalendarStartHour,
  getCalendarEndHour,
} from "@/lib/utils";

type FilterView = "HOY" | "SEMANA" | "TODOS" | "SIN_CONFIRMAR";
type MainView = "RESUMEN" | "CALENDARIO";

interface Doctor { id: string; firstName: string; lastName: string; specialty: string }
interface Patient { id: string; firstName: string; firstLastName: string; documentNumber: string; cellphone?: string; phone?: string }
interface Apt {
  id: string; patientId?: string; doctorId?: string; entityId?: string;
  startIso: string; endIso: string; treatment?: string; status: string;
  confirmationStatus: string; servicio?: string; name?: string; phone?: string;
  especialistaNombre?: string;
  patient?: Patient | null; doctor?: Doctor | null; entity?: { name: string } | null;
}

export default function AgendaPage() {
  const [data, setData] = useState<Apt[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainView, setMainView] = useState<MainView>("RESUMEN");
  const [filterView, setFilterView] = useState<FilterView>("HOY");
  const [doctorFilter, setDoctorFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/appointments").then((r) => r.json()),
      fetch("/api/doctors").then((r) => r.json()),
    ]).then(([apts, docs]) => {
      setData(Array.isArray(apts) ? apts : []);
      setDoctors(Array.isArray(docs) ? docs : []);
      setLoading(false);
    });
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = new Date(today);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekStart = getWeekStart(new Date(today.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000));
  const weekDays = getWeekDays(weekStart);
  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 7);

  const filtered = useMemo(() => {
    return data
      .filter((a) => {
        const d = new Date(a.startIso);
        if (filterView === "HOY") {
          if (!(d >= todayStart && d < tomorrow)) return false;
        } else if (filterView === "SEMANA") {
          if (!(d >= todayStart && d < weekEnd)) return false;
        } else if (filterView === "SIN_CONFIRMAR") {
          if (a.confirmationStatus !== "PENDIENTE") return false;
        }
        if (doctorFilter && a.doctorId !== doctorFilter) return false;
        if (q) {
          const name = a.name ?? (a.patient ? fullName(a.patient as any) : "");
          const blob = `${name} ${a.servicio ?? a.treatment ?? ""}`.toLowerCase();
          if (!blob.includes(q.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.startIso).getTime() - new Date(b.startIso).getTime());
  }, [data, filterView, doctorFilter, q, todayStart, tomorrow, weekEnd]);

  const weekAppointments = useMemo(() => {
    return data
      .filter((a) => {
        const d = new Date(a.startIso);
        return d >= weekStart && d < weekEndDate && (!doctorFilter || a.doctorId === doctorFilter);
      })
      .sort((a, b) => new Date(a.startIso).getTime() - new Date(b.startIso).getTime());
  }, [data, weekStart, weekEndDate, doctorFilter]);

  const appointmentsByDay = groupAppointmentsByDay(weekAppointments);

  const stats = useMemo(() => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const tom = new Date(t); tom.setDate(tom.getDate() + 1);
    return {
      today: data.filter((a) => { const d = new Date(a.startIso); return d >= t && d < tom; }).length,
      week: data.filter((a) => { const d = new Date(a.startIso); return d >= t && d < new Date(t.getTime() + 7 * 864e5); }).length,
      unconfirmed: data.filter((a) => a.confirmationStatus === "PENDIENTE").length,
      confirmed: data.filter((a) => a.confirmationStatus === "CONFIRMADA").length,
      cancelled: data.filter((a) => a.status === "CANCELADA").length,
      rescheduled: data.filter((a) => a.status === "REAGENDAR").length,
    };
  }, [data]);

  return (
    <>
      <PageHeader
        title="Agenda"
        subtitle="Gestión de citas: resumen operativo y calendario semanal"
        actions={
          <Link href="/agenda/nueva" className="btn-primary">
            <Plus className="w-4 h-4" /> Nueva cita
          </Link>
        }
      />

      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-ink-200 bg-ink-50/40">
          <div className="flex gap-1 bg-white rounded-lg border border-ink-200 p-1">
            {(["RESUMEN", "CALENDARIO"] as MainView[]).map((v) => (
              <button
                key={v}
                onClick={() => setMainView(v)}
                className={`px-3 py-1.5 text-xs rounded-md transition ${mainView === v ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100"}`}
              >
                {v === "RESUMEN" ? "Resumen" : "Calendario"}
              </button>
            ))}
          </div>

          {mainView === "RESUMEN" && (
            <div className="flex gap-1 bg-white rounded-lg border border-ink-200 p-1">
              {(["HOY", "SEMANA", "TODOS", "SIN_CONFIRMAR"] as FilterView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setFilterView(v)}
                  className={`px-3 py-1.5 text-xs rounded-md transition ${filterView === v ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100"}`}
                >
                  {v === "HOY" ? "Hoy" : v === "SEMANA" ? "Esta semana" : v === "TODOS" ? "Todas" : "Sin confirmar"}
                </button>
              ))}
            </div>
          )}

          <select className="input max-w-[220px]" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
            <option value="">Todos los doctores</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{`Dr(a). ${d.firstName} ${d.lastName} — ${d.specialty}`}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Buscar paciente o tratamiento..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-ink-500">Cargando...</div>
        ) : mainView === "RESUMEN" ? (
          <ViewResumen filtered={filtered} stats={stats} />
        ) : (
          <ViewCalendario
            weekStart={weekStart}
            weekDays={weekDays}
            appointmentsByDay={appointmentsByDay}
            weekAppointments={weekAppointments}
            weekOffset={weekOffset}
            onWeekChange={setWeekOffset}
          />
        )}
      </Card>
    </>
  );
}

function ViewResumen({ filtered, stats }: { filtered: Apt[]; stats: { today: number; week: number; unconfirmed: number; confirmed: number; cancelled: number; rescheduled: number } }) {
  return (
    <div className="p-5 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Hoy" value={stats.today} />
        <Stat label="Esta semana" value={stats.week} />
        <Stat label="Confirmadas" value={stats.confirmed} />
        <Stat label="Sin confirmar" value={stats.unconfirmed} />
        <Stat label="Canceladas" value={stats.cancelled} />
        <Stat label="Reagendar" value={stats.rescheduled} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink-900 mb-3">Próximas citas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-[11px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-2 font-medium">Fecha y hora</th>
                <th className="px-4 py-2 font-medium">Paciente</th>
                <th className="px-4 py-2 font-medium">Tratamiento</th>
                <th className="px-4 py-2 font-medium">Doctor</th>
                <th className="px-4 py-2 font-medium">Entidad</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Confirmacion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {filtered.map((a) => {
                const displayName = a.name ?? (a.patient ? fullName(a.patient as any) : "—");
                const displayPhone = a.phone ?? a.patient?.cellphone ?? a.patient?.phone ?? "";
                const displayServicio = a.servicio ?? a.treatment ?? "—";
                const displayDoctor = a.especialistaNombre ?? (a.doctor ? `Dr(a). ${a.doctor.firstName} ${a.doctor.lastName}` : "—");
                return (
                  <tr key={a.id} className="hover:bg-ink-50">
                    <td className="px-4 py-2">
                      <div className="font-medium text-ink-900">{formatTime(a.startIso)}</div>
                      <div className="text-xs text-ink-500">{formatDate(a.startIso)}</div>
                    </td>
                    <td className="px-4 py-2">
                      {a.patient ? (
                        <Link href={`/pacientes/${a.patient.id}`} className="font-medium text-ink-900 hover:text-brand-700">{displayName}</Link>
                      ) : (
                        <span className="font-medium text-ink-900">{displayName}</span>
                      )}
                      <div className="text-xs text-ink-500">{displayPhone}</div>
                    </td>
                    <td className="px-4 py-2 text-ink-700">{displayServicio}</td>
                    <td className="px-4 py-2 text-ink-700">{displayDoctor}</td>
                    <td className="px-4 py-2 text-ink-700">{a.entity?.name ?? "—"}</td>
                    <td className="px-4 py-2"><AppointmentStatusBadge status={a.status as any} /></td>
                    <td className="px-4 py-2"><ConfirmationBadge status={a.confirmationStatus as any} /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-ink-500 text-sm">Sin citas para mostrar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const TIME_GUTTER_WIDTH = 72;
const HOUR_HEIGHT = 72;
const calendarGridColumns = `${TIME_GUTTER_WIDTH}px repeat(7, minmax(140px, 1fr))`;

function ViewCalendario({ weekStart, weekDays, appointmentsByDay, weekAppointments, weekOffset, onWeekChange }: {
  weekStart: Date; weekDays: Date[]; appointmentsByDay: Map<string, any[]>;
  weekAppointments: Apt[]; weekOffset: number; onWeekChange: (o: number) => void;
}) {
  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const calStartHour = getCalendarStartHour(weekAppointments, 8);
  const calEndHour = getCalendarEndHour(weekAppointments, 18);
  const hours = Array.from({ length: calEndHour - calStartHour }, (_, i) => calStartHour + i);
  const totalHeight = (calEndHour - calStartHour) * HOUR_HEIGHT;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => onWeekChange(weekOffset - 1)} className="btn-secondary text-sm">
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <div className="text-sm font-medium text-ink-900">
          {formatDate(weekStart)} - {formatDate(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
        </div>
        <button onClick={() => onWeekChange(weekOffset + 1)} className="btn-secondary text-sm">
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="border border-ink-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <div className="grid border-b border-ink-200 bg-ink-50" style={{ gridTemplateColumns: calendarGridColumns }}>
            <div className="border-r border-ink-200" style={{ width: TIME_GUTTER_WIDTH }} />
            {weekDays.map((day, i) => (
              <div key={i} className="border-r border-ink-200 last:border-r-0 p-3 text-center">
                <div className="text-xs font-semibold text-ink-900">{dayNames[i]}</div>
                <div className="text-sm text-ink-500">{formatDate(day)}</div>
              </div>
            ))}
          </div>

          <div className="grid" style={{ gridTemplateColumns: calendarGridColumns }}>
            <div className="relative border-r border-ink-200 bg-ink-50" style={{ height: totalHeight }}>
              {hours.map((h) => (
                <div key={h} style={{ top: (h - calStartHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }} className="absolute w-full border-b border-ink-200 flex items-start justify-end pr-2 pt-1">
                  <span className="text-[11px] font-medium text-ink-400">{String(h).padStart(2, "0")}:00</span>
                </div>
              ))}
            </div>

            {weekDays.map((day, i) => {
              const dayKey = day.toISOString().split("T")[0];
              const dayAppts = (appointmentsByDay.get(dayKey) ?? []).filter((a: Apt) => {
                const h = new Date(a.startIso).getHours();
                return h >= calStartHour && h < calEndHour;
              });
              return (
                <div key={i} className="relative border-r border-ink-200 last:border-r-0" style={{ height: totalHeight }}>
                  {hours.map((h) => (
                    <div key={h} style={{ top: (h - calStartHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }} className="absolute w-full border-b border-ink-100" />
                  ))}
                  {dayAppts.map((a: Apt) => {
                    const start = new Date(a.startIso);
                    const end = new Date(a.endIso);
                    const startMin = (start.getHours() - calStartHour) * 60 + start.getMinutes();
                    const durationH = (end.getTime() - start.getTime()) / 3600000;
                    const top = (startMin / 60) * HOUR_HEIGHT;
                    const height = Math.max(durationH * HOUR_HEIGHT, 24);
                    const displayName = a.name ?? (a.patient ? fullName(a.patient as any) : "—");
                    const displayServicio = a.servicio ?? a.treatment ?? "—";
                    return (
                      <div key={a.id} style={{ position: "absolute", top, height, left: 2, right: 2 }} className="bg-brand-50 border border-brand-200 rounded p-1 overflow-hidden text-xs hover:shadow-md hover:z-10 transition cursor-pointer">
                        <div className="font-medium text-brand-900 truncate leading-tight">{displayName}</div>
                        <div className="text-brand-700 truncate">{displayServicio}</div>
                        <div className="text-brand-600 text-[10px]">{formatTime(a.startIso)} - {formatTime(a.endIso)}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink-200 p-3 bg-white text-center">
      <div className="text-xs uppercase tracking-wide text-ink-500 font-medium">{label}</div>
      <div className="text-2xl font-semibold text-ink-900 mt-1">{value}</div>
    </div>
  );
}
