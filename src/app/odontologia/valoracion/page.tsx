import { PageHeader } from "@/components/ui/page-header";
import { ValoracionForm } from "@/components/clinic/valoracion-form";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Odontologia — Valoracion"
        subtitle="Valoracion clinica inicial: odontograma, estados por pieza y observaciones generales"
        breadcrumbs={[{ label: "Odontologia" }, { label: "Valoracion" }]}
      />
      <ValoracionForm specialty="Odontologia" />
    </>
  );
}
