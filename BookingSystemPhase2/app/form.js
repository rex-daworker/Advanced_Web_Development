// ===============================
// Form handling for resources page
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

function showMessage(type, text) {
  const msgEl = $("formMessage");
  if (!msgEl) {
    // Fallback if div missing
    alert(text);
    return;
  }

  // Reset classes
  msgEl.className = "mt-6 p-4 rounded-2xl border text-sm";
  msgEl.classList.remove("hidden");

  if (type === "success") {
    msgEl.classList.add("bg-emerald-50", "border-emerald-200", "text-emerald-800");
  } else {
    msgEl.classList.add("bg-rose-50", "border-rose-200", "text-rose-800");
  }

  msgEl.textContent = text;
  msgEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearMessage() {
  const msgEl = $("formMessage");
  if (msgEl) {
    msgEl.textContent = "";
    msgEl.classList.add("hidden");
  }
}

// -------------- Form wiring --------------
document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");
  if (!form) return;

  form.addEventListener("submit", onSubmit);
});

async function onSubmit(event) {
  event.preventDefault();

  // Get submit button and disable it during request
  const submitBtn = event.submitter || document.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  clearMessage();

  const payload = {
    action: "create",
    resourceName: $("resourceName")?.value.trim() ?? "",
    resourceDescription: $("resourceDescription")?.value.trim() ?? "",
    resourceAvailable: $("resourceAvailable")?.checked ?? false,
    resourcePrice: Number($("resourcePrice")?.value ?? 0),
    resourcePriceUnit: document.querySelector('input[name="resourcePriceUnit"]:checked')?.value ?? ""
  };

  try {
    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errMsg = "Failed to create resource";
      try {
        const errData = await response.json();
        errMsg = errData.error || errData.details || errMsg;
      } catch {}
      showMessage("error", errMsg);
      return;
    }

    const data = await response.json();
    const name = data.data?.name || payload.resourceName;
    showMessage("success", `Resource "${name}" created successfully!`);

    // Optional: clear form after success
    form.reset();

  } catch (err) {
    console.error("POST error:", err);
    showMessage("error", "Network error — could not reach the server. Is the backend running?");
  } finally {
    // Re-enable button
    if (submitBtn) submitBtn.disabled = false;
  }
}