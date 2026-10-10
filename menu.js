let currentCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat;
      renderMenu();
    });
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderMenu();
    });
  }
});

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  const noResults = document.getElementById('noResults');
  if (!grid) return;

  let filtered = foodItems;
  if (currentCategory !== 'all') {
    filtered = filtered.filter(f => f.category === currentCategory);
  }
  if (searchQuery) {
    filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(searchQuery) ||
      f.description.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
    grid.innerHTML = filtered.map(item => foodCardHTML(item)).join('');
  }
}