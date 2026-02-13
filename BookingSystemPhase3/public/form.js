document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resourceForm");
  form.addEventListener("submit", onSubmit);
});

async function onSubmit(event) {
  event.preventDefault();

  const action = event.submitter.value;

  const name = document.getElementById("resourceName").value.trim();
  const description = document.getElementById("resourceDescription").value.trim();
  const available = document.getElementById("resourceAvailable").checked;
  const price = Number(document.getElementById("resourcePrice").value);
  const unit = document.querySelector('input[name="resourcePriceUnit"]:checked')?.value;

  const id = Number(document.getElementById("resourceId").value);

  const payload = { name, description, available, price, unit };

  let url = "/api/resources";
  let method = "POST";

  if (action === "update") {
    url = `/api/resources/${id}`;
    method = "PUT";
  }

  if (action === "delete") {
    url = `/api/resources/${id}`;
    method = "DELETE";
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method !== "DELETE" ? JSON.stringify(payload) : null
  });

  await res.json();
  window.location.reload();
}
