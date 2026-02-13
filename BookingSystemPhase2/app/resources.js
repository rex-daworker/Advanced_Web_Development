import { validateText, setFieldState } from "./form.js";

// ===============================
// DOM references
// ===============================
const actions = document.getElementById("resourceActions");
const resourceNameContainer = document.getElementById("resourceNameContainer");
const resourceDescription = document.getElementById("resourceDescription");

let createButton = null;
let updateButton = null;
let deleteButton = null;

// ===============================
// Button helpers
// ===============================
const BUTTON_BASE =
  "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";
const BUTTON_ACTIVE =
  "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

function addButton(label, value) {
  const btn = document.createElement("button");
  btn.type = "submit";
  btn.name = "action";
  btn.value = value;
  btn.textContent = label;
  btn.className = `${BUTTON_BASE} ${BUTTON_ACTIVE}`;
  actions.appendChild(btn);
  return btn;
}

function setButtonEnabled(btn, enabled) {
  if (!btn) return;
  btn.disabled = !enabled;
  btn.classList.toggle("opacity-50", !enabled);
  btn.classList.toggle("cursor-not-allowed", !enabled);
}

// ===============================
// Render buttons
// ===============================
function renderButtons() {
  createButton = addButton("Create", "create");
  updateButton = addButton("Update", "update");
  deleteButton = addButton("Delete", "delete");

  setButtonEnabled(createButton, false);
  setButtonEnabled(updateButton, false);
  setButtonEnabled(deleteButton, false);
}

// ===============================
// Create resource name input
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
// Combined validation
// ===============================
function updateValidation() {
  const nameValid = validateText(resourceNameInput.value);
  const descValid = validateText(resourceDescription.value);

  setFieldState(resourceNameInput, nameValid);
  setFieldState(resourceDescription, descValid);

  const allValid = nameValid && descValid;
  setButtonEnabled(createButton, allValid);
}

// ===============================
// Bootstrapping
// ===============================
renderButtons();

const resourceNameInput = createResourceNameInput(resourceNameContainer);

resourceNameInput.addEventListener("input", updateValidation);
resourceDescription.addEventListener("input", updateValidation);

updateValidation();
