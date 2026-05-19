import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { findPatient } from "@/lib/mock-data";
import { fullName } from "@/lib/utils";
import { PatientForm } from "../../_components/patient-form";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = findPatient(id);
  if (!p) notFound();

  return (
    <>
      <PageHeader
        title={`Editar paciente`}
        subtitle={fullName(p)}
        breadcrumbs={[
          { label: "Pacientes", href: "/pacientes" },
          { label: fullName(p), href: `/pacientes/${id}` },
          { label: "Editar" },
        ]}
        actions={
          <Link href={`/pacientes/${id}`} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <PatientForm mode="edit" initial={p} />
    </>
  );
}
