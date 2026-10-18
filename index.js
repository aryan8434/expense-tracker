function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const amount = form.elements.amount.value.trim();
  const category = form.elements.category.value;
  const description = form.elements.description.value.trim();

  if (!amount || !description) return;

  const expenseDiv = document.createElement("div");
  expenseDiv.className = "glass-panel p-3 d-flex align-items-center justify-content-between";
  expenseDiv.innerHTML = `
    <div class="d-flex align-items-center gap-3">
      <div class="category-icon-badge ${category}">
        <i class="bi bi-tag-fill"></i>
      </div>
      <div>
        <h6 class="mb-1 text-white">${description}</h6>
        <span class="badge bg-secondary-subtle text-light text-uppercase">${category}</span>
      </div>
    </div>
    <div class="text-end">
      <span class="fs-5 fw-bold text-success">$${parseFloat(amount).toFixed(2)}</span>
    </div>
  `;

  const container = document.getElementById("expense-list") || document.body;
  container.appendChild(expenseDiv);
  form.reset();
}
