// ===============================
// 0) Authorization
// ===============================
import { initAuthUI, getUserRole, requireAuthOrBlockPage, logout } from "./auth-ui.js";

initAuthUI();
if (!requireAuthOrBlockPage()) {
    throw new Error("Authentication required");
}

window.logout = logout;

// ===============================
// 1) DOM references
// ===============================
const actions = document.getElementById("reservationActions");
const resourceIdCnt = document.getElementById("resourceIdCnt");
const userIdCnt = document.getElementById("userIdCnt");
const startTimeCnt = document.getElementById("startTimeCnt");
const endTimeCnt = document.getElementById("endTimeCnt");
const noteCnt = document.getElementById("noteCnt");
const statusCnt = document.getElementById("statusCnt");
const reservationIdInput = document.getElementById("reservationId");
const reservationListEl = document.getElementById("reservationList");

const role = getUserRole();
let formMode = "create";
let reservationsCache = [];
let selectedReservationId = null;

// ===============================
// 2) Button creation (same style as resources)
// ===============================
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

function renderActionButtons(currentRole) {
    actions.innerHTML = "";
    if (formMode === "create") {
        addButton({ label: "Create", type: "submit", value: "create", classes: BUTTON_ENABLED_CLASSES });
        const clearBtn = addButton({ label: "Clear", type: "button", classes: BUTTON_ENABLED_CLASSES });
        clearBtn.addEventListener("click", clearReservationForm);
    }
    if (formMode === "edit") {
        addButton({ label: "Update", type: "submit", value: "update", classes: BUTTON_ENABLED_CLASSES });
        addButton({ label: "Delete", type: "submit", value: "delete", classes: BUTTON_ENABLED_CLASSES });
    }
}

// ===============================
// 3) Dynamic input creation
// ===============================
function createNumberInput(container, id, placeholder) {
    const input = document.createElement("input");
    input.id = id;
    input.type = "number";
    input.placeholder = placeholder;
    input.className = "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 transition-all";
    container.appendChild(input);
    return input;
}

function createDateTimeInput(container, id) {
    const input = document.createElement("input");
    input.id = id;
    input.type = "datetime-local";
    input.className = "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 transition-all";
    container.appendChild(input);
    return input;
}

function createTextarea(container, id) {
    const ta = document.createElement("textarea");
    ta.id = id;
    ta.rows = 3;
    ta.className = "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 transition-all";
    container.appendChild(ta);
    return ta;
}

function createSelect(container, id, options) {
    const select = document.createElement("select");
    select.id = id;
    select.className = "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 transition-all";
    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
    });
    container.appendChild(select);
    return select;
}

// ===============================
// 4) Form handling
// ===============================
const resourceIdInput = createNumberInput(resourceIdCnt, "resourceId", "e.g. 1");
const userIdInput = createNumberInput(userIdCnt, "userId", "e.g. 5");
const startTimeInput = createDateTimeInput(startTimeCnt, "startTime");
const endTimeInput = createDateTimeInput(endTimeCnt, "endTime");
const noteInput = createTextarea(noteCnt, "note");
const statusSelect = createSelect(statusCnt, "status", [
    { value: "active", label: "Active" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" }
]);

// Initial buttons
renderActionButtons(role);

// Form submit
document.getElementById("reservationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const action = e.submitter?.value || (formMode === "edit" ? "update" : "create");
    const reservationId = reservationIdInput.value;
    
    // Convert datetime inputs to ISO 8601 with timezone
    const startTimeValue = startTimeInput.value;
    const endTimeValue = endTimeInput.value;
    
    if (!startTimeValue || !endTimeValue) {
        showFormMessage("Please fill in both start and end times", "red");
        return;
    }
    
    // Parse datetime and add UTC timezone
    const startDate = new Date(startTimeValue + 'Z');
    const endDate = new Date(endTimeValue + 'Z');
    
    const data = {
        resourceId: Number(resourceIdInput.value),
        userId: Number(userIdInput.value),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        note: noteInput.value || null,
        status: statusSelect.value,
    };

    let url = "/api/reservations";
    let method = "POST";
    let body = JSON.stringify(data);

    if (action === "update") {
        if (!reservationId) {
            showFormMessage("Please select a reservation before updating", "red");
            return;
        }
        url = `/api/reservations/${reservationId}`;
        method = "PUT";
    } else if (action === "delete") {
        if (!reservationId) {
            showFormMessage("Please select a reservation before deleting", "red");
            return;
        }
        url = `/api/reservations/${reservationId}`;
        method = "DELETE";
        body = null;
    }

    try {
        const res = await fetch(url, {
            method,
            headers: body ? { "Content-Type": "application/json" } : undefined,
            body,
        });

        if (res.status === 204) {
            showFormMessage("Reservation deleted successfully", "green");
            clearReservationForm();
            await loadReservations();
            return;
        }

        const result = await res.json();

        if (!res.ok) {
            showFormMessage(result.error || "Operation failed", "red");
            return;
        }

        if (action === "create") {
            showFormMessage("Reservation created successfully", "green");
        } else if (action === "update") {
            showFormMessage("Reservation updated successfully", "green");
        }

        clearReservationForm();
        await loadReservations();
    } catch (err) {
        console.error(err);
        showFormMessage("Network error: Could not reach server", "red");
    }
});

// Clear form
function clearReservationForm() {
    document.getElementById("reservationForm").reset();
    reservationIdInput.value = "";
    formMode = "create";
    renderActionButtons(role);
}

// Show message (same as resources)
function showFormMessage(text, type = "green") {
    const msg = document.getElementById("formMessage");
    msg.textContent = text;
    msg.className = `mt-6 rounded-2xl border px-4 py-3 text-sm ${type === "green" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`;
    msg.classList.remove("hidden");
}

// ===============================
// 5) List rendering + selection
// ===============================
async function loadReservations() {
    try {
        const res = await fetch("/api/reservations");
        const body = await res.json();

        if (!body.ok) {
            console.error("Failed to load reservations");
            return;
        }

        reservationsCache = body.data || [];
        renderReservationList(reservationsCache);
    } catch (err) {
        console.error(err);
    }
}

function renderReservationList(reservations) {
    reservationListEl.innerHTML = reservations.map(r => `
        <button type="button" data-res-id="${r.id}" 
            class="w-full text-left rounded-2xl border border-black/10 bg-white px-4 py-3 transition hover:bg-black/5">
            <div class="font-semibold">Res #${r.id} — ${r.resource_name || 'Resource ' + r.resource_id}</div>
            <div class="text-xs text-black/60 mt-1">
                ${new Date(r.start_time).toLocaleString()} → ${new Date(r.end_time).toLocaleString()}
            </div>
            <div class="text-xs mt-1 ${r.status === 'active' ? 'text-green-600' : 'text-red-600'}">
                ${r.status}
            </div>
        </button>
    `).join("");

    reservationListEl.querySelectorAll("[data-res-id]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.resId);
            const reservation = reservationsCache.find(r => Number(r.id) === id);
            if (reservation) selectReservation(reservation);
        });
    });
}

function selectReservation(res) {
    reservationIdInput.value = res.id;
    resourceIdInput.value = res.resource_id;
    userIdInput.value = res.user_id;
    startTimeInput.value = res.start_time.slice(0, 16);
    endTimeInput.value = res.end_time.slice(0, 16);
    noteInput.value = res.note || "";
    statusSelect.value = res.status || "active";

    formMode = "edit";
    renderActionButtons(role);
}

// Load on start
loadReservations();