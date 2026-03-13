import { validateText, setFieldState } from "./form.js";

// ===============================
// DOM references
// ===============================
const actions = document.getElementById("resourceActions");
const resourceNameContainer = document.getElementById("resourceNameContainer");
const resourceDescription = document.getElementById("resourceDescription");
const priceInput = document.getElementById("resourcePrice");
const form = document.getElementById("resourceForm");

const role = "admin";   // ← you may want to make this dynamic later

let createButton = null;
let updateButton = null;
let deleteButton = null;

// ===============================
// Button helpers
// ===============================
const BUTTON_BASE_CLASSES =
  "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";

const BUTTON_ENABLED_CLASSES =
  "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

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
  btn.classList.toggle("cursor-not-allowed", !enabled);
  btn.classList.toggle("opacity-50", !enabled);
}

// ===============================
// Render buttons
// ===============================
function renderActionButtons(currentRole) {
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

  // start disabled
  setButtonEnabled(createButton, false);
  setButtonEnabled(updateButton, false);
  setButtonEnabled(deleteButton, false);
}

// ===============================
// Create name input dynamically
// ===============================
function createResourceNameInput(container) {
  const input = document.createElement("input");

  input.id = "resourceName";
  input.name = "resourceName";
  input.type = "text";
  input.placeholder = "e.g., Meeting Room A";

  input.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white
    px-4 py-3 text-sm outline-none
    focus:ring-2 transition-all duration-200 ease-out
  `;

  container.appendChild(input);
  return input;
}

// ===============================
// Price validation
// ===============================
function isValidPrice() {
  if (!priceInput) return true;
  const val = priceInput.value.trim();
  if (val === "") return true;           // empty → free → allowed
  const num = parseFloat(val);
  return !isNaN(num) && num >= 0;
}

function setPriceFieldState() {
  if (!priceInput) return;
  const valid = isValidPrice();
  setFieldState(priceInput, valid);
}

// ===============================
// Combined validation & button state
// ===============================
function updateActionButtonsState() {
  const nameValid  = validateText(resourceNameInput.value);
  const descValid  = validateText(resourceDescription.value);
  const priceValid = isValidPrice();

  setFieldState(resourceNameInput,  nameValid);
  setFieldState(resourceDescription, descValid);
  setPriceFieldState();

  const formIsValid = nameValid && descValid && priceValid;

  setButtonEnabled(createButton,  formIsValid);
  setButtonEnabled(updateButton,  formIsValid);
  setButtonEnabled(deleteButton,  formIsValid);
}

// ===============================
// Attach validation listeners
// ===============================
function attachValidation(input) {
  input.addEventListener("input", updateActionButtonsState);
}

// ===============================
// Bootstrapping
// ===============================
renderActionButtons(role);

const resourceNameInput = createResourceNameInput(resourceNameContainer);

attachValidation(resourceNameInput);
attachValidation(resourceDescription);
priceInput?.addEventListener("input", updateActionButtonsState);

// Initialize state
updateActionButtonsState();

// ===============================
// Form submit handling (real backend version)
// ===============================
async function handleSubmit(e) {
  e.preventDefault();

  const submitter = e.submitter || null;
  const action = submitter?.value || "create";

  const name = resourceNameInput.value.trim();
  const description = resourceDescription.value.trim();

  const nameValid  = validateText(name);
  const descValid  = validateText(description);
  const priceValid = isValidPrice();

  if (!nameValid || !descValid || !priceValid) {
    updateActionButtonsState(); // refresh visual state
    return;
  }

  const availableEl = document.getElementById("resourceAvailable");
  const priceValue = priceInput?.value.trim() || "0";
  const price = parseFloat(priceValue) || 0;
  const priceUnit = form.querySelector('input[name="resourcePriceUnit"]:checked')?.value || "hour";

  const payload = {
    action,
    name,
    description,
    available: availableEl?.checked ?? false,
    price,
    priceUnit,
  };

  try {
    const method = action === "create" ? "POST" : action === "update" ? "PUT" : "DELETE";
    const res = await fetch("/api/resources", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Save failed:", res.status, text);
      alert(`Failed to save resource (HTTP ${res.status}). Check console.`);
      return;
    }

    alert(`Resource ${action}d successfully.`);
    
    if (action === "create") {
      form.reset();
      updateActionButtonsState();
    }

  } catch (err) {
    console.error("Submit error:", err);
    alert("Network or unexpected error occurred. See console.");
  }
}

if (form) form.addEventListener("submit", handleSubmit);