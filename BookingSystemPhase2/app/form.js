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
// Form submission + live validation
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resourceForm");
  if (!form) return;

  // Get fields
  const nameInput = document.getElementById("resourceName");
  const descInput = document.getElementById("resourceDescription");
  const availToggle = document.getElementById("resourceAvailable");
  const priceInput = document.getElementById("resourcePrice");
  const unitRadios = document.querySelectorAll('input[name="resourcePriceUnit"]');

  // Create price preview element
  const pricePreview = document.createElement("div");
  pricePreview.style.marginTop = "5px";
  pricePreview.style.fontSize = "0.9em";
  pricePreview.style.color = "#2e7d32";
  priceInput?.parentNode.appendChild(pricePreview);

  // Live validation functions
  function validateName() {
    const isValid = nameInput.value.trim().length >= 3 && nameInput.value.trim().length <= 50;
    setFieldState(nameInput, isValid);
    return isValid;
  }

  function validateDescription() {
    const val = descInput.value.trim();
    const isValid = val.length >= 5 && val.length <= 200 && !val.includes("<script");
    setFieldState(descInput, isValid);
    return isValid;
  }

  function validateAvailability() {
    const isValid = availToggle.checked;
    setFieldState(availToggle, isValid);
    return isValid;
  }

  function validatePriceAndUnit() {
    const price = Number(priceInput.value);
    const unit = document.querySelector('input[name="resourcePriceUnit"]:checked')?.value;

    const priceValid = !isNaN(price) && price > 0;
    setFieldState(priceInput, priceValid);

    const unitValid = !!unit;
    unitRadios.forEach(r => setFieldState(r, unitValid));

    // Live preview
    if (priceValid && unitValid) {
      pricePreview.textContent = `€ ${price.toFixed(2)} / ${unit}`;
    } else {
      pricePreview.textContent = "";
    }

    return priceValid && unitValid;
  }

  // Attach live validation
  nameInput?.addEventListener("input", validateName);
  descInput?.addEventListener("input", validateDescription);
  availToggle?.addEventListener("change", validateAvailability);
  priceInput?.addEventListener("input", validatePriceAndUnit);
  unitRadios.forEach(r => r.addEventListener("change", validatePriceAndUnit));

  // Form submission (unchanged + added basic check)
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isNameValid = validateName();
    const isDescValid = validateDescription();
    const isAvailValid = validateAvailability();
    const isPriceUnitValid = validatePriceAndUnit();

    if (!isNameValid || !isDescValid || !isAvailValid || !isPriceUnitValid) {
      console.warn("Form has invalid fields — submission blocked.");
      return;
    }

    const submitter = event.submitter;
    const actionValue = submitter?.value ?? "create";

    const payload = {
      action: actionValue,
      resourceName: nameInput.value.trim(),
      resourceDescription: descInput.value.trim(),
      resourceAvailable: availToggle.checked,
      resourcePrice: Number(priceInput.value),
      resourcePriceUnit: document.querySelector("input[name='resourcePriceUnit']:checked")?.value ?? ""
    };

    console.log("Sending payload:", payload);

    try {
      const response = await fetch("/api/resources", {  // ← changed to real endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.ok) {
        alert("Resource created successfully!");
        form.reset();
        // Reset styles
        [nameInput, descInput, priceInput, availToggle, ...unitRadios].forEach(el => {
          el.classList.remove("valid", "invalid");
        });
        pricePreview.textContent = "";
      } else {
        alert("Error: " + (data.errors?.map(e => e.msg).join(", ") || data.error));
      }
    } catch (err) {
      console.error("POST error:", err);
      alert("Network error: " + err.message);
    }
  });
});