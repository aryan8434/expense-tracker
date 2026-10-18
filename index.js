// State management
let expenses = [];
let editingId = null;
const STORAGE_KEY = "sharpener_expenses_v1";

const CATEGORY_CONFIG = {
  food: { label: "Food", icon: "bi-cup-hot-fill" },
  transportation: { label: "Fuel", icon: "bi-fuel-pump-fill" },
  entertainment: { label: "Entertainment", icon: "bi-film" },
  utilities: { label: "Utilities", icon: "bi-lightning-charge-fill" },
  other: { label: "Other", icon: "bi-box-seam-fill" }
};

// Toast Notifications
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `custom-toast toast-${type}`;
  
  let iconClass = "bi-check-circle-fill text-success";
  if (type === "info") iconClass = "bi-info-circle-fill text-info";
  if (type === "danger") iconClass = "bi-trash3-fill text-danger";

  toast.innerHTML = `
    <i class="bi ${iconClass} fs-5"></i>
    <span class="small fw-medium">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-fade-out");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

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

// Edit & Delete Actions
function editExpense(id) {
  const item = expenses.find((exp) => exp.id.toString() === id.toString());
  if (!item) return;

  editingId = item.id;

  const amountInput = document.getElementById("amount");
  const descriptionInput = document.getElementById("description");
  const categorySelect = document.getElementById("category");
  const submitBtnText = document.getElementById("submit-btn-text");
  const cancelBtn = document.getElementById("cancel-edit-btn");

  if (amountInput) amountInput.value = item.amount;
  if (descriptionInput) descriptionInput.value = item.description;
  if (categorySelect) categorySelect.value = item.category;

  if (submitBtnText) submitBtnText.textContent = "Update Expense";
  if (cancelBtn) cancelBtn.classList.remove("d-none");

  // Highlight editing item
  renderExpenses();

  // Scroll to form smoothly
  const formCard = document.querySelector(".form-card");
  if (formCard) {
    formCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function cancelEdit() {
  editingId = null;

  const form = document.getElementById("expense-form");
  if (form) form.reset();

  const submitBtnText = document.getElementById("submit-btn-text");
  const cancelBtn = document.getElementById("cancel-edit-btn");

  if (submitBtnText) submitBtnText.textContent = "Add Expense";
  if (cancelBtn) cancelBtn.classList.add("d-none");

  renderExpenses();
}

function deleteExpense(id) {
  const item = expenses.find((exp) => exp.id.toString() === id.toString());
  const itemDesc = item ? item.description : "Expense";

  if (editingId && editingId.toString() === id.toString()) {
    cancelEdit();
  }

  expenses = expenses.filter((exp) => exp.id.toString() !== id.toString());
  saveExpenses();
  renderExpenses();
  updateStats();
  showToast(`Deleted "${itemDesc}"`, "danger");
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
    const isEditing = editingId && editingId.toString() === item.id.toString();

    const card = document.createElement("div");
    card.className = `glass-panel expense-item p-3 d-flex flex-wrap align-items-center justify-content-between gap-3 ${
      isEditing ? "is-editing" : ""
    }`;
    card.setAttribute("data-id", item.id);

    card.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <div class="category-icon-badge ${item.category}">
          <i class="bi ${config.icon}"></i>
        </div>
        <div>
          <h6 class="mb-1 text-white fw-semibold">${escapeHtml(item.description)}</h6>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-secondary-subtle text-light text-uppercase">${config.label}</span>
            <small class="text-secondary">${formatDate(item.id)}</small>
          </div>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3 ms-auto">
        <span class="fs-5 fw-bold text-success">+$${Number(item.amount).toFixed(2)}</span>
        <div class="d-flex align-items-center gap-1">
          <button type="button" class="btn btn-action-edit" title="Edit Expense" onclick="editExpense('${item.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-action-delete" title="Delete Expense" onclick="deleteExpense('${item.id}')">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function formatDate(timestamp) {
  const d = new Date(Number(timestamp));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const amount = form.elements.amount.value.trim();
  const category = form.elements.category.value;
  const description = form.elements.description.value.trim();

  if (!amount || !description) return;

  if (editingId) {
    // Update existing expense
    const index = expenses.findIndex((exp) => exp.id.toString() === editingId.toString());
    if (index !== -1) {
      expenses[index].amount = parseFloat(amount);
      expenses[index].category = category;
      expenses[index].description = description;
      saveExpenses();
      showToast("Expense updated successfully!", "info");
    }
    cancelEdit();
  } else {
    // Add new expense
    const newExpense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
      description
    };

    expenses.unshift(newExpense);
    saveExpenses();
    showToast("Expense added successfully!", "success");
    form.reset();
  }

  renderExpenses();
  updateStats();
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  loadExpenses();
  renderExpenses();
  updateStats();
});
