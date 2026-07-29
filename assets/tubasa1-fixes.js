(() => {
  const expensesButton = document.getElementById('t_expenses');
  if (!expensesButton) return;

  expensesButton.textContent = '仕入・外注・経費 ↗';
  expensesButton.onclick = () => {
    window.location.href = './expenses.html';
  };
})();
