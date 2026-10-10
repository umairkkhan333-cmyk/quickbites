document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('featuredGrid');
  if (grid) {
    const featured = foodItems.slice(0, 4);
    grid.innerHTML = featured.map(item => foodCardHTML(item)).join('');
  }
});