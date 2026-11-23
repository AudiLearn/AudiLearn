
const API_URL = "https://audilearn-api.diegoalonsoriosgarcia.workers.dev/";

const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const prepareButton = document.getElementById("prepare");

let currentAudioText = "";

fileInput.addEventListener("change", () => {
  fileName.textContent = fileInput.files.length
    ? `Archivo seleccionado: ${fileInput.files[0].name}`
    : "Ningún archivo seleccionado";
});

document.querySelectorAll(".filter input").forEach(input => {
  input.addEventListener("change", () => {
    document.querySelectorAll(".filter").forEach(card => {
      card.classList.remove("selected");
    });

    input.closest(".filter").classList.add("selected");

    const labels = {
      jerarquia: "Por relevancia",
      problema: "Problema-solución",
      accion: "Por decisiones",
      temas: "Por categorías"
    };

    document.getElementById("previewFilter").textContent =
      labels[input.value];
  });
});

document.getElementById("depth").addEventListener("change", e => {
  document.getElementById("previewDepth").textContent = e.target.value;
});

document.getElementById("duration").addEventListener("change", e => {
  document.getElementById("previewDuration").textContent = e.target.value;
});

function showMessage(message, isError = false) {
  let status = document.getElementById("audilearnStatus");

  if (!status) {
    status = document.createElement("p");
    status.id = "audilearnStatus";
    status.style.marginTop = "15px";
    status.style.padding = "12px";
    status.style.borderRadius = "10px";
    prepareButton.insertAdjacentElement("afterend", status);
  }

  status.textContent = message;
  status.style.color = isError ? "#b42318" : "#176b45";
  status.style.background = isError ? "#fff0ef" : "#eaf8f0";
}

function showAudio(script) {
  let section = document.getElementById("audioResult");

  if (!section) {
    section = document.createElement("section");
    section.id = "audioResult";
    section.style.marginTop = "20px";
    section.style.padding = "20px";
    section.style.borderRadius = "14px";
    section.style.background = "#f1f5fb";
    section.style.color = "#172b4d";
    prepareButton.insertAdjacentElement("afterend", section);
  }

  section.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Tu cápsula está lista";

  const description = document.createElement("p");
  description.textContent = "Escucha el contenido de tu material de estudio.";

  const text = document.createElement("div");
  text.style.whiteSpace = "pre-wrap";
  text.style.lineHeight = "1.7";
  text.style.margin = "15px 0";
  text.textContent = script;

  const play = document.createElement("button");
  play.textContent = "▶ Escuchar cápsula";

  const pause = document.createElement("button");
  pause.textContent = "Ⅱ Pausar";

  const resume = document.createElement("button");
  resume.textContent = "▶ Continuar";

  const stop = document.createElement("button");
  stop.textContent = "■ Detener";

  [play, pause, resume, stop].forEach(button => {
    button.style.margin = "5px";
    button.style.padding = "10px 14px";
    button.style.borderRadius = "8px";
    button.style.border = "1px solid #cbd5e1";
    button.style.cursor = "pointer";
  });

  play.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
      showMessage("Tu navegador no admite lectura en voz alta.", true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = "es-PE";
    utterance.rate = 1;

    window.speechSynthesis.speak(utterance);
  });

  pause.addEventListener("click", () => {
    window.speechSynthesis.pause();
  });

  resume.addEventListener("click", () => {
    window.speechSynthesis.resume();
  });

  stop.addEventListener("click", () => {
    window.speechSynthesis.cancel();
  });

  section.append(title, description, play, pause, resume, stop, text);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

prepareButton.addEventListener("click", async () => {
  let text = document.getElementById("sourceText").value.trim();
  const file = fileInput.files[0];

  if (!text && file) {
    if (file.name.toLowerCase().endsWith(".txt")) {
      text = await file.text();
    } else {
      showMessage(
        "Por ahora, pega el contenido de tu PDF, Word o PowerPoint en el cuadro de texto. El procesamiento directo de esos archivos se añadirá después.",
        true
      );
      return;
    }
  }

  if (!text) {
    showMessage("Primero pega el contenido de tus apuntes.", true);
    return;
  }

  const selectedFilter = document.querySelector(
    '.filter input[name="filter"]:checked'
  );

  const structureNames = {
    jerarquia: "Jerarquía o relevancia",
    problema: "Problema-solución",
    accion: "Acción o toma de decisiones",
    temas: "Temática o categorías"
  };

  const payload = {
    text: text,
    structure: structureNames[selectedFilter.value],
    depth: document.getElementById("depth").value,
    duration: document.getElementById("duration").value,
    instructions: document.getElementById("extra").value.trim()
  };

  prepareButton.disabled = true;
  prepareButton.textContent = "Preparando tu cápsula...";

  showMessage("AudiLearn está analizando tu material. Esto puede tardar unos momentos.");

  const oldResult = document.getElementById("audioResult");
  if (oldResult) oldResult.remove();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.detail || result.error || "No se pudo generar la cápsula.");
    }

    currentAudioText = result.script;

    showMessage("¡Tu cápsula se ha generado correctamente!");
    showAudio(currentAudioText);

  } catch (error) {
    showMessage(
      "No pudimos generar tu cápsula: " + error.message,
      true
    );
  } finally {
    prepareButton.disabled = false;
    prepareButton.innerHTML = 'Preparar mi cápsula <span>→</span>';
  }
});
