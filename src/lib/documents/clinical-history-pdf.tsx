/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { docCalcAge, docFmtDate, docFullName, docNow } from "./document-utils";
import type { ClinicalHistoryData } from "./clinical-history-data";

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#111",
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2pt solid #111", paddingBottom: 8, marginBottom: 12 },
  clinicName: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  clinicSub: { fontSize: 8, color: "#555", marginTop: 2 },
  docTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", textAlign: "right" },
  docDate: { fontSize: 8, color: "#555", textAlign: "right", marginTop: 2 },
  section: { marginTop: 12, marginBottom: 4 },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", backgroundColor: "#111", color: "#fff", padding: "3pt 6pt", marginBottom: 6 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoCell: { width: "50%", marginBottom: 4, flexDirection: "row" },
  infoLabel: { fontFamily: "Helvetica-Bold", width: "38%", color: "#444" },
  infoValue: { flex: 1 },
  table: { marginTop: 4 },
  tHead: { flexDirection: "row", backgroundColor: "#333", color: "#fff", padding: "3pt 0" },
  tRow: { flexDirection: "row", borderBottom: "0.5pt solid #ddd", padding: "3pt 0" },
  tRowAlt: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: "3pt 0" },
  tCell: { paddingHorizontal: 4 },
  evolBox: { border: "0.5pt solid #ccc", padding: "5pt 8pt", marginBottom: 4 },
  evolHeader: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  payload: { marginBottom: 3, flexDirection: "row" },
  payloadLabel: { fontFamily: "Helvetica-Bold", width: "30%", color: "#444" },
  payloadValue: { flex: 1 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, borderTop: "0.5pt solid #aaa", paddingTop: 5, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: "#777" },
  sigBlock: { marginTop: 24, flexDirection: "row", justifyContent: "space-around" },
  sigLine: { borderTop: "0.5pt solid #333", width: 140, paddingTop: 4, textAlign: "center", fontSize: 8 },
});

function renderPayload(payload: any) {
  if (!payload || typeof payload !== "object") return null;
  const entries: React.ReactElement[] = [];
  const map: Record<string, string> = {
    motivoConsulta: "Motivo de consulta",
    diagnostico: "Diagnóstico",
    planTratamiento: "Plan de tratamiento",
  };
  for (const [k, label] of Object.entries(map)) {
    if (payload[k]) {
      entries.push(
        <View key={k} style={S.payload}>
          <Text style={S.payloadLabel}>{label}:</Text>
          <Text style={S.payloadValue}>{String(payload[k])}</Text>
        </View>
      );
    }
  }
  if (payload.antecedentes && typeof payload.antecedentes === "object") {
    const ant = payload.antecedentes as Record<string, string>;
    for (const [k, v] of Object.entries(ant)) {
      if (v) {
        entries.push(
          <View key={`ant-${k}`} style={S.payload}>
            <Text style={S.payloadLabel}>{k}:</Text>
            <Text style={S.payloadValue}>{v}</Text>
          </View>
        );
      }
    }
  }
  if (payload.examenClinico && typeof payload.examenClinico === "object") {
    const ex = payload.examenClinico as Record<string, string>;
    for (const [k, v] of Object.entries(ex)) {
      if (v) {
        entries.push(
          <View key={`ex-${k}`} style={S.payload}>
            <Text style={S.payloadLabel}>{k}:</Text>
            <Text style={S.payloadValue}>{v}</Text>
          </View>
        );
      }
    }
  }
  return entries;
}

