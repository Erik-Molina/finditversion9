//no borrar ni cambiar

import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { renderProducts, renderPagination } from './structure.js';

const db = getDatabase();

// Elementos del DOM
const productsContainer = document.getElementById('productsContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const genresContainer = document.getElementById('genresContainer');
const genresSection = document.getElementById('genresSection');
const rubroInputs = document.querySelectorAll('input[name="rubro"]');
const toggleFiltersBtn = document.getElementById('toggleFilters');
const closeFiltersBtn = document.getElementById('closeFilters');
const filtersContainer = document.getElementById('filtersContainer');

// Estado
let currentCategoryPage = 1;
const categoriesPerPage = 10;
let allProducts = [];
let loadedProductsPerCategory = {};
let globalCategoryCounts = {};

// Mapeo de nombres de rubros
const rubroNameMap = {
  'moda': 'Moda',
  'ferreteria': 'Ferretería',
  'tecnologia': 'Tecnología'
};

// Función para limpiar proid de prefijo
function cleanProid(proid) {
  return proid.replace(/^proid-/, '');
}

// Función para contar productos por categoría en todo el conjunto
function countAllProductsByCategory(products) {
  const counts = {};
  products.forEach(p => {
    const category = p.categoria || 'Sin categoría';
    counts[category] = (counts[category] || 0) + 1;
  });
  return counts;
}

// Función para obtener categorías con conteo correcto por rubro
function getCategoriesWithCountsForRubro(rubro) {
  if (rubro === 'todo') {
    return {
      categories: [...new Set(allProducts.map(p => p.categoria).filter(Boolean))].sort(),
      counts: countAllProductsByCategory(allProducts)
    };
  }

  const rubroName = rubroNameMap[rubro] || rubro;
  const productosDelRubro = allProducts.filter(p => {
    const productRubro = p.rubro?.toLowerCase();
    const expectedRubro = rubroName.toLowerCase();
    return productRubro === expectedRubro;
  });

  const counts = {};
  productosDelRubro.forEach(p => {
    const category = p.categoria || 'Sin categoría';
    counts[category] = (counts[category] || 0) + 1;
  });

  const categoriasUnicas = [...new Set(
    productosDelRubro.map(p => p.categoria).filter(Boolean)
  )].sort();

  return {
    categories: categoriasUnicas,
    counts: counts
  };
}

// Renderizar categorías con conteos
function renderCategories(categories, counts) {
  categoriesContainer.innerHTML = categories.length
    ? categories.map(c => `
        <label class="filter-item">
          <input type="checkbox" name="category" value="${c}">
          <span>${c} (${counts[c] || 0})</span>
        </label>
      `).join('')
    : '<p class="no-categories">No hay categorías disponibles</p>';
}

// Renderizar géneros (solo para Moda)
function renderGenres() {
  const genres = ['unisex', 'hombre', 'mujer', 'niño', 'niña'];
  genresContainer.innerHTML = genres.map(g => `
    <label class="filter-item">
      <input type="checkbox" name="genero" value="${g}">
      <span>${g.charAt(0).toUpperCase() + g.slice(1)}</span>
    </label>
  `).join('');
}

// Aplicar filtros actuales
function applyCurrentFilters() {
  const rubro = document.querySelector('input[name="rubro"]:checked')?.value.toLowerCase() || 'todo';
  const selectedCategories = [...document.querySelectorAll('input[name="category"]:checked')].map(cb => cb.value);
  const selectedGenres = rubro === 'moda'
    ? [...document.querySelectorAll('input[name="genero"]:checked')].map(cb => cb.value)
    : [];

  let filtered = rubro === 'todo'
    ? [...allProducts]
    : allProducts.filter(p => {
        const productRubro = p.rubro?.toLowerCase();
        const expectedRubro = rubroNameMap[rubro]?.toLowerCase() || rubro;
        return productRubro === expectedRubro;
      });

  if (selectedCategories.length) {
    filtered = filtered.filter(p => selectedCategories.includes(p.categoria));
  }

  if (rubro === 'moda' && selectedGenres.length) {
    filtered = filtered.filter(p => selectedGenres.includes(p.genero));
  }

  return filtered;
}

// Actualizar vista con productos filtrados
function updateProductView() {
  currentCategoryPage = 1;
  loadedProductsPerCategory = {};
  const filteredProducts = applyCurrentFilters();
  
  renderProducts(
    filteredProducts,
    [],
    productsContainer,
    currentCategoryPage,
    categoriesPerPage,
    globalCategoryCounts,
    loadedProductsPerCategory
  );

  const allCategories = [...new Set(filteredProducts.map(p => p.categoria || 'Sin categoría'))].sort();
  renderPagination(allCategories.length, categoriesPerPage, currentCategoryPage, productsContainer);
}

// Manejar cambio de rubro
function handleRubroChange(rubro) {
  if (rubro === 'moda') {
    genresSection.classList.remove('hidden');
    renderGenres();
  } else {
    genresSection.classList.add('hidden');
  }

  const { categories, counts } = getCategoriesWithCountsForRubro(rubro);
  globalCategoryCounts = counts;

  renderCategories(categories, counts);
  updateProductView();
}

// Configurar event listeners
function setupEventListeners() {
  rubroInputs.forEach(input => {
    input.addEventListener('change', () => {
      const rubro = input.value.toLowerCase();
      handleRubroChange(rubro);
    });
  });

  categoriesContainer.addEventListener('change', () => updateProductView());

  genresContainer.addEventListener('change', () => updateProductView());

  toggleFiltersBtn.addEventListener('click', () => {
    filtersContainer.classList.add('active');
  });

  closeFiltersBtn.addEventListener('click', () => {
    filtersContainer.classList.remove('active');
  });
}

// Cargar productos iniciales
document.addEventListener('DOMContentLoaded', () => {
  const productosRef = ref(db, 'productsbylocation');

  onValue(productosRef, (snapshot) => {
    allProducts = [];
    const data = snapshot.val() || {};

    Object.values(data).forEach(dept => {
      Object.values(dept).forEach(city => {
        Object.entries(city).forEach(([proid, product]) => {
          if (product.rubro && product.categoria) {
            allProducts.push({ ...product, proid });
          }
        });
      });
    });

    console.log('Productos cargados en filterprodu.js:', allProducts);

    globalCategoryCounts = countAllProductsByCategory(allProducts);
    setupEventListeners();
    
    const initialCategories = [...new Set(allProducts.map(p => p.categoria).filter(Boolean))].sort();
    renderCategories(initialCategories, globalCategoryCounts);
    genresSection.classList.add('hidden');
    
    updateProductView();
  }, { onlyOnce: false });
});