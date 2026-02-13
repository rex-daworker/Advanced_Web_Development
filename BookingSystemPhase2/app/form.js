// ===============================
// Form handling for resources page
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

function logSection(title, data) {
  console.group(title);
  console.log(data);
  console.groupEnd();
}

// ---------------- Validation helpers ----------------

// Check if a text field contains meaningful content
export function validateText(value) {
  return value.trim().length > 0;
}

// Apply green/red border based on validity
export function setFieldState(element, isValid) {
  if (!element) return;

  element.classList.remove("valid", "invalid");

  if (isValid) {
    element.classList.add("valid");
  } else {
    element.classList.add("invalid");
  }
}

// ---------------- Form wiring ----------------

document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");
  if (!form) {
    console.warn('resourceForm not found. Ensure the form has id="resourceForm".');
    return;
  }

  form.addEventListener("submit", onSubmit);
});

async function onSubmit(event) {
  event.preventDefault();

  const submitter = event.submitter;
  const actionValue = submitter?.value ?? "create";

  const name = $("resourceName")?.value.trim() ?? "";
  const description = $("resourceDescription")?.value.trim() ?? "";

  if (!validateText(name) || !validateText(description)) {
    console.warn("Invalid input — request not sent.");
    return;
  }

  const payload = {
    action: actionValue,
    resourceName: name,
    resourceDescription: description,
    resourceAvailable: $("resourceAvailable")?.checked ?? false,
    resourcePrice: $("resourcePrice")?.value ?? "",
    resourcePriceUnit: $("resourcePriceUnit")?.value ?? ""
  };

  logSection("Sending payload to httpbin.org/post", payload);

  try {
    const response = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} ${response.statusText}\n${text}`);
    }

    const data = await response.json();

    console.group("Response from httpbin.org");
    console.log("Status:", response.status);
    console.log("URL:", data.url);
    console.log("You sent (echo):", data.json);
    console.log("Headers (echoed):", data.headers);
    console.groupEnd();

  } catch (err) {
    console.error("POST error:", err);
  }
}
