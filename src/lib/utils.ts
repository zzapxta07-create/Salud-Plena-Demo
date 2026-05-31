import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcAge(birthDate: string | Date): number {
  const d = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(
  date: string | Date,
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "2-digit" },
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CO", opts).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function humanLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function fullName(p: { firstName: string; middleName?: string; firstLastName: string; secondLastName?: string }): string {
  return [p.firstName, p.middleName, p.firstLastName, p.secondLastName].filter(Boolean).join(" ");
}

// ===================== HELPERS DE CALENDARIO =====================

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes = 1
  return new Date(d.setDate(diff));
}

export function getWeekDays(date: Date): Date[] {
  const start = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function getEndTime(startDate: Date | string, durationMinutes: number): Date {
  const d = typeof startDate === "string" ? new Date(startDate) : new Date(startDate);
  return new Date(d.getTime() + durationMinutes * 60000);
}

export function calculateBlockPosition(date: Date | string): { top: string; height: string } {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  const hour = d.getHours();
  const min = d.getMinutes();
  const topPercent = ((hour * 60 + min) / 1440) * 100;
  return { top: `${topPercent}%`, height: "auto" };
}

export function formatTimeRange(startDate: Date | string, durationMinutes: number): string {
  const start = typeof startDate === "string" ? new Date(startDate) : new Date(startDate);
  const end = getEndTime(start, durationMinutes);
  return `${formatTime(start)} - ${formatTime(end)}`;
}

type AptDateLike = { startIso?: string | Date; date?: string | Date; endIso?: string | Date; durationMinutes?: number; [key: string]: any };

function apptStart(a: AptDateLike): Date {
  return new Date((a.startIso ?? a.date) as string);
}

export function groupAppointmentsByDay(
  appointments: AptDateLike[],
): Map<string, AptDateLike[]> {
  const map = new Map<string, AptDateLike[]>();
  appointments.forEach((a) => {
    const d = apptStart(a);
    const key = d.toISOString().split("T")[0];
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr.sort((x, y) => apptStart(x).getTime() - apptStart(y).getTime()));
  });
  return map;
}

export function getCalendarStartHour(
  appointments: AptDateLike[],
  defaultHour = 8,
): number {
  if (!appointments.length) return defaultHour;
  const minHour = Math.min(...appointments.map((a) => apptStart(a).getHours()));
  return Math.min(minHour, defaultHour);
}

export function getCalendarEndHour(
  appointments: AptDateLike[],
  defaultHour = 18,
): number {
  if (!appointments.length) return defaultHour;
  const maxEnd = Math.max(
    ...appointments.map((a) => {
      if (a.endIso) {
        const d = new Date(a.endIso as string);
        return Math.ceil((d.getHours() * 60 + d.getMinutes()) / 60);
      }
      const d = apptStart(a);
      const endMin = d.getHours() * 60 + d.getMinutes() + (a.durationMinutes ?? 30);
      return Math.ceil(endMin / 60);
    }),
  );
  return Math.max(maxEnd, defaultHour);
}
