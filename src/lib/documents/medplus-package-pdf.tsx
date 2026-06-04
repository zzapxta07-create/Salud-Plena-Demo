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
  docSub: { fontSize: 8, color: "#555", textAlign: "right", marginTop: 2 },
  alertBox: { border: "1pt solid #111", padding: "6pt 10pt", marginBottom: 10, backgroundColor: "#f9f9f9" },
  alertTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 3 },
  section: { marginTop: 10, marginBottom: 4 },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", backgroundColor: "#111", color: "#fff", padding: "3pt 6pt", marginBottom: 6 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoCell: { width: "50%", marginBottom: 4, flexDirection: "row" },
  infoLabel: { fontFamily: "Helvetica-Bold", width: "40%", color: "#444" },
  infoValue: { flex: 1 },
  table: { marginTop: 4 },
  tHead: { flexDirection: "row", backgroundColor: "#333", color: "#fff", padding: "3pt 0" },
  tRow: { flexDirection: "row", borderBottom: "0.5pt solid #ddd", padding: "3pt 0" },
  tRowAlt: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: "3pt 0" },
  tCell: { paddingHorizontal: 4 },
  noteBox: { border: "0.5pt solid #ccc", padding: "6pt 8pt", marginTop: 10, fontSize: 8, color: "#444" },
  sigBlock: { marginTop: 24, flexDirection: "row", justifyContent: "space-around" },
  sigLine: { borderTop: "0.5pt solid #333", width: 140, paddingTop: 4, textAlign: "center", fontSize: 8 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, borderTop: "0.5pt solid #aaa", paddingTop: 5, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: "#777" },
});

const MEDPLUS_CODES: Record<string, string> = {
  "Valoración inicial": "891301",
  "Examen diagnóstico": "891301",
  "Detartraje supragingival": "891401",
  "Limpieza dental": "891401",
  "Obturación": "892201",
  "Control": "891302",
  "Fluorización": "891501",
  "Extracción simple": "893101",
  "Extracción": "893101",
  "Consulta general": "891301",
};

