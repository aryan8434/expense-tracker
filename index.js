// State management
let expenses = [];

const CATEGORY_CONFIG = {
  food: { label: "Food", icon: "bi-cup-hot-fill" },
  transportation: { label: "Fuel", icon: "bi-fuel-pump-fill" },
  entertainment: { label: "Entertainment", icon: "bi-film" },
  utilities: { label: "Utilities", icon: "bi-lightning-charge-fill" },
  other: { label: "Other", icon: "bi-box-seam-fill" }
};

function updateStats() {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const count = expenses.length;
  const avg = count > 0 ? total / count : 0;

  const totalEl = document.getElementById("stat-total");
  const countEl = document.getElementById("stat-count");
  const avgEl = document.getElementById("stat-average");

  if (totalEl) totalEl.textContent = `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (countEl) countEl.textContent = count.toString();
  if (avgEl) avgEl.textContent = `$${avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderExpenses() {
  const container = document.getElementById("expense-list");
  if (!container) return;

  container.innerHTML = "";

  expenses.forEach((item) => {
    const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
    const card = document.createElement("div");
    card.className = "glass-panel p-3 d-flex align-items-center justify-content-between";
    card.setAttribute("data-id", item.id);

    card.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <div class="category-icon-badge ${item.category}">
          <i class="bi ${config.icon}"></i>
        </div>
        <div>
          <h6 class="mb-1 text-white fw-semibold">${item.description}</h6>
          <span class="badge bg-secondary-subtle text-light text-uppercase">${config.label}</span>
        </div>
      </div>
      <div class="text-end">
        <span class="fs-5 fw-bold text-success">+$${Number(item.amount).toFixed(2)}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const amount = form.elements.amount.value.trim();
  const category = form.elements.category.value;
  const description = form.elements.description.value.trim();

  if (!amount || !description) return;

  const newExpense = {
    id: Date.now().toString(),
    amount: parseFloat(amount),
    category,
    description
  };

  expenses.unshift(newExpense);
  renderExpenses();
  updateStats();
  form.reset();
}
