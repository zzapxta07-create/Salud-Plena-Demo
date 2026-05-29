"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PatientContextSelector } from "@/components/patient-context-selector";
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronDown,
  CreditCard,
  FileSignature,
  FolderOpen,
  Kanban,
  MessageSquareText,
  Smile,
  Stethoscope,
  UserRound,
} from "lucide-react";

type NavLeaf = { type: "leaf"; label: string; href: string; icon?: React.ComponentType<{ className?: string }> };
type NavGroup = { type: "group"; label: string; icon: React.ComponentType<{ className?: string }>; basePath: string; children: { label: string; href: string }[] };
type NavItem = NavLeaf | NavGroup;

const NAV: NavItem[] = [
  { type: "leaf", label: "Inicio", href: "/", icon: Activity },
  { type: "leaf", label: "Paciente", href: "/pacientes", icon: UserRound },
  {
    type: "group",
    label: "Odontologia",
    icon: Smile,
    basePath: "/odontologia",
    children: [
      { label: "Valoracion", href: "/odontologia/valoracion" },
      { label: "Historia clinica", href: "/odontologia/historia-clinica" },
      { label: "Evolucion", href: "/odontologia/evolucion" },
      { label: "Historico", href: "/odontologia/historico" },
      { label: "Odontograma", href: "/odontologia/odontograma" },
    ],
  },
  {
    type: "group",
    label: "Ortodoncia",
    icon: Stethoscope,
    basePath: "/ortodoncia",
    children: [
      { label: "Valoracion", href: "/ortodoncia/valoracion" },
      { label: "Historia clinica", href: "/ortodoncia/historia-clinica" },
      { label: "Evolucion", href: "/ortodoncia/evolucion" },
      { label: "Historico", href: "/ortodoncia/historico" },
      { label: "Odontograma", href: "/ortodoncia/odontograma" },
    ],
  },
  {
    type: "group",
    label: "Consentimientos",
    icon: FileSignature,
    basePath: "/consentimientos",
    children: [
      { label: "Consultar consentimientos", href: "/consentimientos" },
      { label: "Anestesia local", href: "/consentimientos/anestesia-local" },
      { label: "Odontologia restauradora", href: "/consentimientos/odontologia-restauradora" },
      { label: "Endodoncia", href: "/consentimientos/endodoncia" },
      { label: "Exodoncia simple", href: "/consentimientos/exodoncia-simple" },
      { label: "Periodoncia", href: "/consentimientos/periodoncia" },
      { label: "Actividades de promocion y prevencion", href: "/consentimientos/promocion-prevencion" },
      { label: "Procedimientos implantologicos", href: "/consentimientos/implantologicos" },
      { label: "COVID-19", href: "/consentimientos/covid-19" },
    ],
  },
  { type: "leaf", label: "Agenda", href: "/agenda", icon: CalendarDays },
  { type: "leaf", label: "Pagos", href: "/pagos", icon: CreditCard },
  { type: "leaf", label: "Adjuntar archivo", href: "/archivos", icon: FolderOpen },
  { type: "leaf", label: "Recordatorios", href: "/recordatorios", icon: Bell },
  { type: "leaf", label: "WhatsApp", href: "/whatsapp", icon: MessageSquareText },
  { type: "leaf", label: "CRM", href: "/crm", icon: Kanban },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV.forEach((n) => {
      if (n.type === "group" && pathname.startsWith(n.basePath)) init[n.label] = true;
    });
    return init;
  });

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-ink-200 bg-white">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-ink-200">
        <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
          SP
        </div>
        <div>
          <div className="text-sm font-semibold text-ink-900 leading-tight">Salud Plena</div>
          <div className="text-[11px] text-ink-500">Plataforma clinica</div>
        </div>
      </div>
      <div className="px-3 py-3 border-b border-ink-200">
        <div className="text-[11px] uppercase tracking-wide text-ink-500 font-medium mb-2">Paciente activo</div>
        <PatientContextSelector />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          if (item.type === "leaf") {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                  active
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-ink-700 hover:bg-ink-50",
                )}
              >
                {Icon ? <Icon className="w-4 h-4" /> : null}
                {item.label}
              </Link>
            );
          }
          const Icon = item.icon;
          const isOpen = open[item.label] ?? false;
          const baseActive = pathname.startsWith(item.basePath);
          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => setOpen((s) => ({ ...s, [item.label]: !s[item.label] }))}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                  baseActive
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-ink-700 hover:bg-ink-50",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown className={cn("w-4 h-4 transition", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="mt-1 ml-7 space-y-0.5 border-l border-ink-200 pl-3">
                  {item.children.map((c) => {
                    const active = pathname === c.href;
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={cn(
                          "block px-2.5 py-1.5 rounded-md text-[13px] transition",
                          active
                            ? "bg-brand-50 text-brand-700 font-medium"
                            : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                        )}
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-ink-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-900 truncate">Administrador</div>
            <div className="text-[11px] text-ink-500 truncate">Conectado</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
