const elements = {
  connectorSelect: document.getElementById("connectorSelect"),
  roleSelect: document.getElementById("roleSelect"),
  metricsStrip: document.getElementById("metricsStrip"),
  alertsList: document.getElementById("alertsList"),
  promptLibrary: document.getElementById("promptLibrary"),
  libraryPanel: document.getElementById("libraryPanel"),
  toggleLibrary: document.getElementById("toggleLibrary"),
  commandInput: document.getElementById("commandInput"),
  transcriptBox: document.getElementById("transcriptBox"),
  intentBox: document.getElementById("intentBox"),
  replyBox: document.getElementById("replyBox"),
  toolsBox: document.getElementById("toolsBox"),
  insightsBox: document.getElementById("insightsBox"),
  resultCards: document.getElementById("resultCards"),
  tablePanel: document.getElementById("tablePanel"),
  tableTitle: document.getElementById("tableTitle"),
  resultTable: document.getElementById("resultTable"),
  draftPanel: document.getElementById("draftPanel"),
  draftTitle: document.getElementById("draftTitle"),
  draftStatus: document.getElementById("draftStatus"),
  draftFields: document.getElementById("draftFields"),
  voiceOrb: document.getElementById("voiceOrb"),
  voiceState: document.getElementById("voiceState"),
  approveDraft: document.getElementById("approveDraft"),
  reviseDraft: document.getElementById("reviseDraft")
};

const state = {
  sampleCommands: [],
  promptGroups: [],
  guidedStories: [],
  lastNarration: "",
  bootstrap: null,
  isRunning: false,
  currentDraft: null,
  voiceInputActive: false,
  serverVoiceEnabled: false,
  mediaRecorder: null,
  recordedChunks: [],
  fallbackRecognition: null,
  isRecording: false
};

function setText(node, value, muted = false) {
  node.textContent = value;
  node.classList.toggle("muted", muted);
}

