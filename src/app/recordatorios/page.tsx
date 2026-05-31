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
import { ReminderStatusBadge } from "@/components/ui/status-badge";
import {
  appointments,
  doctorName,
  findPatient,
  reminders,
} from "@/lib/mock-data";
import { formatDateTime, fullName, humanLabel } from "@/lib/utils";

type Tab =
  | "PENDIENTES"
  | "ENVIADOS"
  | "CONFIRMADOS"
  | "NO_RESPONDE"
  | "REAGENDAR"
  | "CANCELADOS";

export default function RecordatoriosPage() {
  const [tab, setTab] = useState<Tab>("PENDIENTES");

  const filtered = useMemo(() => {
    return reminders.filter((r) => {
      switch (tab) {
        case "PENDIENTES":  return r.status === "PROGRAMADO";
        case "ENVIADOS":    return r.status === "ENVIADO";
        case "CONFIRMADOS": return r.status === "CONFIRMADO";
        case "NO_RESPONDE": return r.status === "NO_RESPONDE";
        case "REAGENDAR":   return r.status === "REAGENDAMIENTO_SOLICITADO";
        case "CANCELADOS":  return r.status === "CANCELADO";
      }
    });
  }, [tab]);

  const counts = {
    PENDIENTES:  reminders.filter((r) => r.status === "PROGRAMADO").length,
    ENVIADOS:    reminders.filter((r) => r.status === "ENVIADO").length,
    CONFIRMADOS: reminders.filter((r) => r.status === "CONFIRMADO").length,
    NO_RESPONDE: reminders.filter((r) => r.status === "NO_RESPONDE").length,
    REAGENDAR:   reminders.filter((r) => r.status === "REAGENDAMIENTO_SOLICITADO").length,
    CANCELADOS:  reminders.filter((r) => r.status === "CANCELADO").length,
  };

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "PENDIENTES",  label: "Pendientes",   icon: Clock },
    { key: "ENVIADOS",    label: "Enviados",     icon: Send },
    { key: "CONFIRMADOS", label: "Confirmados",  icon: CheckCircle2 },
    { key: "NO_RESPONDE", label: "No responde",  icon: PhoneOff },
    { key: "REAGENDAR",   label: "Reagendar",    icon: RefreshCcw },
    { key: "CANCELADOS",  label: "Cancelados",   icon: XCircle },
  ];

  return (
    <>
      <PageHeader
        title="Recordatorios"
        subtitle="Matriz de recordatorios: 3 dias antes, 1 dia antes, 2 horas antes. Las decisiones del paciente actualizan agenda y CRM."
      />

      <Card className="mb-6">
        <div className="p-4 grid md:grid-cols-3 gap-3 text-sm">
          <Note tone="info" title="Logica de envio">
            3 dias antes · 1 dia antes · 2 horas antes. Si el paciente no responde despues del tercero, queda como <strong>No responde</strong>.
          </Note>
          <Note tone="warning" title="Regla critica">
            El sistema <strong>nunca</strong> cancela automaticamente una cita por falta de respuesta. La decision es manual.
          </Note>
          <Note tone="brand" title="Respuestas del paciente">
            <em>Confirmo</em>, <em>Reagendar</em> o <em>Cancelar</em> actualizan automaticamente la cita y crean/actualizan caso CRM cuando aplica.
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
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md whitespace-nowrap transition ${tab===t.key?"bg-brand-600 text-white":"text-ink-700 hover:bg-ink-100"}`}
            >
              <Icon className="w-4 h-4" /> {t.label}
              <span className={`text-[11px] px-1.5 rounded ${tab===t.key?"bg-white/20 text-white":"bg-ink-100 text-ink-600"}`}>{c}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-left text-[11px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Paciente</th>
                <th className="px-5 py-3 font-medium">Telefono</th>
                <th className="px-5 py-3 font-medium">Cita</th>
                <th className="px-5 py-3 font-medium">Doctor</th>
                <th className="px-5 py-3 font-medium">Recordatorio</th>
                <th className="px-5 py-3 font-medium">Programado</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Respuesta</th>
                <th className="px-5 py-3 font-medium">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {filtered.map((r) => {
                const p = findPatient(r.patientId);
                const ap = appointments.find((a) => a.id === r.appointmentId);
                return (
                  <tr key={r.id} className="hover:bg-ink-50">
                    <td className="px-5 py-3">
                      {p ? (
                        <Link href={`/pacientes/${p.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                          {fullName(p)}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-700">{p?.cellphone ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="text-ink-900">{ap?.treatment ?? "—"}</div>
                      <div className="text-xs text-ink-500">{ap ? formatDateTime(ap.startIso ?? ap.date ?? "") : ""}</div>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{ap ? doctorName(ap.doctorId) : "—"}</td>
                    <td className="px-5 py-3 text-ink-700">{humanLabel(r.stage)}</td>
                    <td className="px-5 py-3 text-ink-500 text-xs">{formatDateTime(r.scheduledAt)}</td>
                    <td className="px-5 py-3"><ReminderStatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-ink-700 text-xs">{r.patientReply ?? "—"}</td>
                    <td className="px-5 py-3">
                      {r.status === "REAGENDAMIENTO_SOLICITADO" && <button className="btn-secondary text-xs">Reagendar</button>}
                      {r.status === "NO_RESPONDE" && <button className="btn-secondary text-xs">Contactar</button>}
                      {r.status === "PROGRAMADO" && <button className="btn-ghost text-xs"><Send className="w-3.5 h-3.5" /> Enviar ahora</button>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-ink-500">
                  <BellOff className="w-6 h-6 mx-auto mb-2 text-ink-400" />
                  Sin recordatorios en este estado.
                </td></tr>
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
      <div className="text-xs opacity-90">{children}</div>
    </div>
  );
}
