const actions = document.getElementById("resourceActions");
const resourceNameCnt = document.getElementById("resourceNameCnt");
const resourceDescriptionCnt = document.getElementById("resourceDescriptionCnt");
const resourceList = document.getElementById("resourceList");
const hiddenId = document.getElementById("resourceId");

let createButton, updateButton, deleteButton;

// ===============================
// Buttons
// ===============================
function addButton(label, value) {
  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = label;
  btn.value = value;
  btn.name = "action";
  btn.className =
    "w-full rounded-2xl px-6 py-3 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-dark/80 transition-all";
  actions.appendChild(btn);
  return btn;
}

function setButtonEnabled(btn, enabled) {
  btn.disabled = !enabled;
  btn.classList.toggle("opacity-50", !enabled);
  btn.classList.toggle("cursor-not-allowed", !enabled);
}

// ===============================
// Inputs
// ===============================
function createResourceNameInput(container) {
  const input = document.createElement("input");
  input.id = "resourceName";
  input.name = "resourceName";
  input.type = "text";
  input.placeholder = "e.g., Meeting Room A";
  input.className =
    "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm";
  container.appendChild(input);
  return input;
}

function createResourceDescriptionArea(container) {
  const textarea = document.createElement("textarea");
  textarea.id = "resourceDescription";
  textarea.name = "resourceDescription";
  textarea.rows = 5;
  textarea.placeholder = "Describe location, capacity, equipment…";
  textarea.className =
    "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm";
  container.appendChild(textarea);
  return textarea;
}

// ===============================
// Validation
// ===============================
function isNameValid(v) {
  return /^[a-zA-Z0-9äöåÄÖÅ ]+$/.test(v.trim()) &&
    v.trim().length >= 5 &&
    v.trim().length <= 30;
}

function isDescValid(v) {
  return /^[a-zA-Z0-9äöåÄÖÅ ]+$/.test(v.trim()) &&
    v.trim().length >= 10 &&
    v.trim().length <= 50;
}

function attachValidation(input, validator) {
  input.addEventListener("input", updateButtonStates);
}

function updateButtonStates() {
  const name = document.getElementById("resourceName").value;
  const desc = document.getElementById("resourceDescription").value;

  setButtonEnabled(createButton, isNameValid(name) && isDescValid(desc));
}

// ===============================
// Resource list
// ===============================
async function loadResources() {
  const res = await fetch("/api/resources");
  const list = await res.json();

  resourceList.innerHTML = "";

  list.forEach(r => {
    const item = document.createElement("div");
    item.className = "p-3 border rounded-xl cursor-pointer hover:bg-gray-100";
    item.textContent = `${r.name} (${r.unit}, ${r.price}€)`;
    item.onclick = () => fillForm(r);
    resourceList.appendChild(item);
  });
}

function fillForm(r) {
  document.getElementById("resourceName").value = r.name;
  document.getElementById("resourceDescription").value = r.description;
  document.getElementById("resourceAvailable").checked = r.available;
  document.getElementById("resourcePrice").value = r.price;
  document.querySelector(`input[value="${r.unit}"]`).checked = true;

  hiddenId.value = r.id;

  setButtonEnabled(updateButton, true);
  setButtonEnabled(deleteButton, true);
}

// ===============================
// Bootstrapping
// ===============================
createButton = addButton("Create", "create");
updateButton = addButton("Update", "update");
deleteButton = addButton("Delete", "delete");

setButtonEnabled(createButton, false);
setButtonEnabled(updateButton, false);
setButtonEnabled(deleteButton, false);

const nameInput = createResourceNameInput(resourceNameCnt);
const descInput = createResourceDescriptionArea(resourceDescriptionCnt);

attachValidation(nameInput, isNameValid);
attachValidation(descInput, isDescValid);

loadResources();
