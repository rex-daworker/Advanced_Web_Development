// FORM VALIDATION LOGIC

const nameInput = document.getElementById("resourceName");
const descInput = document.getElementById("resourceDescription");
const createBtn = document.getElementById("createBtn");

// Basic text validation
function isValidText(value) {
    const trimmed = value.trim();
    return trimmed.length > 0;
}

// Update UI + button state
function validateForm() {
    const nameOk = isValidText(nameInput.value);
    const descOk = isValidText(descInput.value);

    nameInput.className = nameOk ? "valid" : "invalid";
    descInput.className = descOk ? "valid" : "invalid";

    createBtn.disabled = !(nameOk && descOk);
}

// Attach listeners
nameInput.addEventListener("input", validateForm);
descInput.addEventListener("input", validateForm);

// Export validation for resources.js
export { isValidText };