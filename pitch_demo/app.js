const elements = {
  connectorSelect: document.getElementById("connectorSelect"),
  roleSelect: document.getElementById("roleSelect"),
  metricsStrip: document.getElementById("metricsStrip"),
  alertsList: document.getElementById("alertsList"),
  sampleRow: document.getElementById("sampleRow"),
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
  runButton: document.getElementById("runButton"),
  micButton: document.getElementById("micButton"),
  speakButton: document.getElementById("speakButton"),
  runTour: document.getElementById("runTour"),
  approveDraft: document.getElementById("approveDraft"),
  reviseDraft: document.getElementById("reviseDraft")
};

const state = {
  sampleCommands: [],
  lastNarration: "",
  bootstrap: null
};

function setText(node, value, muted = false) {
  node.textContent = value;
  node.classList.toggle("muted", muted);
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
  renderConnectors(payload.connectors);
  renderRoles(payload.roles);
  renderMetrics(payload.metrics);
  renderAlerts(payload.alerts);
  renderSamples(payload.sampleCommands);
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

function renderSamples(commands) {
  elements.sampleRow.innerHTML = "";
  commands.forEach((command) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sample-chip";
    button.textContent = command;
    button.addEventListener("click", () => {
      elements.commandInput.value = command;
      runQuery(command);
    });
    elements.sampleRow.appendChild(button);
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
    return;
  }

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
  const query = forcedCommand || elements.commandInput.value.trim();
  if (!query) {
    setText(elements.transcriptBox, "Enter a command first.", true);
    return;
  }

  setText(elements.transcriptBox, query);
  setText(elements.intentBox, "Routing request...", true);
  setText(elements.replyBox, "Connecting to the demo orchestration API...", true);
  setText(elements.toolsBox, "Waiting for tool execution trace...", true);
  setText(elements.insightsBox, "Waiting for sales insight...", true);
  elements.resultCards.innerHTML = "";
  renderTable(null);
  renderDraft(null);

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

  const payload = await response.json();
  setText(elements.intentBox, payload.intent);
  await streamReply(payload.reply);
  renderToolTrace(payload.tools);
  renderInsights(payload.insights);
  renderCards(payload.cards);
  renderTable(payload.table);
  renderDraft(payload.draft);
  state.lastNarration = payload.narration || payload.reply;
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.micButton.textContent = "Mic unsupported";
    elements.micButton.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  elements.micButton.addEventListener("click", () => {
    elements.micButton.textContent = "Listening...";
    recognition.start();
  });

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    elements.commandInput.value = transcript;
    runQuery(transcript);
  });

  const resetMic = () => {
    elements.micButton.textContent = "Mic";
  };

  recognition.addEventListener("end", resetMic);
  recognition.addEventListener("error", resetMic);
}

function setupSpeechSynthesis() {
  if (!("speechSynthesis" in window)) {
    elements.speakButton.textContent = "Speech unavailable";
    elements.speakButton.disabled = true;
    return;
  }

  elements.speakButton.addEventListener("click", () => {
    if (!state.lastNarration) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(state.lastNarration);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  });
}

function setupButtons() {
  elements.runButton.addEventListener("click", () => runQuery());
  elements.runTour.addEventListener("click", async () => {
    for (const command of state.sampleCommands) {
      elements.commandInput.value = command;
      // eslint-disable-next-line no-await-in-loop
      await runQuery(command);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 900));
    }
  });

  elements.approveDraft.addEventListener("click", () => {
    setText(elements.insightsBox, "Draft approved in demo mode. In a live system, the write request would now move to the host PMS or procurement API.");
    elements.insightsBox.classList.remove("muted");
  });

  elements.reviseDraft.addEventListener("click", () => {
    setText(elements.insightsBox, "Revision requested in demo mode. This is useful in the pitch to show safe human control over all regulated writes.");
    elements.insightsBox.classList.remove("muted");
  });
}

async function bootstrap() {
  await loadBootstrap();
  setupSpeechRecognition();
  setupSpeechSynthesis();
  setupButtons();
}

bootstrap().catch((error) => {
  setText(elements.replyBox, `Failed to load demo: ${error.message}`, true);
});
