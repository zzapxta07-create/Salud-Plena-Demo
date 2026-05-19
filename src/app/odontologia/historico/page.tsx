import { PageHeader } from "@/components/ui/page-header";
import { HistoricoView } from "@/components/clinic/historico-view";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Odontologia — Historico"
        subtitle="Consulta eventos clinicos y administrativos anteriores del paciente"
        breadcrumbs={[{ label: "Odontologia" }, { label: "Historico" }]}
      />
      <HistoricoView specialty="Odontologia" />
    </>
  );
}
