const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DEMO_DIR = path.join(ROOT, "pitch_demo");
const PRD_PATH = path.join(ROOT, "PRODUCT_PRD_HARBOROPS_FLEET_COPILOT.md");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-transcribe";
const OPENAI_LANGUAGE_MODEL = process.env.OPENAI_LANGUAGE_MODEL || "gpt-5.4-mini";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

const demoState = {
  generatedAt: "2026-05-25T18:50:00+05:30",
  connectors: [
    { id: "generic", name: "Generic REST PMS", fit: "Fastest connector path" },
    { id: "amos", name: "AMOS-style connector", fit: "Enterprise technical teams" },
    { id: "shipmanager", name: "ShipManager-style connector", fit: "Strong office workflows" },
    { id: "tm_master", name: "TM Master-style connector", fit: "Balanced PMS + procurement" }
  ],
  roles: [
    { id: "ce", name: "Chief Engineer" },
    { id: "supt", name: "Superintendent" },
    { id: "buyer", name: "Procurement Officer" },
    { id: "fleet", name: "Fleet Manager" }
  ],
  metrics: [
    { label: "Fleet completion rate", value: "91%", tone: "good", detail: "Below target 95% but improving over last 14 days" },
    { label: "Critical overdue jobs", value: "2", tone: "risk", detail: "Both are blocked by material availability" },
    { label: "Urgent requisitions stalled", value: "1", tone: "warn", detail: "One req above 7 days without status movement" },
    { label: "PO delays affecting jobs", value: "2", tone: "risk", detail: "Direct operational impact visible to office and vessel" }
  ],
  alerts: [
    { severity: "critical", title: "Steering gear corrective job awaiting seal kit", vessel: "Ocean Crest", age: "3 days overdue" },
    { severity: "warning", title: "Air compressor overhaul held for valve kit ETA", vessel: "Meridian Pearl", age: "Due in 2 days" },
    { severity: "info", title: "Auto-requisition created for Class A inventory breach", vessel: "Ocean Crest", age: "15 min ago" }
  ],
  jobs: [
    {
      jobId: "WO-24051",
      vessel: "Meridian Pearl",
      equipment: "Main air compressor No. 1",
      title: "500-hour overhaul of air compressor",
      dueDate: "2026-05-27",
      priority: "CRITICAL",
      status: "OPEN",
      type: "PLANNED",
      blockingReason: "AWAITING_SPARES",
      linkedReqId: "REQ-26014",
      instructions: "Isolate compressor, verify pressure relief, replace valve kit, inspect lubrication line, run test for 20 minutes.",
      description: "Routine counter-based overhaul triggered by running hours. Delay increases starting-air system risk."
    },
    {
      jobId: "WO-24088",
      vessel: "Ocean Crest",
      equipment: "Steering gear hydraulic unit",
      title: "Replace steering gear O-rings and inspect leak path",
      dueDate: "2026-05-22",
      priority: "CRITICAL",
      status: "OPEN",
      type: "CORRECTIVE",
      blockingReason: "AWAITING_SPARES",
      linkedReqId: "REQ-26021",
      instructions: "Depressurize system, confirm lockout, replace all O-rings in seal kit, inspect ram surface, test port and starboard movement.",
      description: "Corrective job raised after recurring hydraulic seepage. Vessel should not sail with unresolved steering reliability concerns."
    },
    {
      jobId: "WO-24102",
      vessel: "Meridian Pearl",
      equipment: "Fuel oil purifier No. 2",
      title: "Investigate purifier sludge discharge alarm",
      dueDate: "2026-05-25",
      priority: "NON_CRITICAL",
      status: "IN_PROGRESS",
      type: "UNPLANNED",
      blockingReason: "MANPOWER",
      linkedReqId: null,
      instructions: "Check sludge line for obstruction, inspect bowl seals, verify alarm cable and restart sequence.",
      description: "Unplanned troubleshooting task raised by engine room watchkeeper."
    },
    {
      jobId: "WO-24115",
      vessel: "Ocean Crest",
      equipment: "EPIRB battery pack",
      title: "Replace EPIRB battery before expiry",
      dueDate: "2026-05-29",
      priority: "CRITICAL",
      status: "OPEN",
      type: "CLASS_MANDATORY",
      blockingReason: null,
      linkedReqId: null,
      instructions: "Confirm maker part number, replace battery per maker manual, perform self-test and log result.",
      description: "Safety equipment due-soon item generated from certificate and service schedule logic."
    }
  ],
  requisitions: [
    {
      reqId: "REQ-26014",
      vessel: "Meridian Pearl",
      title: "Air compressor overhaul valve kit",
      reqType: "CRITICAL",
      status: "PO_ISSUED",
      reqDate: "2026-05-18",
      sourceJobId: "WO-24051",
      supplier: "NorthSea Marine Spares",
      ageDays: 7
    },
    {
      reqId: "REQ-26021",
      vessel: "Ocean Crest",
      title: "Steering gear seal kit and O-rings",
      reqType: "URGENT",
      status: "SOURCING",
      reqDate: "2026-05-15",
      sourceJobId: "WO-24088",
      supplier: "Pending quotes",
      ageDays: 10
    },
    {
      reqId: "REQ-26033",
      vessel: "Ocean Crest",
      title: "Portable extinguisher service spares",
      reqType: "ROUTINE",
      status: "PENDING_SUPT_APPROVAL",
      reqDate: "2026-05-20",
      sourceJobId: null,
      supplier: "FireSafe Asia",
      ageDays: 5
    }
  ],
  purchaseOrders: [
    {
      poId: "PO-9821",
      reqId: "REQ-26014",
      supplier: "NorthSea Marine Spares",
      status: "IN_TRANSIT",
      etaDate: "2026-05-29",
      totalAmount: 4800
    },
    {
      poId: "PO-9835",
      reqId: "REQ-26040",
      supplier: "Helm Industrial",
      status: "DELAYED",
      etaDate: "2026-05-21",
      totalAmount: 2150
    }
  ],
  promptGroups: [
    {
      title: "Maintenance Lookups",
      description: "Daily officer and superintendent queries.",
      prompts: [
        "What jobs are due on Meridian Pearl in the next 7 days?",
        "Read the instructions for WO-24051",
        "Show overdue jobs on Ocean Crest",
        "What critical overdue jobs are blocked by awaiting spares?",
        "What jobs are due today on Meridian Pearl?",
        "List open jobs on Ocean Crest",
        "Show in-progress jobs for Meridian Pearl",
        "Read the description for WO-24088"
      ]
    },
    {
      title: "Defects, Closures And Postponements",
      description: "Controlled write workflows with approval steps.",
      prompts: [
        "Report a defect on purifier number 2 on Ocean Crest",
        "Postpone WO-24088 to 2026-05-30 because awaiting spares",
        "Defer WO-24088 due to material delay",
        "Create a defect for steering gear leak on Ocean Crest",
        "Close WO-24088 completed on 2026-05-26 with description steering gear seals renewed and leak test satisfactory",
        "Mark WO-24088 completed on 2026-05-26 with notes leak stopped after O-ring replacement",
        "Close WO-24088",
        "What do you need to close WO-24088?"
      ]
    },
    {
      title: "Requisitions And Procurement",
      description: "Spare ordering, buyer follow-up, and impact tracking.",
      prompts: [
        "Raise a requisition for steering gear O-rings linked to WO-24088",
        "Which urgent requisitions are older than 7 days?",
        "Follow up on urgent procurement items",
        "What delayed POs affect maintenance?",
        "Show stalled critical requisitions",
        "Which purchase orders are delayed?",
        "What procurement delays affect overdue maintenance?"
      ]
    },
    {
      title: "Analytics And Executive Questions",
      description: "Explain trends and root causes.",
      prompts: [
        "Why is maintenance completion low on Meridian Pearl?",
        "Give me analytics for fleet maintenance backlog",
        "What is causing delay in job completion?",
        "Summarize what this assistant can do",
        "What is driving the backlog?",
        "Explain the main cause of overdue work",
        "Give me a management summary"
      ]
    },
    {
      title: "Quick Voice Shortcuts",
      description: "Short, natural prompts that sound closer to Alexa or Siri usage.",
      prompts: [
        "Show due jobs",
        "Show overdue jobs",
        "Read job WO-24051",
        "Help",
        "Close overdue job WO-24088 on 2026-05-26 with description steering gear leak resolved",
        "Raise requisition for WO-24088"
      ]
    }
  ],
  guidedStories: [
    {
      id: "supt_round",
      title: "Superintendent Daily Round",
      description: "Review due work, overdue blockers, and a postponement draft.",
      commands: [
        "What jobs are due on Meridian Pearl in the next 7 days?",
        "What critical overdue jobs are blocked by awaiting spares?",
        "Postpone WO-24088 to 2026-05-30 because awaiting spares",
        "Close WO-24088 completed on 2026-05-26 with description steering gear seals renewed and leak test satisfactory"
      ]
    },
    {
      id: "buyer_followup",
      title: "Buyer Escalation Story",
      description: "Link job urgency to requisition and sourcing activity.",
      commands: [
        "Raise a requisition for steering gear O-rings linked to WO-24088",
        "Which urgent requisitions are older than 7 days?",
        "What delayed POs affect maintenance?"
      ]
    },
    {
      id: "executive_brief",
      title: "Management Briefing",
      description: "Show leadership-level analytics and product capabilities.",
      commands: [
        "Why is maintenance completion low on Meridian Pearl?",
        "Give me analytics for fleet maintenance backlog",
        "Summarize what this assistant can do"
      ]
    }
  ]
};

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function sendText(res, statusCode, body, contentType) {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function findJobById(text) {
  const match = text.match(/wo-\d+/i);
  if (!match) return null;
  return demoState.jobs.find((job) => job.jobId.toLowerCase() === match[0].toLowerCase()) || null;
}

function findVessel(text) {
  const vessels = [...new Set(demoState.jobs.map((job) => job.vessel))];
  return vessels.find((vessel) => text.includes(vessel.toLowerCase())) || null;
}

function findIsoDate(text) {
  const match = String(text || "").match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function extractClosureDescription(text) {
  const source = String(text || "");
  const patterns = [
    /description[:\s]+(.+)$/i,
    /notes?[:\s]+(.+)$/i,
    /because[:\s]+(.+)$/i,
    /completed[:\s]+with[:\s]+(.+)$/i
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/[.]+$/, "");
    }
  }

  return null;
}

