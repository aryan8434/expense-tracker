// State management
let expenses = [];
const STORAGE_KEY = "sharpener_expenses_v1";

const CATEGORY_CONFIG = {
  food: { label: "Food", icon: "bi-cup-hot-fill" },
  transportation: { label: "Fuel", icon: "bi-fuel-pump-fill" },
  entertainment: { label: "Entertainment", icon: "bi-film" },
  utilities: { label: "Utilities", icon: "bi-lightning-charge-fill" },
  other: { label: "Other", icon: "bi-box-seam-fill" }
};

// LocalStorage helpers
function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      expenses = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load expenses from localStorage", e);
    expenses = [];
  }
}

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error("Failed to save expenses to localStorage", e);
  }
}

// KPI Dashboard Stats
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

// Filtering and Sorting
function getFilteredAndSortedExpenses() {
  const searchInput = document.getElementById("search-input");
  const filterCategory = document.getElementById("filter-category");
  const sortBy = document.getElementById("sort-by");

  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const cat = filterCategory ? filterCategory.value : "all";
  const sort = sortBy ? sortBy.value : "date-desc";

  let list = expenses.filter((item) => {
    const matchesSearch = !query || item.description.toLowerCase().includes(query);
    const matchesCat = cat === "all" || item.category === cat;
    return matchesSearch && matchesCat;
  });

  list.sort((a, b) => {
    switch (sort) {
      case "date-asc":
        return Number(a.id) - Number(b.id);
      case "amount-desc":
        return Number(b.amount) - Number(a.amount);
      case "amount-asc":
        return Number(a.amount) - Number(b.amount);
      case "date-desc":
      default:
        return Number(b.id) - Number(a.id);
    }
  });

  return list;
}

function handleFilterChange() {
  renderExpenses();
}

function resetFilters() {
  const searchInput = document.getElementById("search-input");
  const filterCategory = document.getElementById("filter-category");
  const sortBy = document.getElementById("sort-by");

  if (searchInput) searchInput.value = "";
  if (filterCategory) filterCategory.value = "all";
  if (sortBy) sortBy.value = "date-desc";

  renderExpenses();
}

// Render List
function renderExpenses() {
  const container = document.getElementById("expense-list");
  if (!container) return;

  container.innerHTML = "";
  const itemsToRender = getFilteredAndSortedExpenses();

  if (itemsToRender.length === 0) {
    container.innerHTML = `
      <div class="glass-panel text-center p-5 text-muted">
        <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
        <h6>No expenses found</h6>
        <p class="small mb-0">Try adjusting your search filters or add a new expense above.</p>
      </div>
    `;
    return;
  }

  itemsToRender.forEach((item) => {
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
  saveExpenses();
  renderExpenses();
  updateStats();
  form.reset();
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  loadExpenses();
  renderExpenses();
  updateStats();
});