export function ClinicalHistoryPDF({ data }: { data: ClinicalHistoryData }) {
  const historia = data.odoHistoria[0];
  const payload = historia?.payload as any;

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.clinicName}>CLÍNICA SALUD PLENA</Text>
            <Text style={S.clinicSub}>NIT 900.123.456-7 · Bogotá D.C., Colombia</Text>
            <Text style={S.clinicSub}>Tel: (601) 555-0100 · contacto@saludplena.com.co</Text>
          </View>
          <View>
            <Text style={S.docTitle}>HISTORIA CLÍNICA ODONTOLÓGICA</Text>
            <Text style={S.docDate}>Fecha de impresión: {docNow()}</Text>
          </View>
        </View>

        {/* Patient info */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>I. DATOS DEL PACIENTE</Text>
          <View style={S.infoGrid}>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Nombre completo:</Text>
              <Text style={S.infoValue}>{docFullName(data)}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Documento:</Text>
              <Text style={S.infoValue}>{data.documentType} {data.documentNumber}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Fecha de nacimiento:</Text>
              <Text style={S.infoValue}>{docFmtDate(data.birthDate)} ({docCalcAge(data.birthDate)} años)</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Sexo:</Text>
              <Text style={S.infoValue}>{data.gender}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Entidad:</Text>
              <Text style={S.infoValue}>{data.entity?.name ?? "Particular"}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Celular:</Text>
              <Text style={S.infoValue}>{data.cellphone ?? data.phone ?? "—"}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Dirección:</Text>
              <Text style={S.infoValue}>{[data.address, data.city].filter(Boolean).join(", ") || "—"}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Correo:</Text>
              <Text style={S.infoValue}>{data.email ?? "—"}</Text>
            </View>
          </View>
        </View>

        {/* Clinical history payload */}
        {historia && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>II. ANTECEDENTES Y DIAGNÓSTICO</Text>
            {renderPayload(payload)}
            {(!payload || Object.keys(payload).length === 0) && (
              <Text style={{ color: "#888", fontStyle: "italic" }}>Sin registro de historia clínica completada.</Text>
            )}
          </View>
        )}

        {/* Visit history */}
        {data.odoHistoricos.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>III. HISTORIAL DE VISITAS</Text>
            <View style={S.table}>
              <View style={S.tHead}>
                <Text style={[S.tCell, { width: "18%" }]}>Fecha</Text>
                <Text style={[S.tCell, { width: "30%" }]}>Motivo</Text>
                <Text style={[S.tCell, { width: "22%" }]}>Profesional</Text>
                <Text style={[S.tCell, { flex: 1 }]}>Procedimientos</Text>
              </View>
              {data.odoHistoricos.map((h, i) => (
                <View key={h.id} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                  <Text style={[S.tCell, { width: "18%" }]}>{docFmtDate(h.date)}</Text>
                  <Text style={[S.tCell, { width: "30%" }]}>{h.motive}</Text>
                  <Text style={[S.tCell, { width: "22%" }]}>{h.doctorName}</Text>
                  <Text style={[S.tCell, { flex: 1 }]}>{h.procedures ?? h.observation ?? "—"}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Evolutions */}
        {data.odoEvoluciones.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>IV. NOTAS DE EVOLUCIÓN</Text>
            {data.odoEvoluciones.slice(0, 6).map((ev) => (
              <View key={ev.id} style={S.evolBox}>
                <Text style={S.evolHeader}>{docFmtDate(ev.date)} — {ev.treatment} · {ev.doctorName}</Text>
                <Text>{ev.note}</Text>
                <Text style={{ marginTop: 3, color: "#555", fontSize: 8 }}>
                  Firma profesional: {ev.signedByDoc ? "✓" : "Pendiente"} · Firma paciente: {ev.signedByPat ? "✓" : "Pendiente"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Signature block */}
        <View style={S.sigBlock}>
          <View>
            <View style={S.sigLine}><Text>Firma del Profesional</Text></View>
          </View>
          <View>
            <View style={S.sigLine}><Text>Firma del Paciente / Acudiente</Text></View>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text>Clínica Salud Plena · Historia Clínica Odontológica</Text>
          <Text>Documento generado el {docNow()} · Confidencial</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderClinicalHistoryPDF(data: ClinicalHistoryData): Promise<Buffer> {
  return renderToBuffer(<ClinicalHistoryPDF data={data} /> as React.ReactElement<any>);
}
