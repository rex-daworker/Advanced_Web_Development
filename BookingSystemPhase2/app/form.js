// ===============================
// Shared validation helpers
// ===============================

export function validateText(value) {
  return value.trim().length > 0;
}

export function setFieldState(element, isValid) {
  if (!element) return;

  element.classList.remove("valid", "invalid");

  if (isValid) {
    element.classList.add("valid");
  } else {
    element.classList.add("invalid");
  }
}

// ===============================
// Form submission
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resourceForm");
  if (!form) return;

  form.addEventListener("submit", onSubmit);
});

async function onSubmit(event) {
  event.preventDefault();

  const submitter = event.submitter;
  const actionValue = submitter?.value ?? "create";

  const name = document.getElementById("resourceName")?.value.trim() ?? "";
  const description = document.getElementById("resourceDescription")?.value.trim() ?? "";

  if (!validateText(name) || !validateText(description)) {
    console.warn("Invalid input — request not sent.");
    return;
  }

  const payload = {
    action: actionValue,
    resourceName: name,
    resourceDescription: description,
    resourceAvailable: document.getElementById("resourceAvailable")?.checked ?? false,
    resourcePrice: document.getElementById("resourcePrice")?.value ?? "",
    resourcePriceUnit: document.querySelector("input[name='resourcePriceUnit']:checked")?.value ?? ""
  };

  console.log("Sending payload:", payload);

  try {
    const response = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Response:", data);

  } catch (err) {
    console.error("POST error:", err);
  }
}
