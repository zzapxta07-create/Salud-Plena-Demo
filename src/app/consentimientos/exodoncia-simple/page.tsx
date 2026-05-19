import { PageHeader } from "@/components/ui/page-header";
import { ConsentForm } from "@/components/clinic/consent-form";
import { CONSENT_CONFIGS } from "@/components/clinic/consent-configs";

export default function Page() {
  const cfg = CONSENT_CONFIGS["exodoncia-simple"];
  return (
    <>
      <PageHeader
        title={`Consentimiento — ${cfg.label}`}
        subtitle={cfg.description}
        breadcrumbs={[{ label: "Consentimientos", href: "/consentimientos" }, { label: cfg.label }]}
      />
      <ConsentForm consentType={cfg.label} description={cfg.description} consentText={cfg.text} />
    </>
  );
}
