// ===============================
// Form handling for resources page
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

// Timestamp
function timestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').replace('Z', '');
}

// ===============================
// 1) DOM references
// ===============================
const actions = document.getElementById("resourceActions");
const resourceNameCnt = document.getElementById("resourceNameCnt");
const resourceDescriptionCnt = document.getElementById("resourceDescriptionCnt");
// Example roles
const role = "admin"; // "reserver" | "admin"

// Will hold a reference to the Create button so we can enable/disable it
let createButton = null;

// Resource name and description validation status
let resourceNameValid = false
let resourceDescriptionValid = false

// ===============================
// 2) Button creation helpers
// ===============================

const BUTTON_BASE_CLASSES =
  "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";

const BUTTON_ENABLED_CLASSES =
  "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

const BUTTON_DISABLED_CLASSES =
  "cursor-not-allowed opacity-50";

function addButton({ label, type = "button", value, classes = "" }) {
  const btn = document.createElement("button");
  btn.type = type;
  btn.textContent = label;
  btn.name = "action";
  if (value) btn.value = value;

  btn.className = `${BUTTON_BASE_CLASSES} ${classes}`.trim();

  actions.appendChild(btn);
  return btn;
}

function setButtonEnabled(btn, enabled) {
  if (!btn) return;

  btn.disabled = !enabled;

  // Keep disabled look in ONE place (here)
  btn.classList.toggle("cursor-not-allowed", !enabled);
  btn.classList.toggle("opacity-50", !enabled);

  // Optional: remove hover feel when disabled (recommended UX)
  if (!enabled) {
    btn.classList.remove("hover:bg-brand-dark/80");
  } else {
    // Only re-add if this button is supposed to have it
    // (for Create we know it is)
    if (btn.value === "create" || btn.textContent === "Create") {
      btn.classList.add("hover:bg-brand-dark/80");
    }
  }
}

function renderActionButtons(currentRole) {
  if (currentRole === "reserver") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      classes: BUTTON_ENABLED_CLASSES,
    });
  }

  if (currentRole === "admin") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      value: "create",
      classes: BUTTON_ENABLED_CLASSES,
    });

    updateButton = addButton({
      label: "Update",
      value: "update",
      classes: BUTTON_ENABLED_CLASSES,
    });

    deleteButton = addButton({
      label: "Delete",
      value: "delete",
      classes: BUTTON_ENABLED_CLASSES,
    });
  }

  // Default: Buttons are disabled until validation says it's OK
  setButtonEnabled(createButton, false);
  setButtonEnabled(updateButton, false);
  setButtonEnabled(deleteButton, false);
}

// ===============================
// 3) Input creation + validation
// ===============================
function createResourceNameInput(container) {
  const input = document.createElement("input");

  // Core attributes
  input.id = "resourceName";
  input.name = "resourceName";
  input.type = "text";
  input.placeholder = "e.g., Meeting Room A";

  // Base Tailwind styling (single source of truth)
  input.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white
    px-4 py-3 text-sm outline-none
    focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30
    transition-all duration-200 ease-out
  `;

  container.appendChild(input);
  return input;
}

function isResourceNameValid(value) {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;  // very lenient
}

function isResourceDescriptionValid(value) {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 200;
}

function createResourceDescriptionArea(container) {
  const textarea = document.createElement("textarea");

  // Core attributes
  textarea.id = "resourceDescription";
  textarea.name = "resourceDescription";
  textarea.rows = 5;
  textarea.placeholder =
    "Describe location, capacity, included equipment, or any usage notes…";

  // Base Tailwind styling (single source of truth)
  textarea.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none
    focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 transition-all duration-200 ease-out
  `;

  container.appendChild(textarea);
  return textarea;
}

function setInputVisualState(input, state) {
  // Reset to neutral base state (remove only our own validation-related classes)
  input.classList.remove(
    "border-green-500",
    "bg-green-100",
    "focus:ring-green-500/30",
    "border-red-500",
    "bg-red-100",
    "focus:ring-red-500/30",
    "focus:border-brand-blue",
    "focus:ring-brand-blue/30"
  );

  // Ensure base focus style is present when neutral
  input.classList.add("focus:ring-2");

  if (state === "valid") {
    input.classList.add("border-green-500", "bg-green-100", "focus:ring-green-500/30");
  } else if (state === "invalid") {
    input.classList.add("border-red-500", "bg-red-100", "focus:ring-red-500/30");
  } else {
    // neutral: keep base border/bg; nothing else needed
  }
}

