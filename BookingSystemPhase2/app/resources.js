import { validateText, setFieldState } from "./form.js";

// ===============================
// DOM references
// ===============================
const actions = document.getElementById("resourceActions");
const resourceNameContainer = document.getElementById("resourceNameContainer");
const resourceDescription = document.getElementById("resourceDescription");
const form = document.getElementById("resourceForm");

const role = "admin";

let createButton = null;
// let updateButton = null;   // commented out – not used yet
// let deleteButton = null;


// ===============================
// Button styling
const BUTTON_BASE_CLASSES = "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";
const BUTTON_ENABLED_CLASSES = "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";
const BUTTON_DISABLED_CLASSES = "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60";

// ===============================
// Button helpers

function addButton({ label, type = "button", value, enabled = false }) {
  const btn = document.createElement("button");
  btn.type = type;
  btn.textContent = label;
  btn.name = "action";
  if (value) btn.value = value;

  btn.className = `${BUTTON_BASE_CLASSES} ${enabled ? BUTTON_ENABLED_CLASSES : BUTTON_DISABLED_CLASSES}`;
  btn.disabled = !enabled;

  actions.appendChild(btn);
  return btn;
}

function setButtonEnabled(btn, enabled) {
  if (!btn) return;
  btn.disabled = !enabled;
  btn.className = `${BUTTON_BASE_CLASSES} ${enabled ? BUTTON_ENABLED_CLASSES : BUTTON_DISABLED_CLASSES}`;
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
      enabled: false, // starts disabled
    });

    // You can add update & delete later when selection logic exists
  }
}

// Create name input dynamically
function createResourceNameInput(container) {
  const input = document.createElement("input");
  input.id = "resourceName";
  input.name = "resourceName";
  input.type = "text";
  input.placeholder = "e.g., Meeting Room A";
  input.required = true;

  input.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white
    px-4 py-3 text-sm outline-none
    focus:ring-2 focus:ring-brand-blue/30 transition-all duration-200 ease-out
  `;

  container.appendChild(input);
  return input;
}

// Validation & button state
let resourceNameInput; // will be set later

function updateCreateButton() {
  if (!resourceNameInput || !resourceDescription) return;

  const nameValid = validateText(resourceNameInput.value);
  const descValid = validateText(resourceDescription.value);

  setFieldState(resourceNameInput, nameValid);
  setFieldState(resourceDescription, descValid);

  setButtonEnabled(createButton, nameValid && descValid);
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
// Combined validation for BOTH fields
// ===============================
function updateCreateButton() {
  const nameValid = validateText(resourceNameInput.value);
  const descValid = validateText(resourceDescription.value);

  setFieldState(resourceNameInput, nameValid);
  setFieldState(resourceDescription, descValid);

  setButtonEnabled(createButton, nameValid && descValid);
}

// ===============================
// Attach validation to each field
// ===============================
// Attach listeners
function attachValidation(input) {
  if (!input) return;
  input.addEventListener("input", updateCreateButton);
  input.addEventListener("blur", updateCreateButton); // also on focus out
}

// Initialization
renderActionButtons(role);

resourceNameInput = createResourceNameInput(resourceNameContainer);

attachValidation(resourceNameInput);
attachValidation(resourceDescription);

// Initial check
updateCreateButton();

// Form submit
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitter = e.submitter;
    const action = submitter?.value ?? "create";

    if (action !== "create") {
      alert("Only Create is implemented in this phase.");
      return;
    }

    const name = resourceNameInput.value.trim();
    const description = resourceDescription.value.trim();

    const nameValid = validateText(name);
    const descValid = validateText(description);

    // Final check before send
    if (!nameValid || !descValid) {
      updateCreateButton(); // refresh visuals
      alert("Please fill in both name and description correctly.");
      return;
    }

    // Optional extra fields (safe defaults if missing)
    const available = document.getElementById("resourceAvailable")?.checked ?? false;
    const priceStr = document.getElementById("resourcePrice")?.value ?? "0";
    const price = priceStr !== "" ? Number(priceStr) : 0;
    const priceUnit = form.querySelector('input[name="resourcePriceUnit"]:checked')?.value ?? "hour";

    const payload = {
      name,
      description,
      available,
      price,
      priceUnit,
      action,
    };

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = await res.text().catch(() => "Server error");
        alert(`Error: ${res.status} – ${msg}`);
        return;
      }

      alert("Resource created successfully!");
      form.reset();
      updateCreateButton(); // disable button again

    } catch (err) {
      console.error(err);
      alert("Network error – could not save resource.");
    }
  });
}