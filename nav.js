const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");

function showView(targetId) {
  views.forEach((view) => view.classList.toggle("active", view.id === targetId));
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.target === targetId));
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.target));
});
