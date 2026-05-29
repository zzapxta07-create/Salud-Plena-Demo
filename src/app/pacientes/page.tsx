"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PatientStatusBadge } from "@/components/ui/status-badge";
import { calcAge, formatDate, fullName, humanLabel } from "@/lib/utils";
import { useSelectedPatient } from "@/lib/patient-context";

interface Patient {
  id: string;
  documentNumber: string;
  documentType: string;
  firstName: string;
  middleName?: string;
  firstLastName: string;
  secondLastName?: string;
  gender: string;
  birthDate: string;
  patientType: "PARTICULAR" | "ASEGURADORA" | "ARL" | "CONVENIO";
  email?: string;
  cellphone?: string;
  status: "NUEVO" | "ACTIVO" | "EN_AUTORIZACION" | "PENDIENTE_DOCUMENTOS" | "AGENDADO" | "EN_TRATAMIENTO" | "FINALIZADO" | "INACTIVO";
  updatedAt: string;
  entityName?: string;
}

export default function PacientesPage() {
  const { selectedPatientId, setSelectedPatientId } = useSelectedPatient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/patients');
        const data = await res.json();
        setPatients(data);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchQ =
        !q.trim() ||
        p.documentNumber.includes(q) ||
        fullName(p).toLowerCase().includes(q.toLowerCase()) ||
        (p.email ?? "").toLowerCase().includes(q.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchType = !typeFilter || p.patientType === typeFilter;
      return matchQ && matchStatus && matchType;
    });
  }, [q, statusFilter, typeFilter, patients]);

  return (
    <>
      <PageHeader
        title="Pacientes"
        subtitle="Registro maestro: agenda, pagos, archivos, recordatorios, CRM, odontologia, ortodoncia y consentimientos se conectan aqui"
        actions={
          <Link href="/pacientes/nuevo" className="btn-primary">
            <Plus className="w-4 h-4" /> Crear paciente
          </Link>
        }
      />

      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-ink-200 bg-ink-50/40">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="input pl-9"
              placeholder="Buscar por documento, nombre o correo..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input max-w-[200px]"
          >
            <option value="">Todos los estados</option>
            {["NUEVO","ACTIVO","EN_AUTORIZACION","PENDIENTE_DOCUMENTOS","AGENDADO","EN_TRATAMIENTO","FINALIZADO","INACTIVO"].map((s) => (
              <option key={s} value={s}>{humanLabel(s)}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input max-w-[180px]"
          >
            <option value="">Todos los tipos</option>
            {["PARTICULAR","ASEGURADORA","ARL","CONVENIO"].map((t) => (
              <option key={t} value={t}>{humanLabel(t)}</option>
            ))}
          </select>
          <button className="btn-secondary"><Filter className="w-4 h-4" /> Mas filtros</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wide text-ink-500 bg-white">
              <tr>
                <th className="px-5 py-3 font-medium">Paciente</th>
                <th className="px-5 py-3 font-medium">Documento</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Entidad</th>
                <th className="px-5 py-3 font-medium">Contacto</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Ultima actualizacion</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-medium">
                        {p.firstName[0]}{p.firstLastName[0]}
                      </div>
                      <div>
                        <button onClick={() => setSelectedPatientId(p.id)} className="font-medium text-ink-900 hover:text-brand-700 cursor-pointer">
                          <Link href={`/pacientes/${p.id}`}>{fullName(p)}</Link>
                        </button>
                        <div className="text-xs text-ink-500">{calcAge(p.birthDate)} años · {p.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-700">
                    {p.documentType} {p.documentNumber}
                  </td>
                  <td className="px-5 py-3 text-ink-700">{humanLabel(p.patientType)}</td>
                  <td className="px-5 py-3 text-ink-700">{p.entityName ?? "—"}</td>
                  <td className="px-5 py-3">
                    <div className="text-ink-900">{p.cellphone ?? "—"}</div>
                    <div className="text-xs text-ink-500">{p.email ?? "—"}</div>
                  </td>
                  <td className="px-5 py-3"><PatientStatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-ink-500 text-xs">{formatDate(p.updatedAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/pacientes/${p.id}`} onClick={() => setSelectedPatientId(p.id)} className="btn-ghost text-xs">Abrir perfil</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-ink-500 text-sm">
                    Sin pacientes que coincidan con los filtros.
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
