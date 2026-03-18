const nameInput = document.getElementById("resourceName");
const descInput = document.getElementById("resourceDescription");
const createBtn = document.getElementById("createBtn");

function isValidText(value) {
    const trimmed = value.trim();
    return trimmed.length > 0;
}

function validateForm() {
    const nameOk = isValidText(nameInput.value);
    const descOk = isValidText(descInput.value);

    nameInput.className = nameOk ? "valid" : "invalid";
    descInput.className = descOk ? "valid" : "invalid";

    createBtn.disabled = !(nameOk && descOk);
}

nameInput.addEventListener("input", validateForm);
descInput.addEventListener("input", validateForm);

export { isValidText };