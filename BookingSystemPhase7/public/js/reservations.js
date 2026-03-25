const listContainer = document.getElementById("reservationList");

const form = {
  id: document.getElementById("reservationId"),
  resourceId: document.getElementById("resourceId"),
  userId: document.getElementById("userId"),
  startTime: document.getElementById("startTime"),
  endTime: document.getElementById("endTime"),
  note: document.getElementById("note"),
  status: document.getElementById("status"),
};

async function loadReservations() {
  const res = await fetch("/api/reservations");
  const data = await res.json();

  listContainer.innerHTML = "";

  data.forEach(r => {
    const div = document.createElement("div");
    div.className = "p-3 border rounded cursor-pointer hover:bg-gray-100";
    div.textContent = `#${r.id} | Resource ${r.resource_id} | ${r.start_time}`;
    div.onclick = () => fillForm(r);
    listContainer.appendChild(div);
  });
}

function fillForm(r) {
  form.id.value = r.id;
  form.resourceId.value = r.resource_id;
  form.userId.value = r.user_id;
  form.startTime.value = r.start_time.slice(0, 16);
  form.endTime.value = r.end_time.slice(0, 16);
  form.note.value = r.note;
  form.status.value = r.status;
}

document.getElementById("createBtn").onclick = async (e) => {
  e.preventDefault();

  const payload = {
    resourceId: Number(form.resourceId.value),
    userId: Number(form.userId.value),
    startTime: new Date(form.startTime.value).toISOString(),
    endTime: new Date(form.endTime.value).toISOString(),
    note: form.note.value,
    status: form.status.value,
  };

  const res = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert("Reservation created");
    loadReservations();
  } else {
    alert("Error creating reservation");
  }
};

document.getElementById("updateBtn").onclick = async (e) => {
  e.preventDefault();

  const id = form.id.value;
  if (!id) return alert("Select a reservation first");

  const payload = {
    resourceId: Number(form.resourceId.value),
    userId: Number(form.userId.value),
    startTime: new Date(form.startTime.value).toISOString(),
    endTime: new Date(form.endTime.value).toISOString(),
    note: form.note.value,
    status: form.status.value,
  };

  const res = await fetch(`/api/reservations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert("Updated");
    loadReservations();
  } else {
    alert("Error updating");
  }
};

document.getElementById("deleteBtn").onclick = async (e) => {
  e.preventDefault();

  const id = form.id.value;
  if (!id) return alert("Select a reservation first");

  const res = await fetch(`/api/reservations/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    alert("Deleted");
    loadReservations();
  } else {
    alert("Error deleting");
  }
};

loadReservations();
