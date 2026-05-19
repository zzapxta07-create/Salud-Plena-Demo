import { PageHeader } from "@/components/ui/page-header";
import { HistoricoView } from "@/components/clinic/historico-view";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Ortodoncia — Historico"
        subtitle="Eventos clinicos y administrativos de ortodoncia"
        breadcrumbs={[{ label: "Ortodoncia" }, { label: "Historico" }]}
      />
      <HistoricoView specialty="Ortodoncia" />
    </>
  );
}