function card(label, value, tone, detail) {
  return { label, value, tone, detail };
}

function toolTrace(name, outcome) {
  return { name, outcome };
}

function buildTable(title, columns, rows) {
  return { title, columns, rows };
}

async function callOpenAIJson(messages) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured on the server");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_LANGUAGE_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

async function routePromptWithOpenAI({ query, role, connector }) {
  return callOpenAIJson([
    {
      role: "system",
      content: [
        "You normalize and route multilingual maritime PMS and procurement prompts.",
        "The output must be strict JSON with keys workflow, normalized_english, canonical_prompt, notes.",
        "Supported workflows: capabilities, due_jobs, job_detail, overdue_jobs, defect_report, postponement, job_completion, requisition, procurement_followup, po_delay, analytics, backlog, generic.",
        "Translate non-English to English.",
        "Normalize dialects and broken English into concise operational English.",
        "Preserve work order IDs, vessel names, equipment names, dates, and part names exactly when present.",
        "Choose a canonical_prompt that this demo server can execute directly."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({
        role,
        connector,
        query
      })
    }
  ]);
}

async function composeGroundedReplyWithOpenAI({ query, role, connector, routed, payload }) {
  return callOpenAIJson([
    {
      role: "system",
      content: [
        "You are a maritime operations copilot writing grounded answers for a PMS and procurement demo.",
        "Use only the facts present in the provided payload.",
        "Do not invent jobs, requisitions, dates, suppliers, metrics, or approvals.",
        "Keep the answer concise, clear, and suitable for voice playback.",
        "If a draft exists, mention that confirmation is still required before any write action.",
        "Return strict JSON with keys reply, narration, and insights.",
        "The insights field must be an array of up to 2 short strings."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({
        role,
        connector,
        query,
        routed,
        payload: {
          intent: payload.intent,
          reply: payload.reply,
          cards: payload.cards,
          table: payload.table,
          draft: payload.draft,
          insights: payload.insights
        }
      })
    }
  ]);
}

async function enrichQueryWithOpenAI(queryPayload) {
  const originalQuery = String(queryPayload.query || "").trim();
  let routed = null;
  let canonicalQuery = originalQuery;
  const aiTools = [];

  if (OPENAI_API_KEY) {
    try {
      routed = await routePromptWithOpenAI(queryPayload);
      if (routed?.canonical_prompt) {
        canonicalQuery = routed.canonical_prompt;
      } else if (routed?.normalized_english) {
        canonicalQuery = routed.normalized_english;
      }
      aiTools.push(
        toolTrace(
          "openai_prompt_router()",
          `workflow ${routed?.workflow || "generic"} normalized prompt for deterministic handling`
        )
      );
    } catch (error) {
      aiTools.push(toolTrace("openai_prompt_router()", `fallback to local routing after ${error.message}`));
    }
  }

  const payload = handleQuery(canonicalQuery, queryPayload.role, queryPayload.connector);
  payload.transcript = originalQuery;
  payload.normalizedEnglish = routed?.normalized_english || canonicalQuery;
  payload.canonicalPrompt = canonicalQuery;
  payload.transcriptDisplay =
    payload.normalizedEnglish && payload.normalizedEnglish !== originalQuery
      ? `Original: ${originalQuery}\nEnglish: ${payload.normalizedEnglish}`
      : originalQuery;
  payload.tools = [...aiTools, ...(payload.tools || [])];

  if (!OPENAI_API_KEY) {
    return payload;
  }

  try {
    const groundedReply = await composeGroundedReplyWithOpenAI({
      query: originalQuery,
      role: queryPayload.role,
      connector: queryPayload.connector,
      routed,
      payload
    });

    if (groundedReply?.reply) {
      payload.reply = groundedReply.reply;
    }
    if (groundedReply?.narration) {
      payload.narration = groundedReply.narration;
    } else if (groundedReply?.reply) {
      payload.narration = groundedReply.reply;
    }
    if (Array.isArray(groundedReply?.insights) && groundedReply.insights.length) {
      payload.insights = groundedReply.insights;
    }
    payload.tools.unshift(
      toolTrace("openai_grounded_response()", "phrased the answer from deterministic PMS and procurement facts")
    );
  } catch (error) {
    payload.tools.unshift(
      toolTrace("openai_grounded_response()", `kept deterministic reply after ${error.message}`)
    );
  }

  return payload;
}

async function transcribeAudioToEnglish({ audioBase64, mimeType }) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured on the server");
  }

  const audioBuffer = Buffer.from(audioBase64, "base64");
  const fileExtension = mimeType && mimeType.includes("ogg")
    ? "ogg"
    : mimeType && mimeType.includes("mp4")
      ? "m4a"
      : "webm";
  const fileType = mimeType || "audio/webm";

  const transcriptionForm = new FormData();
  transcriptionForm.append(
    "file",
    new File([audioBuffer], `voice-input.${fileExtension}`, { type: fileType })
  );
  transcriptionForm.append("model", OPENAI_TRANSCRIBE_MODEL);

  const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: transcriptionForm
  });

  if (!transcriptionResponse.ok) {
    const errorText = await transcriptionResponse.text();
    throw new Error(`Transcription failed: ${errorText}`);
  }

  const transcriptionPayload = await transcriptionResponse.json();
  const transcriptText = transcriptionPayload.text || "";

  let parsedContent = {};

  try {
    parsedContent = await callOpenAIJson([
      {
        role: "system",
        content: "You normalize and translate maritime operational speech into clear English. Preserve work order IDs, vessel names, dates, equipment names, part names, and maritime abbreviations. Return strict JSON with keys source_language, normalized_english, needs_translation."
      },
      {
        role: "user",
        content: `Normalize this spoken maritime transcript for assistant processing. If the transcript is not English, translate it to operational English.\n\nTranscript:\n${transcriptText}`
      }
    ]);
  } catch {
    parsedContent = {
      source_language: "unknown",
      normalized_english: transcriptText,
      needs_translation: false
    };
  }

  return {
    transcriptOriginal: transcriptText,
    sourceLanguage: parsedContent.source_language || "unknown",
    normalizedEnglish: parsedContent.normalized_english || transcriptText,
    needsTranslation: Boolean(parsedContent.needs_translation)
  };
}

