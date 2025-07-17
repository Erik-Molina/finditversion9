import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { renderProducts, updateCartDisplay, openProductImagesModal, renderPagination } from './structure.js';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBJi-ve8Z1v6IGaa-4F0135AIAabdISPx8",
  authDomain: "sajsajndhbshaihbaksjsdnsjahius.firebaseapp.com",
  projectId: "sajsajndhbshaihbaksjsdnsjahius",
  storageBucket: "sajsajndhbshaihbaksjsdnsjahius.appspot.com",
  messagingSenderId: "923009709693",
  appId: "1:923009709693:web:abde872e5878909b556314",
  measurementId: "G-NG78JB2DLE"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Seleccionar elementos del DOM
const productsContainer = document.getElementById('productsContainer');
const cartModal = document.getElementById('cartModal');
const modalBodyCarrito = cartModal ? cartModal.querySelector('.modal-body-carrito') : null;

// Variables globales
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let currentCategoryPage = 1;
const categoriesPerPage = 10;
let loadedProductsPerCategory = {};
let allProducts = [];

// Función para sanitizar el nombre del producto
function sanitizeProductName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').trim();
}

// Función para limpiar proid de prefijo
function cleanProid(proid) {
  return proid.replace(/^proid-/, '');
}

// Función para guardar el carrito en localStorage
function saveCartToStorage() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

// Función para mostrar notificación
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Función para agregar producto al carrito
function addToCart(productData) {
  console.log('addToCart called with:', productData); // Depuración
  const existingItem = cartItems.find(item => item.proid === productData.proid);
  
  if (existingItem) {
    const newQuantity = existingItem.quantity + productData.quantity;
    if (newQuantity <= productData.stock) {
      existingItem.quantity = newQuantity;
    } else {
      existingItem.quantity = productData.stock;
      showNotification('Cantidad limitada por stock disponible');
    }
  } else {
    cartItems.push({ ...productData, id: Date.now() });
  }
  
  saveCartToStorage();
  updateCartDisplay(cartItems, modalBodyCarrito);
  showNotification('Producto añadido al carrito');
}

// Asignar addToCart a window para que structure.js lo use
window.addToCart = addToCart;

// Función para abrir el modal del carrito
function openCartModal() {
  if (cartModal) {
    cartModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateCartDisplay(cartItems, modalBodyCarrito);
  }
}

// Función para cerrar el modal del carrito
function closeCartModalHandler() {
  if (cartModal) {
    cartModal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }
}

// Función para configurar eventos del modal de producto
function setupModalEventListeners(modal, images, product) {
  const mainImage = modal.querySelector('.main-product-img');
  const thumbnails = modal.querySelectorAll('.thumbnail-img');
  const quantityInput = modal.querySelector('.quantity-input');
  const decrementBtn = modal.querySelector('.btn-decrement');
  const incrementBtn = modal.querySelector('.btn-increment');
  const shareButton = modal.querySelector('.share-button');
  const closeButton = modal.querySelector('#closeProductImagesModal');

  let currentIndex = 0;
  const stock = product.stock || 0;

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }

  function updateMainImage(index) {
    currentIndex = index;
    mainImage.src = images.slice(0, 3)[currentIndex];
  }

  function updateQuantity(newValue) {
    let quantity = Math.max(1, Math.min(stock, parseInt(newValue) || 1));
    quantityInput.value = quantity;
  }

  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => updateMainImage(index));
  });

  quantityInput.addEventListener('input', (e) => {
    let value = parseInt(e.target.value) || 1;
    if (value > stock) {
      value = stock;
      showNotification('Cantidad limitada por stock disponible');
    }
    updateQuantity(value);
  });

  decrementBtn.addEventListener('click', () => updateQuantity(parseInt(quantityInput.value) - 1));
  incrementBtn.addEventListener('click', () => updateQuantity(parseInt(quantityInput.value) + 1));

  if (shareButton) {
    shareButton.addEventListener('click', async () => {
      try {
        if (!product.proid) {
          console.error('proid no disponible:', product);
          throw new Error('ID de producto no disponible');
        }
        const sanitizedName = sanitizeProductName(product.nombre);
        const cleanId = cleanProid(product.proid);
        const productUrl = `${window.location.origin}${window.location.pathname}#product-${cleanId}-${sanitizedName}`;
        await navigator.clipboard.writeText(productUrl);
        showNotification('¡Enlace copiado! Comparte este producto');
        const icon = shareButton.querySelector('.material-icons');
        icon.textContent = 'check';
        setTimeout(() => icon.textContent = 'share', 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
        showNotification('Error al copiar el enlace');
      }
    });
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Cerrar el modal con la tecla Esc
  document.addEventListener('keydown', function keydownHandler(e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
      document.removeEventListener('keydown', keydownHandler);
    }
  });
}

