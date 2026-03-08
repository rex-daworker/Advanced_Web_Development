// -----------------------------
// Resource Form Logic
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resourceForm");

  form.addEventListener("submit", onSubmit);
});

// -----------------------------
// Handle Form Submission
// -----------------------------
async function onSubmit(event) {
  event.preventDefault();

  console.log("The request send to the server", `[${new Date().toISOString()}]`);

  // -----------------------------
  // Read form values correctly
  // -----------------------------
  const resourceName = document.getElementById("resourceName").value.trim();
  const resourceDescription = document.getElementById("resourceDescription").value.trim();
  const resourceAvailable = document.getElementById("resourceAvailable").checked;
  const resourcePrice = parseFloat(document.getElementById("resourcePrice").value);

  // FIXED: Correct way to read selected radio button
  const resourcePriceUnit = document.querySelector("input[name='resourcePriceUnit']:checked").value;

  // -----------------------------
  // Build payload for backend
  // -----------------------------
  const payload = {
    resourceName,
    resourceDescription,
    resourceAvailable,
    resourcePrice,
    resourcePriceUnit
  };

  console.log("Payload sent:", payload);

  try {
    // -----------------------------
    // Send POST request
    // -----------------------------
    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("POST error:", errorData);
      alert("Error: " + JSON.stringify(errorData));
      return;
    }

    const data = await response.json();
    console.log("Server response:", data);

    // -----------------------------
    // Show success popup
    // -----------------------------
    alert(
      "Resource created!\n\n" +
      "Name: " + data.data.name + "\n" +
      "Description: " + data.data.description + "\n" +
      "Available: " + data.data.available + "\n" +
      "Price: " + data.data.price + "\n" +
      "Unit: " + data.data.price_unit + "\n" +
      "Created at: " + data.data.created_at + "\n" +
      "ID: " + data.data.id
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Unexpected error: " + err.message);
  }
}