function result(intent, reply, options = {}) {
  return {
    transcript: options.transcript || "",
    intent,
    reply,
    tools: options.tools || [],
    cards: options.cards || [],
    table: options.table || null,
    draft: options.draft || null,
    insights: options.insights || [],
    narration: options.narration || reply
  };
}

function handleQuery(query, role, connector) {
  const transcript = String(query || "").trim();
  const text = normalize(transcript);
  const job = findJobById(transcript);

  const connectorName =
    demoState.connectors.find((item) => item.id === connector)?.name || "Generic REST PMS";
  const roleName =
    demoState.roles.find((item) => item.id === role)?.name || "Superintendent";

  if (!text) {
    return result("No query", "Enter a query to run the demo.", { transcript });
  }

  if (text.includes("what can you do") || text.includes("summarize what this assistant can do") || text === "help") {
    return result(
      "Capability summary",
      "I can demonstrate due and overdue job lookups, work-order readout, defect drafting, postponement requests, requisition creation, procurement follow-up, and management analytics across PMS and procurement data.",
      {
        transcript,
        tools: [
          toolTrace("list_capabilities()", "returned supported demo workflows"),
          toolTrace("policy_router()", "highlighted controlled write actions and approvals")
        ],
        cards: [
          card("Read workflows", "Jobs and details", "good", "Due jobs, overdue items, instructions, descriptions"),
          card("Write workflows", "Controlled drafts", "warn", "Defects, postponements, requisitions"),
          card("Job closure", "Voice confirmed", "good", "Overdue jobs can be closed with date and notes"),
          card("Procurement", "Follow-up ready", "good", "Req aging, sourcing priority, PO delay impact"),
          card("Analytics", "Explainable", "good", "Root cause and management narrative")
        ],
        insights: [
          "This is a strong first-click prompt for customer demos.",
          "It helps new users understand the assistant before trying voice."
        ]
      }
    );
  }

  if (
    text.includes("read the instructions") ||
    text.includes("read job") ||
    text.includes("show instructions") ||
    text.includes("read the description") ||
    (text.includes("instruction") && !text.includes("complete") && !text.includes("close")) ||
    (text.includes("description") && (text.includes("read") || text.includes("show")))
  ) {
    if (!job) {
      return result(
        "Work-order detail lookup",
        "I need a work-order ID to read the exact instructions and description. Try: Read the instructions for WO-24051.",
        {
          transcript,
          tools: [toolTrace("clarify_query()", "missing work-order identifier")]
        }
      );
    }
    return result(
      "Work-order detail lookup",
      `${job.jobId} on ${job.vessel}. Instructions: ${job.instructions} Description: ${job.description}`,
      {
        transcript,
        tools: [toolTrace("get_job_detail(job_id)", "pulled header, instructions, description, and linkage context")],
        cards: [
          card("Job", job.jobId, "neutral", job.title),
          card("Equipment", job.equipment, "neutral", job.vessel),
          card("Priority", job.priority, job.priority === "CRITICAL" ? "risk" : "neutral", job.status),
          card("Linked req", job.linkedReqId || "None", job.linkedReqId ? "warn" : "good", "Spare dependency visibility")
        ]
      }
    );
  }

  if (text.includes("overdue")) {
    const overdue = demoState.jobs.filter((item) => item.status !== "CLOSED" && item.dueDate < "2026-05-25");
    const blocked = overdue.filter((item) => item.blockingReason === "AWAITING_SPARES");
    return result(
      "Overdue maintenance review",
      `There are ${overdue.length} overdue jobs in the mock fleet, and ${blocked.length} are blocked by awaiting spares. This is where the plugin differentiates itself: it can explain operational delay using procurement state instead of only showing red jobs.`,
      {
        transcript,
        tools: [
          toolTrace("search_overdue_jobs(age_bucket, critical_only)", `returned ${overdue.length} overdue jobs`),
          toolTrace("explain_backlog(blocking_reason, vessel)", "joined requisition status to work-order backlog")
        ],
        cards: [
          card("Overdue jobs", String(overdue.length), "risk", "Open past due date"),
          card("Blocked by spares", String(blocked.length), "warn", "Direct procurement dependency"),
          card("Critical overdue", String(blocked.filter((item) => item.priority === "CRITICAL").length), "risk", "Highest pitch urgency"),
          card("Management angle", "Root cause", "neutral", "Not just count, but why")
        ],
        table: buildTable(
          "Critical overdue jobs blocked by spares",
          ["Job", "Vessel", "Title", "Due", "Req", "Status"],
          blocked.map((item) => [item.jobId, item.vessel, item.title, item.dueDate, item.linkedReqId || "-", item.status])
        ),
        insights: [
          "Customers immediately understand the office-vessel coordination benefit.",
          "This workflow bridges PMS and procurement without replacing either."
        ]
      }
    );
  }

  if (
    text.includes("delayed po") ||
    text.includes("delayed purchase order") ||
    text.includes("purchase orders are delayed") ||
    (text.includes("po") && text.includes("maintenance"))
  ) {
    const delayed = demoState.purchaseOrders.filter((item) => item.status === "DELAYED");
    return result(
      "PO delay impact review",
      `I found ${delayed.length} delayed purchase orders in the mock environment. The key message is that procurement delay can be translated into operational risk instead of staying isolated inside purchasing screens.`,
      {
        transcript,
        tools: [
          toolTrace("search_purchase_orders(status)", `returned ${delayed.length} delayed purchase orders`),
          toolTrace("map_po_delay_to_job_risk()", "joined delayed supply to affected maintenance workflow")
        ],
        cards: [
          card("Delayed POs", String(delayed.length), "warn", "Supplier or ETA exception"),
          card("Operational impact", "1 exposed job", "risk", "Critical corrective work remains at risk"),
          card("Buyer priority", "Escalate supplier", "neutral", "Focus on critical material path"),
          card("Demo value", "Cross-team clarity", "good", "Purchasing and technical see the same risk story")
        ],
        table: buildTable(
          "Delayed PO impact",
          ["PO", "Supplier", "ETA", "Status", "Likely impact"],
          delayed.map((item) => [item.poId, item.supplier, item.etaDate, item.status, "Corrective maintenance delay risk"])
        )
      }
    );
  }

  if (
    text.includes("job") &&
    (
      text.includes("due") ||
      text.includes("next 7 days") ||
      text.includes("open jobs") ||
      text.includes("active jobs") ||
      text.includes("in-progress jobs") ||
      text.includes("show due jobs")
    )
  ) {
    const vessel = findVessel(text) || "Meridian Pearl";
    const jobs = demoState.jobs.filter((item) => item.vessel === vessel && item.status !== "CLOSED");
    return result(
      "Due maintenance lookup",
      `Using the ${connectorName} connector, I found ${jobs.length} active jobs for ${vessel}. As ${roleName}, you should prioritize the critical compressor overhaul because it is closest to due and is dependent on a live requisition.`,
      {
        transcript,
        tools: [
          toolTrace("search_jobs(vessel, date_range, status)", "returned 2 due-soon and 1 in-progress items"),
          toolTrace("rank_jobs_by_priority_and_due_date()", `recommended ${jobs[0].jobId}`)
        ],
        cards: [
          card("Vessel", vessel, "neutral", "Connector-normalized view"),
          card("Active jobs", String(jobs.length), "neutral", "Due, upcoming, and in-progress"),
          card("Critical due-soon", "1", "risk", "Material dependent"),
          card("Linked requisitions", "1", "warn", "Procurement coupling visible")
        ],
        table: buildTable(
          "Due and upcoming jobs",
          ["Job", "Equipment", "Due", "Priority", "Status", "Blocker"],
          jobs.map((item) => [item.jobId, item.equipment, item.dueDate, item.priority, item.status, item.blockingReason || "-"])
        ),
        insights: [
          "The value proposition is cross-module visibility, not just voice search.",
          "This answer is already normalized enough to work across multiple PMS products."
        ]
      }
    );
  }

  if (text.includes("report a defect") || (text.includes("defect") && (text.includes("report") || text.includes("create")))) {
    const vessel = findVessel(text) || "Ocean Crest";
    const defectId = `DEF-${7400 + demoState.jobs.length}`;
    const correctiveJob = `WO-${24140 + demoState.jobs.length}`;
    return result(
      "Defect reporting workflow",
      `I drafted a new defect for ${vessel} and prepared a linked corrective job. In the real product, the user would now confirm the defect summary, severity, and equipment before submission.`,
      {
        transcript,
        tools: [
          toolTrace("create_defect(vessel, equipment, description, severity)", `draft ${defectId}`),
          toolTrace("create_corrective_job(defect_id, equipment, priority)", `draft ${correctiveJob}`)
        ],
        cards: [
          card("Draft defect", defectId, "warn", "Not submitted yet"),
          card("Linked corrective job", correctiveJob, "risk", "Operational follow-through"),
          card("Confirmation required", "Yes", "neutral", "Safe write pattern"),
          card("Role flow", "C/E -> Supt", "neutral", "Traceable approval chain")
        ],
        draft: {
          title: "Draft defect package",
          status: "Pending user confirmation",
          fields: [
            ["Vessel", vessel],
            ["Equipment", "Fuel oil purifier No. 2"],
            ["Severity", "Major"],
            ["Immediate impact", "Reduced purifier reliability"],
            ["Linked job", correctiveJob]
          ]
        }
      }
    );
  }

  if (text.includes("postpone") || text.includes("defer")) {
    if (!job) {
      return result(
        "Postponement request workflow",
        "I need a specific work-order ID before drafting a postponement request.",
        {
          transcript,
          tools: [toolTrace("clarify_query()", "missing job ID for formal deferral workflow")]
        }
      );
    }
    const dateMatch = transcript.match(/\d{4}-\d{2}-\d{2}/);
    const newDate = dateMatch ? dateMatch[0] : "2026-05-30";
    return result(
      "Postponement request workflow",
      `I prepared a formal postponement request for ${job.jobId}. The plugin does not edit due dates directly. It creates an auditable request, captures the reason, and routes it for approval.`,
      {
        transcript,
        tools: [
          toolTrace("get_job_detail(job_id)", `loaded ${job.jobId} detail and due date`),
          toolTrace("submit_postponement_request(job_id, reason_code, new_due_date)", `drafted new due date ${newDate}`)
        ],
        cards: [
          card("Job", job.jobId, "neutral", job.title),
          card("Current due date", job.dueDate, "risk", "Past due"),
          card("Requested new date", newDate, "warn", "Formal workflow only"),
          card("Approval", "Pending superintendent", "neutral", "No silent date edits")
        ],
        draft: {
          title: "Postponement request draft",
          status: "Awaiting approval",
          fields: [
            ["Reason code", "AWAITING_SPARES"],
            ["Requested by", roleName],
            ["Connector", connectorName],
            ["Governance note", "Due date remains immutable until approval"]
          ]
        }
      }
    );
  }

  if (
    (text.includes("complete") || text.includes("close") || text.includes("mark")) &&
    (text.includes("job") || text.includes("wo-") || text.includes("work order"))
  ) {
    if (!job) {
      return result(
        "Job completion workflow",
        "I need a specific work-order ID to prepare a completion draft. Try: Close WO-24088 completed on 2026-05-26 with description steering gear seals renewed and leak test satisfactory.",
        {
          transcript,
          tools: [toolTrace("clarify_query()", "missing work-order ID for closure workflow")]
        }
      );
    }

    const completionDate = findIsoDate(transcript);
    const closureDescription = extractClosureDescription(transcript);
    const isOverdue = job.dueDate < "2026-05-26";

    if (!completionDate || !closureDescription) {
      const missing = [
        !completionDate ? "completion date in YYYY-MM-DD format" : null,
        !closureDescription ? "closure description or completion notes" : null
      ].filter(Boolean);

      return result(
        "Job completion workflow",
        `I can draft closure for ${job.jobId}, but I still need ${missing.join(" and ")} before confirming the status change.`,
        {
          transcript,
          tools: [
            toolTrace("get_job_detail(job_id)", `loaded ${job.jobId} for completion workflow`),
            toolTrace("clarify_query()", `missing ${missing.join(" and ")}`)
          ],
          cards: [
            card("Job", job.jobId, "neutral", job.title),
            card("Current status", job.status, isOverdue ? "risk" : "warn", isOverdue ? "Overdue job selected" : "Open job selected"),
            card("Target date", job.dueDate, isOverdue ? "risk" : "neutral", "Original PMS due date"),
            card("Need from user", missing.length.toString(), "warn", missing.join(" and "))
          ]
        }
      );
    }

    return result(
      "Job completion workflow",
      `I prepared a completion draft for ${job.jobId}. The assistant captured the original target date, the spoken completion date, and the closure description. The next step is confirmation before the job status is changed to CLOSED.`,
      {
        transcript,
        tools: [
          toolTrace("get_job_detail(job_id)", `loaded ${job.jobId} with original due date ${job.dueDate}`),
          toolTrace("prepare_job_completion(job_id, completed_date, closure_notes)", `drafted closure for ${completionDate}`),
          toolTrace("update_job_status(job_id, CLOSED)", "held pending user confirmation")
        ],
        cards: [
          card("Job", job.jobId, "neutral", job.title),
          card("Original target date", job.dueDate, isOverdue ? "risk" : "neutral", isOverdue ? "Past due at time of closure" : "Closed within target window"),
          card("Completion date", completionDate, "good", "Captured from voice or text command"),
          card("Confirmation", "Required", "warn", "Status update will only happen after approval")
        ],
        draft: {
          actionType: "job_completion",
          title: "Job completion draft",
          status: "Pending confirmation before closing overdue job",
          fields: [
            ["Job", job.jobId],
            ["Vessel", job.vessel],
            ["Current status", job.status],
            ["Original target date", job.dueDate],
            ["Completion date", completionDate],
            ["Closure description", closureDescription]
          ]
        },
        insights: [
          "This is a high-value demo because it shows the assistant can safely move from read-only to controlled execution.",
          "The original due date stays visible, so the completion story remains audit-friendly even for overdue work."
        ]
      }
    );
  }

  if (text.includes("requisition") && (text.includes("raise") || text.includes("create"))) {
    const sourceJob = job || demoState.jobs.find((item) => item.jobId === "WO-24088");
    const newReqId = `REQ-${26050 + demoState.requisitions.length + 1}`;
    return result(
      "Requisition creation workflow",
      `I drafted requisition ${newReqId} linked to ${sourceJob.jobId}. This is the commercial sweet spot in the demo because it shows maintenance demand turning directly into procurement workflow.`,
      {
        transcript,
        tools: [
          toolTrace("get_job_detail(job_id)", `linked source ${sourceJob.jobId}`),
          toolTrace("create_requisition(source_job_id, line_items, req_type)", `draft ${newReqId}`)
        ],
        cards: [
          card("Requisition draft", newReqId, "warn", "Pending C/E approval"),
          card("Linked job", sourceJob.jobId, "neutral", sourceJob.title),
          card("Urgency", "URGENT", "warn", "Operational dependency"),
          card("Commercial value", "Cross-module", "good", "Job to stores to buyer workflow")
        ],
        draft: {
          title: "Requisition draft",
          status: "Pending C/E approval",
          fields: [
            ["Item", "Steering gear seal kit and O-rings"],
            ["Vessel", sourceJob.vessel],
            ["Estimated need date", sourceJob.dueDate],
            ["Auto link", "Corrective maintenance context preserved"]
          ]
        }
      }
    );
  }

  if (
    text.includes("urgent requisitions") ||
    text.includes("follow up") ||
    text.includes("procurement") ||
    text.includes("stalled requisitions") ||
    text.includes("critical requisitions")
  ) {
    const stale = demoState.requisitions.filter((item) => ["URGENT", "CRITICAL"].includes(item.reqType) && item.ageDays >= 7);
    return result(
      "Procurement follow-up",
      `I found ${stale.length} urgent or critical requisitions past the expected attention window. The key story for buyers is that the assistant can prioritize by vessel impact, not just age.`,
      {
        transcript,
        tools: [
          toolTrace("search_requisitions(req_type, status, age_days)", `returned ${stale.length} high-priority requisitions`),
          toolTrace("explain_procurement_delay(req_id)", "joined requisitions to job criticality and ETA risk")
        ],
        cards: [
          card("Stalled high-priority reqs", String(stale.length), "warn", "Above service threshold"),
          card("Jobs at risk", "1 critical", "risk", "Steering gear corrective work exposed"),
          card("Buyer action", "Escalate sourcing", "neutral", "Supplier follow-up or alternate quote"),
          card("Pitch angle", "Office ROI", "good", "Daily prioritization queue")
        ],
        table: buildTable(
          "Priority requisition queue",
          ["Req", "Vessel", "Title", "Type", "Status", "Age"],
          stale.map((item) => [item.reqId, item.vessel, item.title, item.reqType, item.status, `${item.ageDays} days`])
        )
      }
    );
  }

  if (
    text.includes("why is maintenance completion low") ||
    text.includes("analysis") ||
    text.includes("analytics") ||
    text.includes("job completion") ||
    text.includes("management summary")
  ) {
    return result(
      "Operational analytics",
      `Maintenance completion is low because the mock fleet has critical jobs held by material availability, plus one in-progress unplanned job consuming engine department attention. In production, the plugin would compute this deterministically from completion rate, backlog aging, blocking reasons, and requisition aging before generating the explanation.`,
      {
        transcript,
        tools: [
          toolTrace("search_jobs(vessel, period, status)", "loaded open, due, overdue, and in-progress jobs"),
          toolTrace("search_requisitions(source_job_id, status)", "connected blockers to procurement flow"),
          toolTrace("compute_completion_and_backlog_metrics()", "derived management narrative from facts")
        ],
        cards: [
          card("Completion rate", "91%", "warn", "Below 95% target"),
          card("Primary blocker", "Awaiting spares", "risk", "Cross-module cause"),
          card("Secondary factor", "Unplanned work", "warn", "Competes for manpower"),
          card("Management output", "Explainable", "good", "Facts separated from inference")
        ],
        insights: [
          "This is the analysis mode customers usually remember after the demo.",
          "The product should always compute the numbers in code, then let the model explain them."
        ]
      }
    );
  }

  if (text.includes("backlog")) {
    return result(
      "Backlog analysis",
      "The maintenance backlog in this demo is concentrated around critical jobs blocked by material availability. That means the best corrective action is not just more reminders, but tighter spare ordering and faster buyer escalation.",
      {
        transcript,
        tools: [
          toolTrace("search_overdue_jobs(age_bucket, critical_only)", "loaded current backlog exposure"),
          toolTrace("group_backlog_by_blocker()", "identified awaiting spares as the main bottleneck")
        ],
        cards: [
          card("Backlog driver", "Awaiting spares", "risk", "Primary blocking reason"),
          card("Critical exposure", "High", "warn", "Steering gear and compressor jobs are affected"),
          card("Best action", "Procurement escalation", "good", "Fastest way to reduce the backlog"),
          card("Story type", "Root cause", "neutral", "Good executive pitch scenario")
        ]
      }
    );
  }

  return result(
    "Exploratory query",
    `I recognized this as a free-form operations question, but this demo only contains scripted scenarios. In the live product, the orchestration layer would route the request through the same canonical tools using the ${connectorName} connector and ${roleName} policy set.`,
    {
      transcript,
      tools: [toolTrace("intent_router()", "no scripted handler for current phrasing")]
    }
  );
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    const extension = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[extension] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && parsedUrl.pathname === "/api/health") {
      sendJson(res, 200, { ok: true, status: "healthy", service: "harborops-fleet-copilot-demo" });
      return;
    }

    if (req.method === "GET" && parsedUrl.pathname === "/api/bootstrap") {
      sendJson(res, 200, {
        generatedAt: demoState.generatedAt,
        connectors: demoState.connectors,
        roles: demoState.roles,
        metrics: demoState.metrics,
        alerts: demoState.alerts,
        voiceConfig: {
          serverTranscriptionEnabled: Boolean(OPENAI_API_KEY),
          queryRoutingEnabled: Boolean(OPENAI_API_KEY),
          transcriptionModel: OPENAI_TRANSCRIBE_MODEL,
          languageModel: OPENAI_LANGUAGE_MODEL,
          modeLabel: OPENAI_API_KEY
            ? "Auto-detect dialect, translate to English, and route with AI"
            : "Browser fallback only until OPENAI_API_KEY is configured"
        },
        promptGroups: demoState.promptGroups,
        guidedStories: demoState.guidedStories,
        sampleCommands: [
          "What jobs are due on Meridian Pearl in the next 7 days?",
          "Read the instructions for WO-24051",
          "What critical overdue jobs are blocked by awaiting spares?",
          "Report a defect on purifier number 2 on Ocean Crest",
          "Postpone WO-24088 to 2026-05-30 because awaiting spares",
          "Close WO-24088 completed on 2026-05-26 with description steering gear seals renewed and leak test satisfactory",
          "Raise a requisition for steering gear O-rings linked to WO-24088",
          "Which urgent requisitions are older than 7 days?",
          "Why is maintenance completion low on Meridian Pearl?"
        ]
      });
      return;
    }

    if (req.method === "POST" && parsedUrl.pathname === "/api/transcribe") {
      const rawBody = await readBody(req);
      const body = rawBody ? JSON.parse(rawBody) : {};
      if (!body.audioBase64) {
        sendJson(res, 400, { ok: false, error: "audioBase64 is required" });
        return;
      }

      const voicePayload = await transcribeAudioToEnglish({
        audioBase64: body.audioBase64,
        mimeType: body.mimeType
      });

      sendJson(res, 200, {
        ok: true,
        ...voicePayload
      });
      return;
    }

    if (req.method === "POST" && parsedUrl.pathname === "/api/query") {
      const rawBody = await readBody(req);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const payload = await enrichQueryWithOpenAI({
        query: body.query,
        role: body.role,
        connector: body.connector
      });
      sendJson(res, 200, payload);
      return;
    }

    if (req.method === "GET" && parsedUrl.pathname === "/") {
      serveFile(res, path.join(DEMO_DIR, "index.html"));
      return;
    }

    if (req.method === "GET" && parsedUrl.pathname === "/PRODUCT_PRD_HARBOROPS_FLEET_COPILOT.md") {
      serveFile(res, PRD_PATH);
      return;
    }

    if (req.method === "GET") {
      const candidate = path.join(DEMO_DIR, parsedUrl.pathname.replace(/^\/+/, ""));
      if (candidate.startsWith(DEMO_DIR)) {
        serveFile(res, candidate);
        return;
      }
    }

    sendText(res, 404, "Not found", "text/plain; charset=utf-8");
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`HarborOps Fleet Copilot demo listening on port ${PORT}`);
});
