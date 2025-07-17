// Cargar datos del carrito desde localStorage
const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalContainer = document.getElementById('cartTotal');
const emptyCartModal = document.getElementById('emptyCartModal');
const countdownElement = document.getElementById('countdown');

// Función para formatear precios
function formatPrice(price) {
  return `L ${parseFloat(price).toFixed(2)}`;
}

// Función para mostrar el modal y manejar la cuenta regresiva
function showEmptyCartModal() {
  emptyCartModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  let timeLeft = 5;
  countdownElement.textContent = timeLeft;

  const countdown = setInterval(() => {
    timeLeft -= 1;
    countdownElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      window.location.href = '../onlinestore.html';
    }
  }, 1000);
}

// Renderizar lista de compras
function renderCartItems() {
  cartItemsContainer.innerHTML = '';
  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = '<p class="text-gray-600">Tu carrito está vacío</p>';
    cartTotalContainer.textContent = 'Total: L 0.00';
    return;
  }

  let total = 0;
  cartItems.forEach(item => {
    const priceNum = parseFloat(item.price) || 0;
    const subtotal = priceNum * item.quantity;
    total += subtotal;

    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-details">
        <h3>${item.name}</h3>
        <p><strong>ProID:</strong> ${item.proid}</p>
        <p><strong>Precio:</strong> ${formatPrice(item.price)}</p>
        <p><strong>Cantidad:</strong> ${item.quantity}</p>
        <p class="cart-subtotal"><strong>Subtotal:</strong> ${formatPrice(subtotal)}</p>
      </div>
    `;
    cartItemsContainer.appendChild(itemElement);
  });

  cartTotalContainer.textContent = `Total: ${formatPrice(total)}`;
}

// Ejecutar renderizado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el carrito está vacío
  if (cartItems.length === 0) {
    showEmptyCartModal();
    return;
  }

  renderCartItems();

  // Manejo del formulario de pago
  const paymentForm = document.getElementById('paymentForm');
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para procesar el pago
    alert('Procesando pago... (Esta es una simulación, implementa la pasarela de pago real aquí)');
  });
});