function attachResourceNameValidation(input) {
  const update = () => {
    const raw = input.value;
    if (raw.trim() === "") {
      setInputVisualState(input, "neutral");
      setButtonEnabled(createButton, false);
      return;
    }

    resourceNameValid = isResourceNameValid(raw);

    setInputVisualState(input, resourceNameValid ? "valid" : "invalid");
    setButtonEnabled(createButton, resourceNameValid && resourceDescriptionValid);
  };

  // Real-time validation
  input.addEventListener("input", update);

  // Initialize state on page load (Create disabled until valid)
  update();
}

function attachResourceDescriptionValidation(input) {
  const update = () => {
    const raw = input.value;
    if (raw.trim() === "") {
      setInputVisualState(input, "neutral");
      setButtonEnabled(createButton, false);
      return;
    }

    resourceDescriptionValid = isResourceDescriptionValid(raw);

    setInputVisualState(input, resourceDescriptionValid ? "valid" : "invalid");
    setButtonEnabled(createButton, resourceNameValid && resourceDescriptionValid);
  };

  // Real-time validation
  input.addEventListener("input", update);

  // Initialize state on page load (Create disabled until valid)
  update();
}

// ===============================
// 4) Bootstrapping — MODIFIED MINIMALLY
// ===============================

// Still render buttons (keeping your admin/reserver logic)
renderActionButtons(role);

// Use EXISTING inputs from HTML instead of creating them
const resourceNameInput = document.getElementById("resourceName");
const resourceDescriptionArea = document.getElementById("resourceDescription");

// Attach validation ONLY if the elements exist
if (resourceNameInput && resourceDescriptionArea) {
    attachResourceNameValidation(resourceNameInput);
    attachResourceDescriptionValidation(resourceDescriptionArea);
} else {
    console.error("Required input fields not found in HTML");
}

// -------------- Form wiring --------------
document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");
  form.addEventListener("submit", onSubmit);
});

async function onSubmit(event) {
  event.preventDefault();

  // ────────────────────────────────────────────────
  // Added: basic client-side guard + trimming
  // ────────────────────────────────────────────────
  const nameRaw = $("resourceName")?.value ?? "";
  const descRaw = $("resourceDescription")?.value ?? "";

  const nameTrimmed = nameRaw.trim();
  const descTrimmed = descRaw.trim();

  if (nameTrimmed === "" || descTrimmed === "") {
    alert("Name and description are required.");
    return; // prevent sending bad data
  }
  // ────────────────────────────────────────────────

  const submitter = event.submitter;
  const actionValue = submitter && submitter.value ? submitter.value : "create";
  const selectedUnit = document.querySelector('input[name="resourcePriceUnit"]:checked')?.value ?? "";
  const priceRaw = $("resourcePrice")?.value ?? "";
  const resourcePrice = priceRaw === "" ? 0 : Number(priceRaw);

  const payload = {
    action: actionValue,
    resourceName: nameTrimmed,          // ← now trimmed
    resourceDescription: descTrimmed,   // ← now trimmed
    resourceAvailable: $("resourceAvailable")?.checked ?? false,
    resourcePrice,
    resourcePriceUnit: selectedUnit
  };

  try {
    console.log("--------------------------");
    console.log("The request send to the server " + `[${timestamp()}]`);
    console.log("--------------------------");
    const response = await fetch("/api/resources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} ${response.statusText}\n${text}`);
    }

    // Creates an alert and a log message
    const data = await response.json();
    let msg = "Server response " + `[${timestamp()}]\n`;
    msg += "--------------------------\n";
    msg += "Status ➡️ " + response.status + "\n";
    msg += "Action ➡️ " + data.echo.action + "\n";
    msg += "Name ➡️ "+ data.echo.resourceName + "\n";
    msg += "Description ➡️ " + data.echo.resourceDescription + "\n";
    msg += "Availability ➡️ " + data.echo.resourceAvailable + "\n";
    msg += "Price unit ➡️ " + data.echo.resourcePriceUnit + "\n";

    console.log("Server response " + `[${timestamp()}]`);
    console.log("--------------------------");
    console.log("Status ➡️ ", response.status);
    console.log("Action ➡️ ", data.echo.action);
    console.log("Name ➡️ ", data.echo.resourceName);
    console.log("Description ➡️ ", data.echo.resourceDescription);
    console.log("Availability ➡️ ", data.echo.resourceAvailable);
    console.log("Price ➡️ ", data.echo.resourcePrice);

    console.log("--------------------------");
    alert(msg);

  } catch (err) {
    console.error("POST error:", err);
  }
}