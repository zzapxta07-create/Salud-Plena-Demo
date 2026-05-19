import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PatientForm } from "../_components/patient-form";

export default function NuevoPacientePage() {
  return (
    <>
      <PageHeader
        title="Crear paciente"
        subtitle="Registra un nuevo paciente. Si el documento ya existe, se cargara el registro existente."
        breadcrumbs={[{ label: "Pacientes", href: "/pacientes" }, { label: "Nuevo" }]}
        actions={
          <Link href="/pacientes" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <PatientForm mode="create" />
    </>
  );
}
