function handleSubmit(event) {
  event.preventDefault();
  const amount = event.target.elements.amount.value;
  const category = event.target.elements.category.value;
  const description = event.target.elements.description.value;

  const expenseDiv = document.createElement("div");
  expenseDiv.innerHTML = `<p><strong>Amount:</strong> ${amount}
                           <strong>Category:</strong> ${category}
                          <strong>Description:</strong> ${description}</p>`;
  document.body.appendChild(expenseDiv);
}
