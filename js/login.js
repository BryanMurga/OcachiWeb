// js/login.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// --- Elementos del DOM ---
const dateInput = document.getElementById("dateRange");
const loginForm = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginFeedback = document.getElementById("loginFeedback");
const loginBtn = document.getElementById("loginBtn");

const collectionSelect = document.getElementById("collectionSelect");
const downloadBtn = document.getElementById("downloadBtn");
const downloadFeedback = document.getElementById("downloadFeedback");
const rangeInfo = document.getElementById("rangeInfo");

// --- Estado ---
let isAuthenticated = false;
let currentUser = null;
let selectedRange = null;
let selectedCollection = "";

// --- Inicializar flatpickr ---
flatpickr.localize(flatpickr.l10ns.es);
flatpickr(dateInput, {
  mode: "range",
  dateFormat: "Y-m-d",
  maxDate: "today",
  onClose: (selectedDates) => {
    if (selectedDates.length === 2) {
      selectedRange = [selectedDates[0], selectedDates[1]];
      rangeInfo.innerHTML = `<div class="small">Rango seleccionado: <strong>${selectedRange[0].toLocaleDateString()}</strong> — <strong>${selectedRange[1].toLocaleDateString()}</strong></div>`;
    } else {
      selectedRange = null;
      rangeInfo.innerHTML = `<div class="small text-danger">Selecciona un rango (inicio y fin).</div>`;
    }
    refreshDownloadState();
  },
});

// --- Escuchar cambios en el selector de colección ---
collectionSelect.addEventListener("change", () => {
  selectedCollection = collectionSelect.value;
  refreshDownloadState();
});

// --- Validación simple ---
function validateLoginFields() {
  let valid = true;
  if (!emailEl.value.trim()) valid = false;
  if (!passwordEl.value.trim()) valid = false;
  return valid;
}

// --- Actualiza el estado del botón de descarga ---
function refreshDownloadState() {
  if (
    isAuthenticated &&
    selectedRange &&
    selectedRange.length === 2 &&
    selectedCollection
  ) {
    downloadBtn.disabled = false;
    downloadFeedback.innerHTML =
      '<span class="small text-success">Listo para descargar.</span>';
  } else {
    downloadBtn.disabled = true;
    if (!isAuthenticated)
      downloadFeedback.innerHTML =
        '<span class="small text-warning">Debes iniciar sesión.</span>';
    else if (!selectedRange)
      downloadFeedback.innerHTML =
        '<span class="small text-muted">Selecciona un rango de fechas.</span>';
    else if (!selectedCollection)
      downloadFeedback.innerHTML =
        '<span class="small text-muted">Selecciona una colección.</span>';
  }
}

// --- Manejo del login ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginFeedback.textContent = "";

  if (!validateLoginFields()) {
    loginFeedback.innerHTML =
      '<span class="text-danger small">Completa todos los campos.</span>';
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Verificando...";

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      emailEl.value.trim(),
      passwordEl.value.trim()
    );
    currentUser = userCredential.user;
    isAuthenticated = true;

    loginFeedback.innerHTML = `<span class="text-success small">Autenticado como ${currentUser.email}</span>`;
  } catch (err) {
    console.error("Error login:", err);
    isAuthenticated = false;
    currentUser = null;
    loginFeedback.innerHTML =
      '<span class="text-danger small">Usuario o contraseña incorrectos.</span>';
  }

  loginBtn.disabled = false;
  loginBtn.textContent = "Iniciar sesión";
  refreshDownloadState();
});

// --- Manejo del botón de descarga ---
downloadBtn.addEventListener("click", () => {
  if (!isAuthenticated || !selectedRange || !selectedCollection) return;

  downloadBtn.disabled = true;
  downloadBtn.textContent = "Generando archivo...";

  // Enviar evento al export.js con la colección elegida
  const eventDetail = {
    user: currentUser,
    start: selectedRange[0].toISOString(),
    end: selectedRange[1].toISOString(),
    collection: selectedCollection,
  };

  // Mostrar confirmación visual
  alert(
    `Descargando datos de la colección "${selectedCollection}" desde ${selectedRange[0].toLocaleDateString()} hasta ${selectedRange[1].toLocaleDateString()}.`
  );

  window.dispatchEvent(
    new CustomEvent("request-export", { detail: eventDetail })
  );

  // Restaurar botón
  downloadBtn.textContent = "Descargar datos (.csv)";
  downloadBtn.disabled = false;
});

// --- Exponer helpers globales ---
window._exportUI = {
  getSelectedRange: () => selectedRange,
  isAuthenticated: () => isAuthenticated,
  setAuthenticated: (userObj) => {
    isAuthenticated = true;
    currentUser = userObj;
    refreshDownloadState();
  },
  setLoggedOut: () => {
    isAuthenticated = false;
    currentUser = null;
    refreshDownloadState();
  },
};

// Inicializar estado visual
refreshDownloadState();
