let selectedCustomerId = null;

async function loadCustomers() {
  try {
    const res = await fetch('/api/persons');
    if (!res.ok) throw new Error('Failed to fetch customers');
    const customers = await res.json();
    renderCustomerList(customers);
  } catch (err) {
    console.error(err);
    document.getElementById('customer-list').innerHTML = '<p style="color:red;">Error loading customers</p>';
  }
}

function renderCustomerList(customers) {
  const list = document.getElementById('customer-list');
  list.innerHTML = '';

  if (customers.length === 0) {
    list.innerHTML = '<p>No customers found.</p>';
    return;
  }

  customers.forEach(c => {
    const item = document.createElement('div');
    item.className = 'customer-card';
    item.textContent = `${c.first_name} ${c.last_name}`;
    item.onclick = () => selectCustomer(c);
    list.appendChild(item);
  });
}

function selectCustomer(c) {
  selectedCustomerId = c.id;
  document.getElementById('first_name').value = c.first_name;
  document.getElementById('last_name').value = c.last_name;
  document.getElementById('email').value = c.email;
  document.getElementById('phone').value = c.phone;
  document.getElementById('birth_date').value = c.birth_date;

  // SHOW update + delete buttons
  document.getElementById('updateBtn').style.display = "inline-block";
  document.getElementById('deleteBtn').style.display = "inline-block";
}

function getFormData() {
  return {
    first_name: document.getElementById('first_name').value,
    last_name: document.getElementById('last_name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    birth_date: document.getElementById('birth_date').value
  };
}

function clearForm() {
  selectedCustomerId = null;
  document.getElementById('customerForm').reset();

  // HIDE update + delete buttons
  document.getElementById('updateBtn').style.display = "none";
  document.getElementById('deleteBtn').style.display = "none";
}

document.getElementById('addBtn').onclick = async () => {
  const data = getFormData();
  try {
    await fetch('/api/persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    loadCustomers();
    clearForm();
  } catch (err) {
    console.error('Error adding customer:', err);
  }
};

document.getElementById('updateBtn').onclick = async () => {
  if (!selectedCustomerId) return;
  const data = getFormData();
  try {
    await fetch(`/api/persons/${selectedCustomerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    loadCustomers();
  } catch (err) {
    console.error('Error updating customer:', err);
  }
};

document.getElementById('deleteBtn').onclick = async () => {
  if (!selectedCustomerId) return;
  try {
    await fetch(`/api/persons/${selectedCustomerId}`, {
      method: 'DELETE'
    });
    loadCustomers();
    clearForm();
  } catch (err) {
    console.error('Error deleting customer:', err);
  }
};
document.getElementById("birth_date").addEventListener("change", () => {
  const date = document.getElementById("birth_date").value;
  console.log("Selected date:", date);
});

loadCustomers();