function getCode(motive: string): string {
  for (const [k, v] of Object.entries(MEDPLUS_CODES)) {
    if (motive.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "891399";
}

export function MedplusPackagePDF({ data }: { data: ClinicalHistoryData }) {
  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.clinicName}>CLÍNICA SALUD PLENA</Text>
            <Text style={S.clinicSub}>NIT 900.123.456-7 · Bogotá D.C., Colombia</Text>
            <Text style={S.clinicSub}>Habilitado Secretaría Distrital de Salud · Código 110010001</Text>
          </View>
          <View>
            <Text style={S.docTitle}>SOLICITUD DE AUTORIZACIÓN</Text>
            <Text style={S.docSub}>MEDPLUS MEDICINA PREPAGADA</Text>
            <Text style={S.docSub}>Fecha: {docNow()}</Text>
          </View>
        </View>

        {/* Alert */}
        <View style={S.alertBox}>
          <Text style={S.alertTitle}>SOLICITUD DE SERVICIOS ODONTOLÓGICOS — AFILIADO MEDPLUS</Text>
          <Text>
            La Clínica Salud Plena solicita autorización a MedPlus Medicina Prepagada para la prestación de los servicios odontológicos descritos a continuación, conforme al contrato de prestación de servicios vigente y el plan de beneficios del afiliado.
          </Text>
        </View>

        {/* Patient info */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>I. DATOS DEL AFILIADO</Text>
          <View style={S.infoGrid}>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Nombre:</Text>
              <Text style={S.infoValue}>{docFullName(data)}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Documento:</Text>
              <Text style={S.infoValue}>{data.documentType} {data.documentNumber}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Fecha nacimiento:</Text>
              <Text style={S.infoValue}>{docFmtDate(data.birthDate)} ({docCalcAge(data.birthDate)} años)</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Entidad:</Text>
              <Text style={S.infoValue}>{data.entity?.name ?? "MedPlus"}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Celular:</Text>
              <Text style={S.infoValue}>{data.cellphone ?? data.phone ?? "—"}</Text>
            </View>
            <View style={S.infoCell}>
              <Text style={S.infoLabel}>Correo:</Text>
              <Text style={S.infoValue}>{data.email ?? "—"}</Text>
            </View>
          </View>
        </View>

        {/* Services requested */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>II. SERVICIOS SOLICITADOS</Text>
          <View style={S.table}>
            <View style={S.tHead}>
              <Text style={[S.tCell, { width: "16%" }]}>Fecha</Text>
              <Text style={[S.tCell, { flex: 1 }]}>Servicio / Procedimiento</Text>
              <Text style={[S.tCell, { width: "22%" }]}>Profesional</Text>
              <Text style={[S.tCell, { width: "16%" }]}>Cód. CUPS</Text>
            </View>
            {data.odoHistoricos.map((h, i) => (
              <View key={h.id} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                <Text style={[S.tCell, { width: "16%" }]}>{docFmtDate(h.date)}</Text>
                <Text style={[S.tCell, { flex: 1 }]}>{h.procedures ?? h.motive}</Text>
                <Text style={[S.tCell, { width: "22%" }]}>{h.doctorName}</Text>
                <Text style={[S.tCell, { width: "16%" }]}>{getCode(h.motive)}</Text>
              </View>
            ))}
            {data.odoHistoricos.length === 0 && (
              <View style={S.tRow}>
                <Text style={[S.tCell, { flex: 1, color: "#888" }]}>Sin procedimientos registrados</Text>
              </View>
            )}
          </View>
        </View>

        {/* Evolutions summary */}
        {data.odoEvoluciones.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>III. RESUMEN DE EVOLUCIONES</Text>
            <View style={S.table}>
              <View style={S.tHead}>
                <Text style={[S.tCell, { width: "18%" }]}>Fecha</Text>
                <Text style={[S.tCell, { width: "28%" }]}>Tratamiento</Text>
                <Text style={[S.tCell, { width: "24%" }]}>Profesional</Text>
                <Text style={[S.tCell, { flex: 1 }]}>Nota clínica</Text>
              </View>
              {data.odoEvoluciones.map((ev, i) => (
                <View key={ev.id} style={i % 2 === 0 ? S.tRow : S.tRowAlt}>
                  <Text style={[S.tCell, { width: "18%" }]}>{docFmtDate(ev.date)}</Text>
                  <Text style={[S.tCell, { width: "28%" }]}>{ev.treatment}</Text>
                  <Text style={[S.tCell, { width: "24%" }]}>{ev.doctorName}</Text>
                  <Text style={[S.tCell, { flex: 1 }]}>{ev.note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Legal note */}
        <View style={S.noteBox}>
          <Text>
            DECLARACIÓN: Certificamos que los servicios descritos corresponden a la condición clínica del afiliado y son necesarios para su atención odontológica. La información contenida es veraz y se emite bajo la responsabilidad del profesional tratante. Este documento es válido únicamente con sello y firma del director médico de la institución.
          </Text>
        </View>

        {/* Signature block */}
        <View style={S.sigBlock}>
          <View>
            <View style={S.sigLine}><Text>Profesional Tratante</Text></View>
            <Text style={{ textAlign: "center", fontSize: 7, marginTop: 2, color: "#555" }}>Firma y sello</Text>
          </View>
          <View>
            <View style={S.sigLine}><Text>Director Médico</Text></View>
            <Text style={{ textAlign: "center", fontSize: 7, marginTop: 2, color: "#555" }}>Firma y sello institucional</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text>Clínica Salud Plena · Solicitud de Autorización MedPlus</Text>
          <Text>Generado: {docNow()} · Uso exclusivo administrativo</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderMedplusPackagePDF(data: ClinicalHistoryData): Promise<Buffer> {
  return renderToBuffer(<MedplusPackagePDF data={data} /> as React.ReactElement<any>);
}
