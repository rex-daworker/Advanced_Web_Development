import { validateText, setFieldState } from "./form.js";

// ===============================
// Configuration & Constants
// ===============================
const ROLE = "admin";

const BUTTON_BASE_CLASSES = "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";
const BUTTON_ENABLED_CLASSES = "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";
const BUTTON_DISABLED_CLASSES = "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60";

// ===============================
// DOM References
// ===============================
const actionsContainer = document.getElementById("resourceActions");
const resourceNameContainer = document.getElementById("resourceNameContainer");
const resourceDescription = document.getElementById("resourceDescription");
const form = document.getElementById("resourceForm");

// ===============================
// State Management
// ===============================
let createButton = null;
let resourceNameInput = null;

// ===============================
// UI Component Helpers
// ===============================

/**
 * Creates and appends a styled button to the actions container.
 */
function addButton({ label, type = "button", value, enabled = false }) {
  const btn = document.createElement("button");
  btn.type = type;
  btn.textContent = label;
  btn.name = "action";
  
  if (value) {
    btn.value = value;
  }

  // Apply initial classes
  btn.className = `${BUTTON_BASE_CLASSES} ${enabled ? BUTTON_ENABLED_CLASSES : BUTTON_DISABLED_CLASSES}`;
  btn.disabled = !enabled;

  actionsContainer.appendChild(btn);
  return btn;
}

/**
 * Toggles the enabled state and styling of a button.
 */
function setButtonEnabled(btn, enabled) {
  if (!btn) return;
  btn.disabled = !enabled;
  btn.className = `${BUTTON_BASE_CLASSES} ${enabled ? BUTTON_ENABLED_CLASSES : BUTTON_DISABLED_CLASSES}`;
}

/**
 * Creates the name input field dynamically.
 */
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

/**
 * Renders action buttons based on the user role.
 */
function renderActionButtons(currentRole) {
  if (currentRole === "admin") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      value: "create",
      enabled: false, // starts disabled
    });
    // Future: Add update & delete buttons here
  }
}

// ===============================
// Validation Logic
// ===============================

/**
 * Validates inputs and updates the UI state (field borders and button status).
 */
function updateCreateButton() {
  // Safety check to ensure elements exist before accessing .value
  if (!resourceNameInput || !resourceDescription) return;

  const nameValid = validateText(resourceNameInput.value);
  const descValid = validateText(resourceDescription.value);

  setFieldState(resourceNameInput, nameValid);
  setFieldState(resourceDescription, descValid);

  setButtonEnabled(createButton, nameValid && descValid);
}

/**
 * Attaches validation event listeners to an input element.
 */
function attachValidation(input) {
  if (!input) return;
  input.addEventListener("input", updateCreateButton);
  input.addEventListener("blur", updateCreateButton);
}

// ===============================
// Initialization
// ===============================

// 1. Render Buttons
renderActionButtons(ROLE);

// 2. Create Dynamic Inputs
resourceNameInput = createResourceNameInput(resourceNameContainer);

// 3. Attach Listeners
attachValidation(resourceNameInput);
attachValidation(resourceDescription);

// 4. Initial State Check
updateCreateButton();

// ===============================
// Event Handlers
// ===============================

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

    // Final check before sending
    if (!nameValid || !descValid) {
      updateCreateButton(); // refresh visuals
      alert("Please fill in both name and description correctly.");
      return;
    }

    // Retrieve optional extra fields (with safe defaults)
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
