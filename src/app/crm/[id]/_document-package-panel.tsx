"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, PackageOpen } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { documentPacks, entities } from "@/lib/mock-data";
import type { Entity } from "@/lib/types";

export function DocumentPackagePanel({ entity: initialEntity }: { entity: Entity | null }) {
  const [entityId, setEntityId] = useState<string>(initialEntity?.id ?? "");
  const docs = documentPacks.filter((d) => d.entityId === entityId);

  const hasPackage = docs.length > 0;

  function handleDownload() {
    alert("Demo: descarga simulada del paquete documental por entidad. En produccion se generan los archivos reales.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paquete documental por entidad</CardTitle>
        <PackageOpen className="w-4 h-4 text-ink-500" />
      </CardHeader>
      <CardBody className="space-y-4">
        <div>
          <label className="label">Entidad</label>
          <select className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)}>
            <option value="">— Selecciona entidad —</option>
            {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <p className="text-xs text-ink-500 mt-1.5">
            Solo MedPlus y Sura tienen paquetes documentales preparados en la demo.
          </p>
        </div>

        {entityId && hasPackage && (
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-500 font-medium mb-2">
              Checklist de documentos
            </div>
            <div className="space-y-1.5">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg border border-ink-200 bg-ink-50/50">
                  <div className="flex items-center gap-2.5">
                    {d.format === "PDF" ? (
                      <div className="w-8 h-8 rounded-md bg-red-50 text-red-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-ink-900">{d.label}</div>
                      <div className="text-[11px] text-ink-500">{d.format}</div>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-ink-300" />
                </div>
              ))}
            </div>
            <button onClick={handleDownload} className="btn-primary w-full mt-4">
              <Download className="w-4 h-4" /> Descargar paquete por entidad
            </button>
          </div>
        )}

        {entityId && !hasPackage && (
          <div className="rounded-lg border border-dashed border-ink-300 p-4 text-sm text-ink-500 text-center">
            Esta entidad no tiene paquete documental configurado en la demo.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
