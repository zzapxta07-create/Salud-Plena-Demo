"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BellOff,
  CheckCircle2,
  Clock,
  MessageCircle,
  PhoneOff,
  RefreshCcw,
  Send,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { reminders } from "@/lib/mock-data";
import { formatDateTime, formatTime } from "@/lib/utils";
import type { ReminderEstado, ReminderTipo } from "@/lib/types";

type Tab = ReminderEstado;

const TIPO_LABELS: Record<ReminderTipo, string> = {
  DIA_ANTES:  "Un día antes",
  TRES_HORAS: "Tres horas antes",
};

const ESTADO_CLASSES: Record<ReminderEstado, string> = {
  PENDIENTE:   "bg-amber-100 text-amber-800",
  ENVIADO:     "bg-blue-100 text-blue-800",
  CONFIRMADO:  "bg-emerald-100 text-emerald-800",
  NO_RESPONDE: "bg-red-100 text-red-800",
  REAGENDAR:   "bg-violet-100 text-violet-800",
  CANCELADO:   "bg-ink-100 text-ink-600",
};

export default function RecordatoriosPage() {
  const [tab, setTab] = useState<Tab>("PENDIENTE");

  const filtered = useMemo(
    () => reminders.filter((r) => r.estadoRecordatorio === tab),
    [tab],
  );

  const counts: Record<Tab, number> = {
    PENDIENTE:   reminders.filter((r) => r.estadoRecordatorio === "PENDIENTE").length,
    ENVIADO:     reminders.filter((r) => r.estadoRecordatorio === "ENVIADO").length,
    CONFIRMADO:  reminders.filter((r) => r.estadoRecordatorio === "CONFIRMADO").length,
    NO_RESPONDE: reminders.filter((r) => r.estadoRecordatorio === "NO_RESPONDE").length,
    REAGENDAR:   reminders.filter((r) => r.estadoRecordatorio === "REAGENDAR").length,
    CANCELADO:   reminders.filter((r) => r.estadoRecordatorio === "CANCELADO").length,
  };

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "PENDIENTE",   label: "Pendientes",  icon: Clock },
    { key: "ENVIADO",     label: "Enviados",    icon: Send },
    { key: "CONFIRMADO",  label: "Confirmados", icon: CheckCircle2 },
    { key: "NO_RESPONDE", label: "No responde", icon: PhoneOff },
    { key: "REAGENDAR",   label: "Reagendar",   icon: RefreshCcw },
    { key: "CANCELADO",   label: "Cancelados",  icon: XCircle },
  ];

  return (
    <>
      <PageHeader
        title="Recordatorios"
        subtitle="Espejo operativo de citas para WhatsApp/n8n. 2 recordatorios por cita: 1 día antes y 3 horas antes."
      />

      <Card className="mb-6">
        <div className="p-4 grid md:grid-cols-3 gap-3 text-sm">
          <Note tone="info" title="Flujo de envio">
            <strong>1 día antes:</strong> n8n consulta <code>n8n_reminders_day_before_due</code> y envía WhatsApp.<br />
            <strong>3 horas antes:</strong> n8n consulta <code>n8n_reminders_three_hours_due</code> y envía segundo recordatorio.
          </Note>
          <Note tone="warning" title="Regla critica">
            El sistema <strong>nunca</strong> cancela automáticamente una cita por falta de respuesta. La decisión es manual o via n8n.
          </Note>
          <Note tone="brand" title="Respuestas del paciente">
            <em>Confirmar</em>, <em>Reagendar</em> o <em>Cancelar</em> actualizan <code>reminders.estado_recordatorio</code> y sincronizan con <code>appointments.estado_cita</code>.
          </Note>
        </div>
      </Card>

      <div className="flex gap-1 mb-4 bg-white border border-ink-200 rounded-lg p-1 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const c = counts[t.key];
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md whitespace-nowrap transition ${tab === t.key ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100"}`}
            >
              <Icon className="w-4 h-4" /> {t.label}
              <span className={`text-[11px] px-1.5 rounded ${tab === t.key ? "bg-white/20 text-white" : "bg-ink-100 text-ink-600"}`}>{c}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-left text-[11px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Paciente / nombre</th>
                <th className="px-5 py-3 font-medium">Telefono</th>
                <th className="px-5 py-3 font-medium">Cita / servicio</th>
                <th className="px-5 py-3 font-medium">Especialista</th>
                <th className="px-5 py-3 font-medium">Recordatorio</th>
                <th className="px-5 py-3 font-medium">Inicio cita</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Respuesta</th>
                <th className="px-5 py-3 font-medium">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50">
                  {/* Paciente */}
                  <td className="px-5 py-3">
                    {r.patientId ? (
                      <Link href={`/pacientes/${r.patientId}`} className="font-medium text-ink-900 hover:text-brand-700">
                        {r.name ?? "—"}
                      </Link>
                    ) : (
                      <span className="font-medium text-ink-900">{r.name ?? "—"}</span>
                    )}
                  </td>
                  {/* Teléfono */}
                  <td className="px-5 py-3 text-ink-700">{r.phone ?? "—"}</td>
                  {/* Cita */}
                  <td className="px-5 py-3">
                    <div className="text-ink-900">{r.servicio ?? "—"}</div>
                    <div className="text-xs text-ink-500">{formatDateTime(r.startIso)}</div>
                  </td>
                  {/* Doctor */}
                  <td className="px-5 py-3 text-ink-700 text-xs">{r.especialistaNombre ?? "—"}</td>
                  {/* Tipo de recordatorio */}
                  <td className="px-5 py-3 text-ink-700 text-xs">
                    {r.ultimoRecordatorioTipo ? TIPO_LABELS[r.ultimoRecordatorioTipo] : "—"}
                  </td>
                  {/* Hora de inicio */}
                  <td className="px-5 py-3 text-ink-700 text-xs">
                    <div>{formatTime(r.startIso)}</div>
                    <div className="text-ink-400">{r.diaTexto}</div>
                  </td>
                  {/* Estado */}
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${ESTADO_CLASSES[r.estadoRecordatorio]}`}>
                      {r.estadoRecordatorio}
                    </span>
                  </td>
                  {/* Respuesta */}
                  <td className="px-5 py-3 text-ink-700 text-xs max-w-[180px]">
                    <span className="line-clamp-2">{r.responseText ?? "—"}</span>
                  </td>
                  {/* Acción */}
                  <td className="px-5 py-3">
                    {r.estadoRecordatorio === "REAGENDAR" && (
                      <button className="btn-secondary text-xs">Reagendar</button>
                    )}
                    {r.estadoRecordatorio === "NO_RESPONDE" && (
                      <button className="btn-secondary text-xs">Contactar</button>
                    )}
                    {r.estadoRecordatorio === "PENDIENTE" && (
                      <button className="btn-ghost text-xs flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" /> Enviar ya
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-ink-500">
                    <BellOff className="w-6 h-6 mx-auto mb-2 text-ink-400" />
                    Sin recordatorios en este estado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function Note({ tone, title, children }: { tone: "info" | "warning" | "brand"; title: string; children: React.ReactNode }) {
  const toneMap = {
    info:    "bg-sky-50 border-sky-200 text-sky-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    brand:   "bg-brand-50 border-brand-200 text-brand-900",
  };
  return (
    <div className={`rounded-lg border p-3 ${toneMap[tone]}`}>
      <div className="flex items-center gap-2 font-medium mb-1">
        <MessageCircle className="w-4 h-4" /> {title}
      </div>
      <div className="text-xs opacity-90 leading-relaxed">{children}</div>
    </div>
  );
}
