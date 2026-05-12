import { db } from "./firebase.js"; // ajusta la ruta
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

(function () {
  "use strict";

  /* ── Helpers ── */
  function qs(id) {
    return document.getElementById(id);
  }

  function setInputState(inputEl, valid) {
    inputEl.classList.toggle("is-error", !valid);
    inputEl.classList.toggle("is-valid", valid);
  }

  function setCardState(cardEl, valid) {
    cardEl.classList.toggle("is-error", !valid);
    cardEl.classList.toggle("is-valid", valid);
  }

  function toggleErr(id, show) {
    qs(id).classList.toggle("show", show);
  }

  /* ── Abrir / cerrar ── */
  window.ocachiAbrirModal = function () {
    qs("ocachiModalOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.ocachiCerrarModal = function () {
    qs("ocachiModalOverlay").classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(ocachiReset, 320);
  };

  window.ocachiCerrarAlClick = function (e) {
    if (e.target === qs("ocachiModalOverlay")) ocachiCerrarModal();
  };

  /* ── Reset ── */
  function ocachiReset() {
    [
      "ocachi-nombre",
      "ocachi-whatsapp",
      "ocachi-correo",
      "ocachi-invitado",
      "ocachi-preescolar",
      "ocachi-primaria",
    ].forEach(function (id) {
      var el = qs(id);
      if (!el) return;
      el.value = "";
      el.classList.remove("is-error", "is-valid");
    });
    ["ocachi-card-preescolar", "ocachi-card-primaria"].forEach(function (id) {
      qs(id).classList.remove("is-error", "is-valid");
    });
    [
      "ocachi-err-nombre",
      "ocachi-err-whatsapp",
      "ocachi-err-correo",
      "ocachi-err-invitado",
      "ocachi-err-alumnos",
    ].forEach(function (id) {
      toggleErr(id, false);
    });
    qs("ocachiFormSection").style.display = "block";
    qs("ocachiSuccess").classList.remove("show");
  }

  /* ── Bloquear letras en WhatsApp ── */
  qs("ocachi-whatsapp").addEventListener("keypress", function (e) {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });

  /* ── Validación en tiempo real para alumnos (rango 0–10) ── */
  ["preescolar", "primaria"].forEach(function (nivel) {
    var input = qs("ocachi-" + nivel);
    var card = qs("ocachi-card-" + nivel);

    input.addEventListener("keypress", function (e) {
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    });

    input.addEventListener("input", function () {
      var raw = input.value;
      if (raw === "") {
        card.classList.remove("is-error", "is-valid");
        return;
      }

      var v = parseInt(raw, 10);
      if (isNaN(v)) {
        input.value = "";
        card.classList.remove("is-error", "is-valid");
        return;
      }
      if (v < 0) {
        input.value = 0;
      }
      if (v > 10) {
        input.value = 10;
      }
      setCardState(card, true);
    });
  });

  /* ── Envío / validación ── */
  window.ocachiEnviar = function () {
    var ok = true;

    /* Nombre */
    var nombre = qs("ocachi-nombre").value.trim();
    var nombreOk = nombre.length >= 3;
    setInputState(qs("ocachi-nombre"), nombreOk);
    toggleErr("ocachi-err-nombre", !nombreOk);
    if (!nombreOk) ok = false;

    /* WhatsApp */
    var wa = qs("ocachi-whatsapp").value.trim();
    var waOk = /^[0-9]{10,15}$/.test(wa);
    setInputState(qs("ocachi-whatsapp"), waOk);
    toggleErr("ocachi-err-whatsapp", !waOk);
    if (!waOk) ok = false;

    /* Correo */
    var correo = qs("ocachi-correo").value.trim();
    var correoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    setInputState(qs("ocachi-correo"), correoOk);
    toggleErr("ocachi-err-correo", !correoOk);
    if (!correoOk) ok = false;

    /* ¿Quién invitó? */
    var invitado = qs("ocachi-invitado").value;
    var invitadoOk = invitado !== "";
    setInputState(qs("ocachi-invitado"), invitadoOk);
    toggleErr("ocachi-err-invitado", !invitadoOk);
    if (!invitadoOk) ok = false;

    /* Alumnos — rango válido: 0–10, ambos campos requeridos */
    var preVal = qs("ocachi-preescolar").value;
    var priVal = qs("ocachi-primaria").value;
    var pre = preVal !== "" ? parseInt(preVal, 10) : null;
    var pri = priVal !== "" ? parseInt(priVal, 10) : null;

    // Campo requerido (debe tener algún valor) y dentro del rango 0–10
    var preOk = pre !== null && pre >= 0 && pre <= 10;
    var priOk = pri !== null && pri >= 0 && pri <= 10;
    var alumOk = preOk && priOk;

    setCardState(qs("ocachi-card-preescolar"), preOk);
    setCardState(qs("ocachi-card-primaria"), priOk);
    toggleErr("ocachi-err-alumnos", !alumOk);
    if (!alumOk) ok = false;

    if (!ok) return;

    /* ── Éxito ── */
    var btn = qs("ocachiBtnSubmit");
    btn.disabled = true;
    btn.textContent = "Registrando...";

    // Datos a guardar
    var registro = {
      nombre: nombre,
      whatsapp: wa,
      correo: correo,
      invitadoPor: invitado,
      preescolar: pre,
      primaria: pri,
      creadoEn: serverTimestamp(),
    };

    addDoc(collection(db, "eventoTeatroOcachi"), registro)
      .then(function () {
        qs("ocachiFormSection").style.display = "none";
        qs("ocachiSuccess").classList.add("show");
      })
      .catch(function (error) {
        console.error("Error al guardar el registro:", error);
        alert(
          "Ocurrió un error al guardar tu registro. Por favor intenta de nuevo.",
        );
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = "APARTAR MI LUGAR →";
      });

    setTimeout(function () {
      qs("ocachiFormSection").style.display = "none";
      qs("ocachiSuccess").classList.add("show");
      btn.disabled = false;
      btn.textContent = "APARTAR MI LUGAR →";
    }, 900);
  };

  /* ── Escape key ── */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") ocachiCerrarModal();
  });
})();
