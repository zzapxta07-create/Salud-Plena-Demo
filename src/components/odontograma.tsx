"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export const TOOTH_STATES = [
  { code: "OB_AMA", label: "Obturado en amalgama", color: "#475569" },
  { code: "OB_RES", label: "Obturado en resina", color: "#0ea5e9" },
  { code: "EXO_R",  label: "Exodoncia realizada", color: "#dc2626" },
  { code: "EXO_QI", label: "Exodoncia quirurgica indicada", color: "#f97316" },
  { code: "DX_END", label: "Diagnostico endodontico", color: "#a855f7" },
  { code: "SEL_PR", label: "Sellante presente", color: "#10b981" },
  { code: "SEL_IN", label: "Sellante indicado", color: "#84cc16" },
  { code: "EROS",   label: "Erosion o abrasion", color: "#eab308" },
  { code: "SANO",   label: "Diente sano", color: "#22c55e" },
  { code: "PROV_B", label: "Provisional buen estado", color: "#06b6d4" },
  { code: "PROV_M", label: "Provisional mal estado", color: "#0891b2" },
  { code: "NUC_B",  label: "Nucleo buen estado", color: "#8b5cf6" },
  { code: "NUC_M",  label: "Nucleo mal estado", color: "#6d28d9" },
  { code: "INC",    label: "Diente incluido", color: "#64748b" },
  { code: "MOT",    label: "Diente moteado", color: "#fbbf24" },
  { code: "CAR_C",  label: "Caries del cemento", color: "#b45309" },
  { code: "FRAC",   label: "Fractura", color: "#991b1b" },
  { code: "DX_PER", label: "Diagnostico periodontal", color: "#7c3aed" },
  { code: "RES_R",  label: "Resto radicular", color: "#78716c" },
] as const;

export type ToothCode = (typeof TOOTH_STATES)[number]["code"];

const PERMANENT_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const PERMANENT_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const TEMPORAL_UPPER  = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const TEMPORAL_LOWER  = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

export type TeethStates = Record<number, ToothCode | undefined>;

export function Odontograma({
  initial = {},
  readOnly = false,
  onChange,
}: {
  initial?: TeethStates;
  readOnly?: boolean;
  onChange?: (states: TeethStates) => void;
}) {
  const [selectedState, setSelectedState] = useState<ToothCode>("SANO");
  const [states, setStates] = useState<TeethStates>(initial);

  const apply = (tooth: number) => {
    if (readOnly) return;
    const next = { ...states, [tooth]: selectedState };
    setStates(next);
    onChange?.(next);
  };

  return (
    <div className="space-y-5">
      {!readOnly && (
        <div>
          <div className="text-xs uppercase tracking-wide text-ink-500 font-medium mb-2">
            Estados odontologicos
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 max-h-56 overflow-y-auto p-2 bg-ink-50 rounded-lg border border-ink-200">
            {TOOTH_STATES.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => setSelectedState(s.code)}
                className={cn(
                  "flex items-center gap-2 text-left text-xs px-2 py-1.5 rounded-md border transition",
                  selectedState === s.code
                    ? "bg-white border-brand-500 ring-2 ring-brand-200 text-ink-900"
                    : "bg-white border-ink-200 text-ink-700 hover:border-ink-300",
                )}
              >
                <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="text-xs text-ink-500 mt-2">
            Selecciona un estado y luego haz clic en la pieza dental para aplicarlo.
          </div>
        </div>
      )}

      <Section title="Denticion permanente">
        <ToothRow teeth={PERMANENT_UPPER} states={states} onSelect={apply} />
        <ToothRow teeth={PERMANENT_LOWER} states={states} onSelect={apply} />
      </Section>

      <Section title="Denticion temporal">
        <ToothRow teeth={TEMPORAL_UPPER} states={states} onSelect={apply} />
        <ToothRow teeth={TEMPORAL_LOWER} states={states} onSelect={apply} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-ink-500 font-medium mb-2">{title}</div>
      <div className="space-y-2 p-4 bg-white border border-ink-200 rounded-lg overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

function ToothRow({
  teeth,
  states,
  onSelect,
}: {
  teeth: number[];
  states: TeethStates;
  onSelect: (n: number) => void;
}) {
  return (
    <div className="flex justify-center gap-1.5 min-w-fit">
      {teeth.map((t) => {
        const code = states[t];
        const stateDef = code ? TOOTH_STATES.find((s) => s.code === code) : null;
        return (
          <button
            key={t}
            type="button"
            title={stateDef ? stateDef.label : `Pieza ${t}`}
            onClick={() => onSelect(t)}
            className="flex flex-col items-center group"
          >
            <div className="text-[9px] text-ink-400 mb-0.5">{t}</div>
            <div
              className={cn(
                "w-7 h-9 rounded-md border-2 transition flex items-center justify-center text-[10px] font-medium",
                stateDef
                  ? "border-ink-300 text-white"
                  : "border-ink-200 bg-white text-ink-400 group-hover:border-brand-400",
              )}
              style={stateDef ? { background: stateDef.color } : undefined}
            >
              {stateDef ? stateDef.code.split("_")[0].slice(0, 2) : ""}
            </div>
          </button>
        );
      })}
    </div>
  );
}
