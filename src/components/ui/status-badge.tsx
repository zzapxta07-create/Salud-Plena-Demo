import { Badge } from "./badge";
import { humanLabel } from "@/lib/utils";
import type {
  AppointmentStatus,
  ConfirmationStatus,
  CrmStatus,
  PatientStatus,
  PaymentStatus,
  ReminderStatus,
  WaConversationStatus,
} from "@/lib/types";

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  const map: Record<PatientStatus, Parameters<typeof Badge>[0]["tone"]> = {
    NUEVO: "info",
    ACTIVO: "success",
    EN_AUTORIZACION: "warning",
    PENDIENTE_DOCUMENTOS: "warning",
    AGENDADO: "brand",
    EN_TRATAMIENTO: "violet",
    FINALIZADO: "neutral",
    INACTIVO: "neutral",
  };
  return <Badge tone={map[status]}>{humanLabel(status)}</Badge>;
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, Parameters<typeof Badge>[0]["tone"]> = {
    AGENDADA: "brand",
    CANCELADA: "danger",
    FINALIZADA: "neutral",
    PENDIENTE: "warning",
    CONFIRMADA: "success",
    SIN_RESPUESTA: "warning",
    REAGENDAR: "info",
    NO_ASISTIO: "danger",
  };
  return <Badge tone={map[status]}>{humanLabel(status)}</Badge>;
}

export function ConfirmationBadge({ status }: { status: ConfirmationStatus }) {
  const map: Record<ConfirmationStatus, Parameters<typeof Badge>[0]["tone"]> = {
    PENDIENTE: "warning",
    CONFIRMADA: "success",
    REAGENDAMIENTO_SOLICITADO: "info",
    CANCELADA: "danger",
    NO_RESPONDE: "danger",
  };
  return <Badge tone={map[status]}>{humanLabel(status)}</Badge>;
}

export function CrmStatusBadge({ status }: { status: CrmStatus }) {
  const map: Record<CrmStatus, Parameters<typeof Badge>[0]["tone"]> = {
    NUEVO: "info",
    DATOS_INCOMPLETOS: "warning",
    DOCUMENTOS_PENDIENTES: "warning",
    PENDIENTE_REVISION_HUMANA: "warning",
    EN_PREPARACION_DOCUMENTAL: "violet",
    RADICADO_SOLICITADO: "info",
    RADICADO_RECIBIDO: "info",
    LISTO_PARA_AGENDAR: "brand",
    AGENDADO: "brand",
    CONFIRMADO: "success",
    FINALIZADO: "neutral",
    PERDIDO: "danger",
  };
  return <Badge tone={map[status]}>{humanLabel(status)}</Badge>;
}

export function ReminderStatusBadge({ status }: { status: ReminderStatus }) {
  const map: Record<ReminderStatus, Parameters<typeof Badge>[0]["tone"]> = {
    PROGRAMADO: "info",
    ENVIADO: "brand",
    CONFIRMADO: "success",
    REAGENDAMIENTO_SOLICITADO: "warning",
    CANCELADO: "danger",
    NO_RESPONDE: "danger",
  };
  return <Badge tone={map[status]}>{humanLabel(status)}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, Parameters<typeof Badge>[0]["tone"]> = {
    PENDIENTE: "warning",
    PAGADO: "success",
    ABONO: "info",
    ANULADO: "danger",
  };
  return <Badge tone={map[status]}>{humanLabel(status)}</Badge>;
}

export function WaStatusBadge({ status }: { status: WaConversationStatus }) {
  const map: Record<WaConversationStatus, Parameters<typeof Badge>[0]["tone"]> = {
    NUEVA: "info",
    ATENCION_IA: "violet",
    REQUIERE_HUMANO: "warning",
    GESTION_HUMANA: "brand",
    FINALIZADA: "neutral",
    PENDIENTE_DOCUMENTO: "warning",
    PENDIENTE_DATOS: "warning",
    PENDIENTE_VALIDACION: "warning",
  };
  return <Badge tone={map[status]}>{humanLabel(status)}</Badge>;
}
