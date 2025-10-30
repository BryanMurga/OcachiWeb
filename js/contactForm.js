import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { db } from "./firebase.js";

// 🔹 Referencias del formulario
const form = document.getElementById("contactForm");
const nombre = document.getElementById("nombre");
const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");
const programa = document.getElementById("programa");
const taller = document.getElementById("taller"); // opcional

// 🔸 Funciones de validación
function validarNombre() {
  const pattern = /^[A-Za-zÀ-ÿ\s]{1,50}$/;
  const error = document.getElementById("nombreError");
  if (!pattern.test(nombre.value.trim())) {
    error.classList.remove("d-none");
    return false;
  }
  error.classList.add("d-none");
  return true;
}

function validarCorreo() {
  const error = document.getElementById("correoError");
  if (!correo.checkValidity()) {
    error.classList.remove("d-none");
    return false;
  }
  error.classList.add("d-none");
  return true;
}

function validarTelefono() {
  const pattern = /^[0-9]{1,12}$/;
  const error = document.getElementById("telefonoError");
  if (!pattern.test(telefono.value.trim())) {
    error.classList.remove("d-none");
    return false;
  }
  error.classList.add("d-none");
  return true;
}

function validarPrograma() {
  const error = document.getElementById("programaError");
  if (programa.value === "") {
    error.classList.remove("d-none");
    return false;
  }
  error.classList.add("d-none");
  return true;
}

function validarTaller() {
  if (!taller) return true; // si el campo no existe, no se valida
  const error = document.getElementById("tallerError");
  if (taller.value === "") {
    error.classList.remove("d-none");
    return false;
  }
  error.classList.add("d-none");
  return true;
}

// 🧩 Función para mostrar alertas tipo toast
function mostrarToast(mensaje, tipo = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  const icon = tipo === "success" ? "✅" : "❌";
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${mensaje}</span>`;
  document.body.appendChild(toast);

  // Mostrar con animación
  setTimeout(() => toast.classList.add("show"), 100);

  // Ocultar y eliminar después
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// 🎧 Validación en tiempo real
nombre.addEventListener("input", validarNombre);
correo.addEventListener("input", validarCorreo);
telefono.addEventListener("input", () => {
  telefono.value = telefono.value.replace(/[^0-9]/g, "");
  validarTelefono();
});
programa.addEventListener("change", validarPrograma);
if (taller) taller.addEventListener("change", validarTaller);

// 📤 Envío del formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isValid =
    validarNombre() &&
    validarCorreo() &&
    validarTelefono() &&
    validarPrograma() &&
    validarTaller();

  if (!isValid) return;

  try {
    const datos = {
      nombre: nombre.value.trim(),
      correo: correo.value.trim(),
      telefono: telefono.value.trim(),
      programa: programa.value,
      creadoEn: serverTimestamp(),
    };

    // Si existe el campo taller, lo guarda en una colección separada
    const coleccion = taller ? "talleres" : "registros";
    if (taller) datos.taller = taller.value;

    await addDoc(collection(db, coleccion), datos);

    mostrarToast(`Formulario enviado correctamente (${coleccion})`, "success");
    form.reset();
  } catch (error) {
    console.error("Error guardando en Firebase:", error);
    mostrarToast("Ocurrió un error al enviar el formulario", "error");
  }
});
