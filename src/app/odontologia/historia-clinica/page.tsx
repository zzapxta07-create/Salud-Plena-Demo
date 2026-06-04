import { PageHeader } from "@/components/ui/page-header";
import { HistoriaClinicaForm } from "@/components/clinic/historia-clinica-form";
import { ClinicalHistoryDownloadButton } from "@/components/patients/clinical-history-download-button";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Odontologia — Historia clinica"
        subtitle="Registro completo de antecedentes, examenes y diagnosticos"
        breadcrumbs={[{ label: "Odontologia" }, { label: "Historia clinica" }]}
        actions={<ClinicalHistoryDownloadButton />}
      />
      <HistoriaClinicaForm specialty="Odontologia" />
    </>
  );
}
