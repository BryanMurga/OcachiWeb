import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { db } from "./firebase.js";

// 3️⃣ Referencias del formulario
const form = document.getElementById("contactForm");
const nombre = document.getElementById("nombre");
const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");
const programa = document.getElementById("programa");

// 4️⃣ Funciones de validación
function validarNombre() {
  const pattern = /^[A-Za-zÀ-ÿ\s]{1,50}$/;
  if (!pattern.test(nombre.value.trim())) {
    document.getElementById("nombreError").classList.remove("d-none");
    return false;
  } else {
    document.getElementById("nombreError").classList.add("d-none");
    return true;
  }
}

function validarCorreo() {
  if (!correo.checkValidity()) {
    document.getElementById("correoError").classList.remove("d-none");
    return false;
  } else {
    document.getElementById("correoError").classList.add("d-none");
    return true;
  }
}

function validarTelefono() {
  const pattern = /^[0-9]{1,12}$/;
  if (!pattern.test(telefono.value.trim())) {
    document.getElementById("telefonoError").classList.remove("d-none");
    return false;
  } else {
    document.getElementById("telefonoError").classList.add("d-none");
    return true;
  }
}

function validarPrograma() {
  if (programa.value === "") {
    document.getElementById("programaError").classList.remove("d-none");
    return false;
  } else {
    document.getElementById("programaError").classList.add("d-none");
    return true;
  }
}

// 5️⃣ Validación en tiempo real
nombre.addEventListener("input", validarNombre);
correo.addEventListener("input", validarCorreo);
telefono.addEventListener("input", () => {
  telefono.value = telefono.value.replace(/[^0-9]/g, "");
  validarTelefono();
});
programa.addEventListener("change", validarPrograma);

// 6️⃣ Enviar formulario a Firestore
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isNombreValid = validarNombre();
  const isCorreoValid = validarCorreo();
  const isTelefonoValid = validarTelefono();
  const isProgramaValid = validarPrograma();

  if (isNombreValid && isCorreoValid && isTelefonoValid && isProgramaValid) {
    try {
      await addDoc(collection(db, "registros"), {
        nombre: nombre.value.trim(),
        correo: correo.value.trim(),
        telefono: telefono.value.trim(),
        programa: programa.value,
        creadoEn: serverTimestamp(),
      });
      alert("Formulario enviado correctamente a Firebase");
      form.reset();
    } catch (error) {
      console.error("Error guardando en Firebase:", error);
      alert("Ocurrió un error al enviar el formulario");
    }
  }
});
