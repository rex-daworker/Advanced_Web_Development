
// ===============================
// Form handling for resources page
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

// Timestamp
function timestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').replace('Z', '');
}

// -------------- Form wiring --------------
document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");
  form.addEventListener("submit", onSubmit);
});

async function onSubmit(event) {
  event.preventDefault();

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
      const err = await response.json().catch(() => ({}));
      alert("Error: " + (err.error || "Failed to create resource"));
      return;
    }

    const data = await response.json();
    alert(`Resource "${data.data?.name || payload.resourceName}" created successfully!`);

  } catch (err) {
    console.error("POST error:", err);
    alert("Network error — could not reach the server.");
  }
}