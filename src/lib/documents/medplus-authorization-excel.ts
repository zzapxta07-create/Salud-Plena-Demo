import ExcelJS from "exceljs";
import { docFmtDate, docFullName, docCalcAge, docNow } from "./document-utils";
import type { ClinicalHistoryData } from "./clinical-history-data";

const MEDPLUS_CODES: Record<string, string> = {
  "valoración inicial": "891301",
  "examen diagnóstico": "891301",
  "detartraje": "891401",
  "limpieza dental": "891401",
  "obturación": "892201",
  "control": "891302",
  "fluorización": "891501",
  "extracción simple": "893101",
  "extracción": "893101",
  "consulta general": "891301",
};

function getCode(motive: string): string {
  const lower = motive.toLowerCase();
  for (const [k, v] of Object.entries(MEDPLUS_CODES)) {
    if (lower.includes(k)) return v;
  }
  return "891399";
}

export async function buildMedplusAuthorizationExcel(data: ClinicalHistoryData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Clínica Salud Plena";
  wb.created = new Date();

  const ws = wb.addWorksheet("Autorización MedPlus", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true },
  });

  // Columnas
  ws.columns = [
    { key: "fecha", width: 14 },
    { key: "servicio", width: 36 },
    { key: "profesional", width: 24 },
    { key: "cups", width: 12 },
    { key: "obs", width: 36 },
    { key: "estado", width: 14 },
  ];

  // Fila de título
  ws.mergeCells("A1:F1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "CLÍNICA SALUD PLENA — AUTORIZACIÓN DE SERVICIOS MEDPLUS";
  titleCell.font = { bold: true, size: 13 };
  titleCell.alignment = { horizontal: "center" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111111" } };
  titleCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).height = 22;

  // Fila de metadatos del paciente
  ws.mergeCells("A2:F2");
  ws.getCell("A2").value = `Afiliado: ${docFullName(data)}  ·  ${data.documentType} ${data.documentNumber}  ·  ${docCalcAge(data.birthDate)} años  ·  ${data.entity?.name ?? "MedPlus"}  ·  Fecha generación: ${docNow()}`;
  ws.getCell("A2").font = { size: 9, color: { argb: "FF444444" } };
  ws.getCell("A2").alignment = { horizontal: "left" };
  ws.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
  ws.getRow(2).height = 16;

  // Fila vacía
  ws.getRow(3).height = 6;

  // Encabezados de tabla
  const headerRow = ws.getRow(4);
  const headers = ["Fecha", "Servicio / Procedimiento", "Profesional", "Cód. CUPS", "Observación", "Estado"];
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF333333" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" }, left: { style: "thin" },
      bottom: { style: "thin" }, right: { style: "thin" },
    };
  });
  headerRow.height = 18;

  // Filas de datos
  data.odoHistoricos.forEach((h, i) => {
    const row = ws.getRow(5 + i);
    row.getCell(1).value = docFmtDate(h.date);
    row.getCell(2).value = h.procedures ?? h.motive;
    row.getCell(3).value = h.doctorName;
    row.getCell(4).value = getCode(h.motive);
    row.getCell(5).value = h.observation ?? "—";
    row.getCell(6).value = "AUTORIZADO";
    row.getCell(6).font = { color: { argb: "FF006600" }, bold: true };

    const fill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: i % 2 === 0 ? "FFFFFFFF" : "FFF5F5F5" },
    };
    for (let c = 1; c <= 6; c++) {
      row.getCell(c).fill = fill;
      row.getCell(c).border = {
        top: { style: "hair" }, left: { style: "hair" },
        bottom: { style: "hair" }, right: { style: "hair" },
      };
      row.getCell(c).alignment = { wrapText: true, vertical: "top" };
    }
    row.height = 20;
  });

  if (data.odoHistoricos.length === 0) {
    const row = ws.getRow(5);
    ws.mergeCells(`A5:F5`);
    row.getCell(1).value = "Sin procedimientos registrados";
    row.getCell(1).font = { italic: true, color: { argb: "FF888888" } };
    row.getCell(1).alignment = { horizontal: "center" };
  }

  // Fila de totales
  const totalRow = ws.getRow(5 + data.odoHistoricos.length + 1);
  ws.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
  totalRow.getCell(1).value = `Total de procedimientos: ${data.odoHistoricos.length}`;
  totalRow.getCell(1).font = { bold: true };
  totalRow.height = 16;

  // Sección de firma
  const sigStartRow = 5 + data.odoHistoricos.length + 3;
  ws.getCell(`A${sigStartRow}`).value = "Firma y sello del Director Médico:";
  ws.getCell(`A${sigStartRow}`).font = { bold: true };
  ws.getCell(`D${sigStartRow}`).value = "Firma del Profesional Tratante:";
  ws.getCell(`D${sigStartRow}`).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
