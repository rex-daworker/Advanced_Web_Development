// Validation helpers
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

// Form submission
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
  const available = document.getElementById("resourceAvailable")?.checked ?? false;
  const price = document.getElementById("resourcePrice")?.value ?? "";
  const unit = document.querySelector("input[name='resourcePriceUnit']:checked")?.value ?? "";

  if (!validateText(name) || !validateText(description)) {
    console.warn("Invalid input — request not sent.");
    return;
  }

  const payload = {
    action: actionValue,
    resourceName: name,
    resourceDescription: description,
    resourceAvailable: available,
    resourcePrice: price,
    resourcePriceUnit: unit
  };

  console.log("Sending payload:", payload);

  try {
    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Response:", data);

    alert(`Status: ${data.status}\nAction: ${data.action}\nName: ${data.resourceName}\nDescription: ${data.resourceDescription}`);

  } catch (err) {
    console.error("POST error:", err);
  }
}
