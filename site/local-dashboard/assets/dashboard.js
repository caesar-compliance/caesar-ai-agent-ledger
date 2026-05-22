const SAMPLE_PATH = "./data/sample-projection.json";

const state = {
  projection: null,
  eventType: "all",
  riskLevel: "all",
  search: "",
};

const ids = {
  version: document.getElementById("pkg-version"),
  summary: document.getElementById("summary"),
  runs: document.getElementById("runs"),
  events: document.getElementById("events"),
  approvals: document.getElementById("approvals"),
  toolCalls: document.getElementById("tool-calls"),
  risks: document.getElementById("risks"),
  errors: document.getElementById("errors"),
  eventType: document.getElementById("filter-event-type"),
  riskLevel: document.getElementById("filter-risk-level"),
  search: document.getElementById("filter-search"),
};

function byFilter(events) {
  return events.filter((event) => {
    if (state.eventType !== "all" && event.event_type !== state.eventType) return false;
    if (state.riskLevel !== "all" && event.risk_level !== state.riskLevel) return false;
    if (state.search.length > 0) {
      const needle = state.search.toLowerCase();
      const hay = `${event.run_id} ${event.event_id} ${event.event_type}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

function summarize(events) {
  const runIds = new Set(events.map((event) => event.run_id));
  return {
    total_events: events.length,
    total_runs: runIds.size,
    total_approvals: events.filter((event) => event.event_type.startsWith("approval_")).length,
    total_tool_calls: events.filter((event) => event.event_type.startsWith("tool_call_")).length,
    total_risks: events.filter((event) => ["high", "critical"].includes(event.risk_level)).length,
    total_errors: events.filter((event) => event.event_type === "error").length,
  };
}

function renderSummary(summary) {
  const rows = [
    ["Total Events", summary.total_events],
    ["Total Runs", summary.total_runs],
    ["Approvals", summary.total_approvals],
    ["Tool Calls", summary.total_tool_calls],
    ["Risks", summary.total_risks],
    ["Errors", summary.total_errors],
  ];

  ids.summary.innerHTML = rows
    .map(
      ([label, value]) =>
        `<article class="metric"><div class="value">${value}</div><div class="label">${label}</div></article>`,
    )
    .join("");
}

function renderTable(target, columns, rows) {
  if (rows.length === 0) {
    target.innerHTML = '<p class="empty">No rows for current filters.</p>';
    return;
  }

  const head = columns.map((column) => `<th>${column.label}</th>`).join("");
  const body = rows
    .map((row) => {
      const tds = columns
        .map((column) => {
          const value = row[column.key] ?? "";
          if (column.key === "risk_level") {
            return `<td class="risk-${value}">${value}</td>`;
          }
          return `<td>${String(value)}</td>`;
        })
        .join("");
      return `<tr>${tds}</tr>`;
    })
    .join("");

  target.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderSections(filteredEvents) {
  const approvals = filteredEvents.filter((event) => event.event_type.startsWith("approval_"));
  const toolCalls = filteredEvents.filter((event) => event.event_type.startsWith("tool_call_"));
  const risks = filteredEvents.filter((event) => ["high", "critical"].includes(event.risk_level));
  const errors = filteredEvents.filter((event) => event.event_type === "error");

  renderTable(
    ids.runs,
    [
      { key: "run_id", label: "Run ID" },
      { key: "event_count", label: "Events" },
      { key: "highest_risk_level", label: "Highest Risk" },
      { key: "first_event_at", label: "First Event" },
      { key: "last_event_at", label: "Last Event" },
    ],
    Object.values(
      filteredEvents.reduce((acc, event) => {
        if (!acc[event.run_id]) {
          acc[event.run_id] = {
            run_id: event.run_id,
            event_count: 0,
            highest_risk_level: event.risk_level,
            first_event_at: event.occurred_at,
            last_event_at: event.occurred_at,
          };
        }
        const row = acc[event.run_id];
        row.event_count += 1;
        if (["critical", "high", "medium", "low"].indexOf(event.risk_level) < ["critical", "high", "medium", "low"].indexOf(row.highest_risk_level)) {
          row.highest_risk_level = event.risk_level;
        }
        if (event.occurred_at < row.first_event_at) row.first_event_at = event.occurred_at;
        if (event.occurred_at > row.last_event_at) row.last_event_at = event.occurred_at;
        return acc;
      }, {}),
    ),
  );

  const commonColumns = [
    { key: "run_id", label: "Run ID" },
    { key: "event_id", label: "Event ID" },
    { key: "event_type", label: "Event Type" },
    { key: "risk_level", label: "Risk" },
    { key: "occurred_at", label: "Occurred At" },
    { key: "metadata_summary", label: "Summary" },
  ];

  renderTable(ids.events, commonColumns, filteredEvents);
  renderTable(ids.approvals, commonColumns, approvals);
  renderTable(ids.toolCalls, commonColumns, toolCalls);
  renderTable(ids.risks, commonColumns, risks);
  renderTable(ids.errors, commonColumns, errors);
}

function refresh() {
  if (!state.projection) return;
  const filteredEvents = byFilter(state.projection.events);
  renderSummary(summarize(filteredEvents));
  renderSections(filteredEvents);
}

function setupFilters(events) {
  const eventTypes = ["all", ...new Set(events.map((event) => event.event_type))];
  const riskLevels = ["all", ...new Set(events.map((event) => event.risk_level))];

  ids.eventType.innerHTML = eventTypes
    .map((value) => `<option value="${value}">${value}</option>`)
    .join("");
  ids.riskLevel.innerHTML = riskLevels
    .map((value) => `<option value="${value}">${value}</option>`)
    .join("");

  ids.eventType.addEventListener("change", () => {
    state.eventType = ids.eventType.value;
    refresh();
  });
  ids.riskLevel.addEventListener("change", () => {
    state.riskLevel = ids.riskLevel.value;
    refresh();
  });
  ids.search.addEventListener("input", () => {
    state.search = ids.search.value.trim();
    refresh();
  });
}

async function init() {
  const response = await fetch(SAMPLE_PATH);
  const projection = await response.json();
  state.projection = projection;
  ids.version.textContent = projection.package_version || "0.1.0";
  setupFilters(projection.events || []);
  refresh();
}

init().catch((error) => {
  ids.summary.innerHTML = `<article class="metric"><div class="value">ERR</div><div class="label">${error.message}</div></article>`;
});