// Función para mostrar el modal del producto
function showProductModal(product) {
  if (!product.imagenes || product.imagenes.length === 0) {
    console.error('El producto no tiene imágenes:', product);
    showNotification('El producto no tiene imágenes disponibles');
    return;
  }

  const modal = openProductImagesModal(product.imagenes, product);
  if (!modal) {
    console.error('No se pudo abrir el modal');
    return;
  }

  setupModalEventListeners(modal, product.imagenes, product);
  history.replaceState(null, null, ' ');
}

// Función para manejar URLs con hash de producto
function handleProductHash() {
  const hash = window.location.hash;
  if (!hash) return;

  const productMatch = hash.match(/#product-(proid-)?([^-]+)-(.+)/);
  
  if (productMatch) {
    const productId = productMatch[2];
    const productName = decodeURIComponent(productMatch[3].replace(/-/g, ' '));
    
    // Buscar en allProducts primero
    let product = allProducts.find(p => {
      const cleanId = cleanProid(p.proid);
      const cleanName = sanitizeProductName(p.nombre).replace(/-/g, ' ');
      return cleanId === productId && cleanName === productName.toLowerCase();
    });

    if (product) {
      showProductModal(product);
      return;
    }

    // Si no está en allProducts, buscar en Firebase
    const productosRef = ref(db, 'productsbylocation');
    onValue(productosRef, (snapshot) => {
      const data = snapshot.val() || {};
      let foundProduct = null;

      Object.values(data).forEach(departamento => {
        Object.values(departamento).forEach(ciudad => {
          Object.entries(ciudad).forEach(([proid, producto]) => {
            const cleanId = cleanProid(proid);
            const cleanName = sanitizeProductName(producto.nombre).replace(/-/g, ' ');
            if (cleanId === productId && cleanName === productName.toLowerCase()) {
              foundProduct = { ...producto, proid };
            }
          });
        });
      });

      if (foundProduct) {
        showProductModal(foundProduct);
      } else {
        showNotification('El producto no se encuentra disponible');
      }
    }, { onlyOnce: true });
  }
}

// Función para configurar eventos de los productos
function setupProductEventListeners(products, categoryCounts) {
  productsContainer.addEventListener('click', (e) => {
    const button = e.target.closest('.view-button');
    const moreButton = e.target.closest('.more-products-btn');

    if (button) {
      const images = JSON.parse(button.dataset.images);
      const product = JSON.parse(button.dataset.product);
      const modal = openProductImagesModal(images, product);
      setupModalEventListeners(modal, images, product);
    } else if (moreButton) {
      const category = moreButton.dataset.category;
      loadedProductsPerCategory[category] = (loadedProductsPerCategory[category] || 10) + 10;
      renderProducts(products, [], productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts, loadedProductsPerCategory);
    }
  });
}

// Función para contar productos por categoría
function getCategoryCounts(data) {
  const categoryCounts = {};
  const excludedCategories = ['moda', 'ferreteria', 'tecnologia'];
  Object.values(data).forEach(departamento => {
    Object.values(departamento).forEach(ciudad => {
      Object.entries(ciudad).forEach(([proid, producto]) => {
        const category = producto.categoria || 'Sin categoría';
        if (!excludedCategories.includes(category.toLowerCase())) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });
    });
  });
  return categoryCounts;
}

// Función para configurar eventos de paginación
function setupPaginationEvents(totalCategories, products, categoryCounts) {
  productsContainer.addEventListener('click', (e) => {
    const target = e.target.closest('.pagination-btn');
    if (!target) return;
    
    if (target.textContent.includes('chevron_left')) {
      currentCategoryPage = Math.max(1, currentCategoryPage - 1);
    } else if (target.textContent.includes('chevron_right')) {
      currentCategoryPage = Math.min(Math.ceil(totalCategories / categoriesPerPage), currentCategoryPage + 1);
    } else {
      currentCategoryPage = parseInt(target.textContent);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderProducts(products, [], productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts, loadedProductsPerCategory);
  });
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  // Configurar eventos del carrito
  if (cartModal) {
    cartModal.querySelector('.close-cart')?.addEventListener('click', closeCartModalHandler);
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) closeCartModalHandler();
    });
  }

  document.querySelector('.cart-icon')?.addEventListener('click', openCartModal);

  // Configurar eventos del carrito en el modal
  modalBodyCarrito?.addEventListener('click', (e) => {
    const target = e.target;
    const itemElement = target.closest('.cart-item');
    
    if (target.closest('#onlinePaymentBtn')) {
      window.location.href = 'paymentmethods/CheckoutOnlinePayment.html';
    } else if (target.closest('#cashPaymentBtn')) {
      window.location.href = 'paymentmethods/CheckoutCashPayment.html';
    }

    if (!itemElement) return;

    const id = parseInt(itemElement.querySelector('.cart-quantity').dataset.id);
    const stock = parseInt(itemElement.querySelector('.cart-quantity').dataset.stock);

    if (target.closest('.btn-decrement')) {
      const quantityInput = itemElement.querySelector('.cart-quantity');
      let quantity = Math.max(1, parseInt(quantityInput.value) - 1);
      quantityInput.value = quantity;
      const itemToUpdate = cartItems.find(i => i.id === id);
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
        saveCartToStorage();
        updateCartDisplay(cartItems, modalBodyCarrito);
      }
    } else if (target.closest('.btn-increment')) {
      const quantityInput = itemElement.querySelector('.cart-quantity');
      let quantity = Math.min(stock, parseInt(quantityInput.value) + 1);
      quantityInput.value = quantity;
      const itemToUpdate = cartItems.find(i => i.id === id);
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
        saveCartToStorage();
        updateCartDisplay(cartItems, modalBodyCarrito);
      }
    } else if (target.closest('.remove-item')) {
      cartItems = cartItems.filter(i => i.id !== id);
      saveCartToStorage();
      updateCartDisplay(cartItems, modalBodyCarrito);
      showNotification('Producto eliminado');
    }
  });

  modalBodyCarrito?.addEventListener('change', (e) => {
    if (e.target.classList.contains('cart-quantity')) {
      const id = parseInt(e.target.dataset.id);
      const stock = parseInt(e.target.dataset.stock);
      let quantity = Math.max(1, Math.min(stock, parseInt(e.target.value) || 1));
      e.target.value = quantity;
      const itemToUpdate = cartItems.find(i => i.id === id);
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
        saveCartToStorage();
        updateCartDisplay(cartItems, modalBodyCarrito);
      }
    }
  });

  // Cargar datos de Firebase
  const productosRef = ref(db, 'productsbylocation');
  onValue(productosRef, (snapshot) => {
    const data = snapshot.val() || {};
    allProducts = [];
    const excludedCategories = ['moda', 'ferreteria', 'tecnologia'];
    const categoryCounts = getCategoryCounts(data);
    
    Object.values(data).forEach(departamento => {
      Object.values(departamento).forEach(ciudad => {
        Object.entries(ciudad).forEach(([proid, producto]) => {
          if (!excludedCategories.includes(producto.categoria?.toLowerCase())) {
            allProducts.push({ ...producto, proid });
          }
        });
      });
    });

    const allCategories = [...new Set(allProducts.map(p => p.categoria || 'Sin categoría'))].sort();
    renderProducts(allProducts, [], productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts, loadedProductsPerCategory);
    renderPagination(allCategories.length, categoriesPerPage, currentCategoryPage, productsContainer);
    setupProductEventListeners(allProducts, categoryCounts);
    setupPaginationEvents(allCategories.length, allProducts, categoryCounts);

    // Manejar hash de producto después de cargar los productos
    handleProductHash();
  }, { onlyOnce: false });

  // Cargar carrito inicial
  updateCartDisplay(cartItems, modalBodyCarrito);

  // Manejar URLs con hash de producto al cargar
  handleProductHash();

  // Escuchar cambios en el hash
  window.addEventListener('hashchange', handleProductHash);
});