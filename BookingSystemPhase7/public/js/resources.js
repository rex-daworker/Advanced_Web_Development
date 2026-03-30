// =====================================================
// resources.js - FIXED VERSION (No early throw)
// =====================================================

import { initAuthUI, getUserRole, requireAuthOrBlockPage, logout } from "./auth-ui.js";

initAuthUI();
requireAuthOrBlockPage();   // Safe version - no throw
window.logout = logout;

// =====================================================
// DOM references
// =====================================================
const actions = document.getElementById("resourceActions");
const resourceNameCnt = document.getElementById("resourceNameCnt");
const resourceDescriptionCnt = document.getElementById("resourceDescriptionCnt");
const resourceIdInput = document.getElementById("resourceId");
const resourceListEl = document.getElementById("resourceList");

const role = getUserRole() || "reserver";

let createButton = null;
let updateButton = null;
let deleteButton = null;
let primaryActionButton = null;
let clearButton = null;

let resourceNameInput = null;
let resourceDescriptionArea = null;

let resourceNameValid = false;
let resourceDescriptionValid = false;
let formMode = "create";
let resourcesCache = [];
let selectedResourceId = null;
let originalState = null;
let originalStateChanged = [false, false, false, false, false];

// =====================================================
// Button helpers
// =====================================================
const BUTTON_BASE_CLASSES = "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";
const BUTTON_ENABLED_CLASSES = "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

function addButton({ label, type = "button", value, classes = "" }) {
    const btn = document.createElement("button");
    btn.type = type;
    btn.textContent = label;
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

function renderActionButtons(currentRole) {
    actions.innerHTML = "";
    if (currentRole === "manager" && formMode === "create") {
        createButton = addButton({ label: "Create", type: "submit", value: "create", classes: BUTTON_ENABLED_CLASSES });
        clearButton = addButton({ label: "Clear", type: "button", classes: BUTTON_ENABLED_CLASSES });
        setButtonEnabled(createButton, false);
        primaryActionButton = createButton;
        clearButton.addEventListener("click", () => {
            clearResourceForm();
            clearFormMessage();
        });
    }
    if (currentRole === "manager" && formMode === "edit") {
        updateButton = addButton({ label: "Update", type: "submit", value: "update", classes: BUTTON_ENABLED_CLASSES });
        deleteButton = addButton({ label: "Delete", type: "submit", value: "delete", classes: BUTTON_ENABLED_CLASSES });
        setButtonEnabled(updateButton, false);
        primaryActionButton = updateButton;
    }
}

// =====================================================
// Input creation + validation
// =====================================================
function createResourceNameInput(container) {
    const input = document.createElement("input");
    input.id = "resourceName";
    input.type = "text";
    input.placeholder = "e.g., Meeting Room A";
    input.className = `mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 transition-all duration-200 ease-out`;
    container.appendChild(input);
    return input;
}

function createResourceDescriptionArea(container) {
    const textarea = document.createElement("textarea");
    textarea.id = "resourceDescription";
    textarea.rows = 5;
    textarea.placeholder = "Describe location, capacity, included equipment, or any usage notes…";
    textarea.className = `mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 transition-all duration-200 ease-out`;
    container.appendChild(textarea);
    return textarea;
}

function isResourceNameValid(value) {
    const trimmed = value.trim();
    const allowedPattern = /^[a-zA-Z0-9äöåÄÖÅ \,\.\-]+$/;
    return trimmed.length >= 5 && trimmed.length <= 30 && allowedPattern.test(trimmed);
}

function isResourceDescriptionValid(value) {
    const trimmed = value.trim();
    const allowedPattern = /^[a-zA-Z0-9äöåÄÖÅ \,\.\-]+$/;
    return trimmed.length >= 10 && trimmed.length <= 50 && allowedPattern.test(trimmed);
}

function setInputVisualState(input, state) {
    input.classList.remove("border-green-500", "bg-green-100", "focus:ring-green-500/30", "border-red-500", "bg-red-100", "focus:ring-red-500/30");
    if (state === "valid") input.classList.add("border-green-500", "bg-green-100", "focus:ring-green-500/30");
    else if (state === "invalid") input.classList.add("border-red-500", "bg-red-100", "focus:ring-red-500/30");
}

function attachResourceNameValidation(input) {
    const update = () => {
        const raw = input.value;
        resourceNameValid = isResourceNameValid(raw);
        setInputVisualState(input, resourceNameValid ? "valid" : "invalid");
        refreshPrimaryButtonState();
    };
    input.addEventListener("input", update);
    update();
}

function attachResourceDescriptionValidation(input) {
    const update = () => {
        const raw = input.value;
        resourceDescriptionValid = isResourceDescriptionValid(raw);
        setInputVisualState(input, resourceDescriptionValid ? "valid" : "invalid");
        refreshPrimaryButtonState();
    };
    input.addEventListener("input", update);
    update();
}

function refreshPrimaryButtonState() {
    const valid = resourceNameValid && resourceDescriptionValid;
    if (primaryActionButton) {
        setButtonEnabled(primaryActionButton, valid);
    }
}

function clearResourceForm() {
    if (resourceNameInput) resourceNameInput.value = "";
    if (resourceDescriptionArea) resourceDescriptionArea.value = "";
    resourceNameValid = false;
    resourceDescriptionValid = false;
    if (createButton) setButtonEnabled(createButton, false);
}

function clearFormMessage() {
    const msg = document.getElementById("formMessage");
    if (msg) {
        msg.textContent = "";
        msg.classList.add("hidden");
    }
}

// List rendering and selection (simplified from your original)
function renderResourceList(resources) {
    if (!resourceListEl) return;
    resourceListEl.innerHTML = resources.map(r => `
        <button type="button" data-resource-id="${r.id}" class="w-full text-left rounded-2xl border border-black/10 bg-white px-4 py-3 transition hover:bg-black/5">
            <div class="font-semibold truncate">${r.name}</div>
        </button>
    `).join("");

    resourceListEl.querySelectorAll("[data-resource-id]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.resourceId);
            const resource = resourcesCache.find(x => Number(x.id) === id);
            if (resource) selectResource(resource);
        });
    });
}

function selectResource(resource) {
    originalState = resource;
    resourceIdInput.value = resource.id;
    resourceNameInput.value = resource.name || "";
    resourceDescriptionArea.value = resource.description || "";
    formMode = "edit";
    renderActionButtons(role);
}

// Load resources
async function loadResources() {
    try {
        const res = await fetch("/api/resources");
        const body = await res.json();
        resourcesCache = Array.isArray(body.data) ? body.data : [];
        renderResourceList(resourcesCache);
    } catch (err) {
        console.error(err);
    }
}

// =====================================================
// Bootstrapping
// =====================================================
renderActionButtons(role);

resourceNameInput = createResourceNameInput(resourceNameCnt);
attachResourceNameValidation(resourceNameInput);

resourceDescriptionArea = createResourceDescriptionArea(resourceDescriptionCnt);
attachResourceDescriptionValidation(resourceDescriptionArea);

loadResources();

// Callback from form.js
window.onResourceActionSuccess = async () => {
    clearResourceForm();
    formMode = "create";
    renderActionButtons(role);
    await loadResources();
};