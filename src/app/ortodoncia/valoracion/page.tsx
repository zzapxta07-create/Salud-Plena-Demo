import { PageHeader } from "@/components/ui/page-header";
import { ValoracionForm } from "@/components/clinic/valoracion-form";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Ortodoncia — Valoracion"
        subtitle="Valoracion ortodontica inicial con odontograma y observaciones"
        breadcrumbs={[{ label: "Ortodoncia" }, { label: "Valoracion" }]}
      />
      <ValoracionForm specialty="Ortodoncia" />
    </>
  );
}
