// js/export.js
import { db, auth } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// --- Helper: convierte snapshot docs a CSV ---
function rowsToCSV(rows, headers) {
  const escape = (v) => {
    if (v === undefined || v === null) return "";
    v = String(v);
    v = v.replace(/"/g, '""');
    return `"${v}"`;
  };
  const csvHeader = headers.join(",");
  const csvRows = rows.map((row) =>
    headers.map((h) => escape(row[h])).join(",")
  );
  return [csvHeader, ...csvRows].join("\r\n");
}

// --- Obtener headers únicos de los datos ---
function getHeadersFromRows(rows) {
  const set = new Set();
  rows.forEach((r) => Object.keys(r).forEach((k) => set.add(k)));
  return Array.from(set);
}

// --- Normalizar Timestamps a string ISO ---
function normalizeValue(v) {
  if (v && typeof v.toDate === "function") return v.toDate().toISOString();
  return v;
}

// --- Escuchar evento de exportación ---
window.addEventListener("request-export", async (e) => {
  const detail = e.detail;
  if (!detail || !detail.start || !detail.end) {
    console.error("request-export: faltan fechas");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("No estás autenticado. Inicia sesión para descargar.");
    return;
  }

  // Fechas del rango
  const startDate = new Date(detail.start);
  const endDate = new Date(detail.end);
  endDate.setHours(23, 59, 59, 999);

  const startTs = Timestamp.fromDate(startDate);
  const endTs = Timestamp.fromDate(endDate);

  try {
    const colRef = collection(db, "registros");
    const q = query(
      colRef,
      where("creadoEn", ">=", startTs),
      where("creadoEn", "<=", endTs),
      orderBy("creadoEn", "asc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("No se encontraron registros en ese rango.");
      return;
    }

    const rows = [];
    snap.forEach((doc) => {
      const data = doc.data();
      data.__id = doc.id;

      // Normalizar timestamps
      Object.keys(data).forEach((k) => {
        data[k] = normalizeValue(data[k]);
      });

      rows.push(data);
    });

    // Campos esperados
    const preferred = [
      "__id",
      "nombre",
      "correo",
      "telefono",
      "programa",
      "creadoEn",
    ];
    const headers = getHeadersFromRows(rows);
    const finalHeaders = [
      ...preferred.filter((h) => headers.includes(h)),
      ...headers.filter((h) => !preferred.includes(h)),
    ];

    const csv = rowsToCSV(rows, finalHeaders);

    // Descargar CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    a.href = url;
    a.download = `registros_${startStr}_a_${endStr}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    alert(`Exportados ${rows.length} registros. Archivo descargado.`);
  } catch (err) {
    console.error("Error exportando registros:", err);
    alert("Ocurrió un error al exportar. Revisa la consola.");
  }
});