function setVoiceMode(label, listening = false) {
  if (elements.voiceState) {
    elements.voiceState.textContent = label;
  }
  if (elements.voiceOrb) {
    elements.voiceOrb.classList.toggle("listening", listening);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadBootstrap() {
  const response = await fetch("/api/bootstrap");
  const payload = await response.json();
  state.bootstrap = payload;
  state.sampleCommands = payload.sampleCommands;
  state.promptGroups = payload.promptGroups || [];
  state.guidedStories = payload.guidedStories || [];
  state.serverVoiceEnabled = Boolean(payload.voiceConfig?.serverTranscriptionEnabled);
  renderConnectors(payload.connectors);
  renderRoles(payload.roles);
  renderMetrics(payload.metrics);
  renderAlerts(payload.alerts);
  renderPromptLibrary(state.promptGroups);
  if (payload.voiceConfig?.modeLabel) {
    setVoiceMode(payload.voiceConfig.modeLabel);
  }
}

function renderConnectors(connectors) {
  elements.connectorSelect.innerHTML = connectors
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`)
    .join("");
}

function renderRoles(roles) {
  elements.roleSelect.innerHTML = roles
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`)
    .join("");
  elements.roleSelect.value = "supt";
}

function renderMetrics(metrics) {
  elements.metricsStrip.innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric-tile">
          <div class="metric-label">${escapeHtml(metric.label)}</div>
          <div class="metric-value">${escapeHtml(metric.value)}</div>
          <div class="metric-detail">${escapeHtml(metric.detail)}</div>
        </article>
      `
    )
    .join("");
}

function renderAlerts(alerts) {
  elements.alertsList.innerHTML = alerts
    .map(
      (alert) => `
        <article class="alert-item ${escapeHtml(alert.severity)}">
          <strong>${escapeHtml(alert.title)}</strong>
          <div class="alert-meta">${escapeHtml(alert.vessel)} | ${escapeHtml(alert.age)}</div>
        </article>
      `
    )
    .join("");
}

function renderPromptLibrary(groups) {
  if (!elements.promptLibrary) {
    return;
  }

  elements.promptLibrary.innerHTML = "";
  groups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "prompt-group";
    const chips = group.prompts
      .map(
        (prompt) =>
          `<button type="button" class="sample-chip prompt-chip" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`
      )
      .join("");

    section.innerHTML = `
      <p class="prompt-group-title">${escapeHtml(group.title)}</p>
      <p class="prompt-group-description">${escapeHtml(group.description || "")}</p>
      <div class="prompt-chip-grid">${chips}</div>
    `;
    elements.promptLibrary.appendChild(section);
  });

  elements.promptLibrary.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.getAttribute("data-prompt");
      elements.commandInput.value = prompt;
      runQuery(prompt);
    });
  });
}

function renderCards(cards) {
  elements.resultCards.innerHTML = "";
  if (!cards || !cards.length) {
    return;
  }

  cards.forEach((entry) => {
    const article = document.createElement("article");
    article.className = `result-card ${entry.tone || "neutral"}`;
    article.innerHTML = `
      <span class="result-label">${escapeHtml(entry.label)}</span>
      <strong class="result-value">${escapeHtml(entry.value)}</strong>
      <div class="result-detail">${escapeHtml(entry.detail || "")}</div>
    `;
    elements.resultCards.appendChild(article);
  });
}

function renderTable(table) {
  if (!table) {
    elements.tablePanel.classList.add("hidden");
    elements.resultTable.innerHTML = "";
    return;
  }

  elements.tablePanel.classList.remove("hidden");
  elements.tableTitle.textContent = table.title || "Result table";
  const header = `<thead><tr>${table.columns.map((col) => `<th>${escapeHtml(col)}</th>`).join("")}</tr></thead>`;
  const body = `
    <tbody>
      ${table.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
        )
        .join("")}
    </tbody>
  `;
  elements.resultTable.innerHTML = `${header}${body}`;
}

function renderDraft(draft) {
  if (!draft) {
    elements.draftPanel.classList.add("hidden");
    elements.draftFields.innerHTML = "";
    state.currentDraft = null;
    return;
  }

  state.currentDraft = draft;
  elements.draftPanel.classList.remove("hidden");
  elements.draftTitle.textContent = draft.title;
  elements.draftStatus.textContent = draft.status;
  elements.draftFields.innerHTML = draft.fields
    .map(
      ([label, value]) => `
        <div class="draft-field">
          <div class="draft-field-label">${escapeHtml(label)}</div>
          <div>${escapeHtml(value)}</div>
        </div>
      `
    )
    .join("");
}

function renderToolTrace(tools) {
  if (!tools || !tools.length) {
    setText(elements.toolsBox, "No tool activity yet.", true);
    return;
  }

  elements.toolsBox.innerHTML = tools
    .map((tool) => `- ${escapeHtml(tool.name)}\n  ${escapeHtml(tool.outcome)}`)
    .join("\n\n");
  elements.toolsBox.classList.remove("muted");
}

function renderInsights(insights) {
  if (!insights || !insights.length) {
    setText(elements.insightsBox, "No commercial note for this response.", true);
    return;
  }

  elements.insightsBox.innerHTML = insights.map((item) => `- ${escapeHtml(item)}`).join("\n\n");
  elements.insightsBox.classList.remove("muted");
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function transcribeRecordedAudio(blob) {
  const audioBase64 = await blobToBase64(blob);
  const response = await fetch("/api/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      audioBase64,
      mimeType: blob.type || "audio/webm"
    })
  });

  if (!response.ok) {
    throw new Error(`Voice transcription failed with status ${response.status}`);
  }

  return response.json();
}

async function streamReply(text) {
  elements.replyBox.classList.remove("muted");
  elements.replyBox.textContent = "";
  const words = String(text).split(" ");
  for (let index = 0; index < words.length; index += 1) {
    elements.replyBox.textContent += `${index ? " " : ""}${words[index]}`;
    // Keep the typing effect short so the demo still feels responsive.
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
}

async function runQuery(forcedCommand) {
  if (state.isRunning) {
    return;
  }
  const query = forcedCommand || elements.commandInput.value.trim();
  if (!query) {
    setText(elements.transcriptBox, "Enter a command first.", true);
    return;
  }

  state.isRunning = true;
  toggleActionButtons(true);
  setVoiceMode("Thinking through the request");
  setText(elements.transcriptBox, query);
  setText(elements.intentBox, "Routing request...", true);
  setText(elements.replyBox, "Connecting to the demo orchestration API...", true);
  setText(elements.toolsBox, "Waiting for tool execution trace...", true);
  setText(elements.insightsBox, "Waiting for sales insight...", true);
  elements.resultCards.innerHTML = "";
  renderTable(null);
  renderDraft(null);

  try {
    const response = await fetch("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        connector: elements.connectorSelect.value,
        role: elements.roleSelect.value
      })
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();
    setText(elements.transcriptBox, payload.transcriptDisplay || payload.normalizedEnglish || query);
    setText(elements.intentBox, payload.intent);
    await streamReply(payload.reply);
    renderToolTrace(payload.tools);
    renderInsights(payload.insights);
    renderCards(payload.cards);
    renderTable(payload.table);
    renderDraft(payload.draft);
    state.lastNarration = payload.narration || payload.reply;
    if (state.voiceInputActive && "speechSynthesis" in window && state.lastNarration) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(state.lastNarration);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.addEventListener("start", () => setVoiceMode("Speaking the reply"));
      utterance.addEventListener("end", () => setVoiceMode("Response ready"));
      window.speechSynthesis.speak(utterance);
    } else {
      setVoiceMode("Response ready");
    }
  } catch (error) {
    setText(elements.intentBox, "Query failed");
    setText(elements.replyBox, `The demo request failed: ${error.message}`);
    setVoiceMode("Demo request failed");
  } finally {
    state.voiceInputActive = false;
    state.isRunning = false;
    toggleActionButtons(false);
  }
}

function toggleActionButtons(disabled) {
  [
    elements.voiceOrb,
    elements.toggleLibrary,
    elements.approveDraft,
    elements.reviseDraft
  ].forEach((button) => {
    if (button) {
      button.disabled = disabled;
    }
  });
}

function setupVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    state.fallbackRecognition = new SpeechRecognition();
    state.fallbackRecognition.lang = "en-US";
    state.fallbackRecognition.interimResults = false;
    state.fallbackRecognition.addEventListener("result", (event) => {
      const transcript = event.results[0][0].transcript;
      elements.commandInput.value = transcript;
      runQuery(transcript);
    });
    state.fallbackRecognition.addEventListener("end", () => {
      if (!state.isRunning && !state.isRecording) {
        setVoiceMode("Ready for a command");
      }
    });
    state.fallbackRecognition.addEventListener("error", () => {
      if (!state.isRunning && !state.isRecording) {
        setVoiceMode("Voice input unavailable, type and press Enter");
      }
    });
  }

  if (elements.voiceOrb) {
    elements.voiceOrb.addEventListener("click", async () => {
      if (state.isRunning) {
        return;
      }

      if (elements.commandInput.value.trim()) {
        runQuery();
        return;
      }

      if (state.serverVoiceEnabled && navigator.mediaDevices?.getUserMedia && window.MediaRecorder) {
        try {
          if (!state.isRecording) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            state.recordedChunks = [];
            state.mediaRecorder = new MediaRecorder(stream);
            state.mediaRecorder.addEventListener("dataavailable", (event) => {
              if (event.data.size > 0) {
                state.recordedChunks.push(event.data);
              }
            });
            state.mediaRecorder.addEventListener("stop", async () => {
              const blob = new Blob(state.recordedChunks, {
                type: state.recordedChunks[0]?.type || "audio/webm"
              });
              stream.getTracks().forEach((track) => track.stop());
              state.voiceInputActive = true;
              setVoiceMode("Transcribing and normalizing to English");
              try {
                const payload = await transcribeRecordedAudio(blob);
                const finalTranscript = payload.normalizedEnglish || payload.transcriptOriginal || "";
                elements.commandInput.value = finalTranscript;
                setText(
                  elements.transcriptBox,
                  payload.needsTranslation
                    ? `Original: ${payload.transcriptOriginal}\nEnglish: ${finalTranscript}`
                    : finalTranscript
                );
                await runQuery(finalTranscript);
              } catch (error) {
                setVoiceMode("Voice transcription failed, try again");
                setText(elements.replyBox, `Voice processing failed: ${error.message}`);
              }
            });

            state.isRecording = true;
            state.voiceInputActive = true;
            setVoiceMode("Listening. Tap again to stop.", true);
            state.mediaRecorder.start();
            return;
          }

          state.isRecording = false;
          setVoiceMode("Finishing recording");
          state.mediaRecorder.stop();
          return;
        } catch (error) {
          setVoiceMode("Microphone access failed");
        }
      }

      if (state.fallbackRecognition) {
        state.voiceInputActive = true;
        setVoiceMode("Listening for an English voice command", true);
        state.fallbackRecognition.start();
        return;
      }

      setVoiceMode("Microphone unavailable, type and press Enter");
    });
  }
}

function setupButtons() {
  if (elements.toggleLibrary) {
    elements.toggleLibrary.addEventListener("click", () => {
      const isHidden = elements.libraryPanel.classList.contains("hidden");
      elements.libraryPanel.classList.toggle("hidden", !isHidden);
      elements.toggleLibrary.textContent = isHidden ? "Hide Prompt Library" : "View Prompt Library";
    });
  }

  elements.commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runQuery();
    }
  });

  elements.approveDraft.addEventListener("click", () => {
    const message = state.currentDraft?.actionType === "job_completion"
      ? "Job completion confirmed in demo mode. In a live system, the PMS work order would now move to CLOSED with the captured completion date and closure description."
      : "Draft approved in demo mode. In a live system, the write request would now move to the host PMS or procurement API.";
    setText(elements.insightsBox, message);
    elements.insightsBox.classList.remove("muted");
    setVoiceMode(state.currentDraft?.actionType === "job_completion" ? "Job closure confirmed" : "Draft approved");
  });

  elements.reviseDraft.addEventListener("click", () => {
    setText(elements.insightsBox, "Revision requested in demo mode. This is useful in the pitch to show safe human control over all regulated writes.");
    elements.insightsBox.classList.remove("muted");
    setVoiceMode("Revision requested");
  });
}

async function bootstrap() {
  await loadBootstrap();
  setupVoiceInput();
  setupButtons();
}

bootstrap().catch((error) => {
  setText(elements.replyBox, `Failed to load demo: ${error.message}`, true);
});
