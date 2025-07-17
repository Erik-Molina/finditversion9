export function openProductImagesModal(images, product) {
  let modal = document.getElementById('productImagesModal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'productImagesModal';
    modal.className = 'modalproduct';
    document.body.appendChild(modal);
  }

  const calculateDeliveryDate = () => {
    const deliveryDays = [7, 14, 21, 28];
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let nextDeliveryDay = deliveryDays.find(day => day > currentDay);
    let deliveryMonth = currentMonth;
    let deliveryYear = currentYear;
    
    if (!nextDeliveryDay) {
      nextDeliveryDay = deliveryDays[0];
      deliveryMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      deliveryYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    }
    
    return `${nextDeliveryDay} de ${new Date(deliveryYear, deliveryMonth).toLocaleString('es-ES', { month: 'long' })}`;
  };

  const stock = product.stock || 0;
  let quantity = 1;
  const displayImages = images.slice(0, 3);
  const deliveryDate = calculateDeliveryDate();
  let deliveryCostApplied = false;
  const basePrice = parseFloat(product.precio) || 0;
  let currentPrice = calculateFinalPrice(product, false);

  const generateSpecialAttributes = () => {
    let attributesHTML = '';
    
    if (product.entregaInmediata && (product.entregaInmediata.toLowerCase() === 'sí' || product.entregaInmediata.toLowerCase() === 'si')) {
      const deliveryCost = calculateDeliveryCost(product.precio);
      attributesHTML += `
        <div class="product-attribute">
          <label class="immediate-delivery">
            <input type="checkbox" name="immediateDelivery" class="immediate-delivery-checkbox">
            <span>¿Desea entrega inmediata?</span>
          </label>
        </div>
        <div class="product-attribute immediate-delivery-message" style="display: none;">
          <p style="color: black;">Entrega inmediata implica coste por entrega de <strong>L. ${deliveryCost.toFixed(2)}</strong> ¿desea aplicar el costo?</p>
          <button class="delivery-cost-confirm">Sí</button>
          <button class="delivery-cost-cancel">No</button>
        </div>
        <div class="product-attribute immediate-delivery-status">
          <span class="attribute-label">Entrega inmediata:</span>
          <span class="attribute-value">No</span>
        </div>
      `;
    }
    
    if (product.rubro && product.rubro.toLowerCase() === 'moda' && product.genero) {
      const genderText = {
        'hombre': 'Hombre',
        'mujer': 'Mujer',
        'niño': 'Niño',
        'niña': 'Niña',
        'unisex': 'Unisex'
      }[product.genero.toLowerCase()] || 'Unisex';
      
      attributesHTML += `
        <div class="product-attribute">
          <span class="attribute-label">Para:</span>
          <span class="attribute-value">${genderText}</span>
        </div>
      `;
    }
    
    if (product.ciudad) {
      attributesHTML += `
        <div class="product-attribute">
          <span class="attribute-label">Disponible en:</span>
          <span class="attribute-value">${product.ciudad}</span>
        </div>
      `;
    }
    
    return attributesHTML;
  };

  modal.innerHTML = `
    <div class="modal-content-product">
      <div class="modal-header-product">
        <h2>${product.nombre}</h2>
        <button class="close-modal" id="closeProductImagesModal">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="modal-body-product">
        <div class="parent">
          <div class="div1">
            <div class="main-image-container">
              <img src="${displayImages[0]}" alt="${product.nombre}" class="main-product-img" />
            </div>
            <div class="thumbnail-row">
              ${displayImages.map((img, idx) => `
                <img src="${img}" alt="${product.nombre} - Thumbnail ${idx + 1}" class="thumbnail-img" data-index="${idx}" />
              `).join('')}
            </div>
          </div>
          <div class="div2">
            <h3 class="modal-product-name">${product.nombre}</h3>
            <div class="product-details">
              <p>${product.descripcion}</p>
              <p><strong>Fabricante:</strong> ${product.fabricante}</p>
            </div>
            <div class="special-attributes">
              <div class="product-attribute">
                <span class="attribute-label">Fecha estimada de entrega:</span>
                <span class="attribute-value">${deliveryDate}</span>
              </div>
              ${generateSpecialAttributes()}
            </div>
            <div class="price-quantity-row">
              <div class="price-tax-container">
                <p class="product-price">L ${currentPrice}</p>
                <p class="tax-included"><span class="material-icons">info_outline</span> Impuesto ya incluido</p>
              </div>
              <div class="quantity-control">
                <button class="btn-decrement">-</button>
                <input type="number" class="quantity-input" value="${quantity}" min="1" max="${stock}">
                <button class="btn-increment">+</button>
              </div>
            </div>
            <div class="product-actions">
              <button class="btn-buy-now">Comprar ahora</button>
              <button class="btn-add-cart">Añadir al carrito</button>
            </div>
            <button class="share-button" title="Compartir" data-proid="${product.proid || ''}">
              <span class="material-icons">share</span> Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const immediateDeliveryCheckbox = modal.querySelector('.immediate-delivery-checkbox');
  const immediateDeliveryStatus = modal.querySelector('.immediate-delivery-status .attribute-value');
  const deliveryMessage = modal.querySelector('.immediate-delivery-message');
  const confirmDeliveryButton = modal.querySelector('.delivery-cost-confirm');
  const cancelDeliveryButton = modal.querySelector('.delivery-cost-cancel');
  const priceElement = modal.querySelector('.product-price');

  if (immediateDeliveryCheckbox && immediateDeliveryStatus && deliveryMessage && confirmDeliveryButton && cancelDeliveryButton) {
    immediateDeliveryCheckbox.addEventListener('change', () => {
      if (immediateDeliveryCheckbox.checked) {
        deliveryMessage.style.display = 'block';
        immediateDeliveryStatus.textContent = 'No';
      } else {
        deliveryMessage.style.display = 'none';
        immediateDeliveryStatus.textContent = 'No';
        deliveryCostApplied = false;
        currentPrice = calculateFinalPrice(product, false);
        priceElement.textContent = `L ${currentPrice}`;
      }
    });

    confirmDeliveryButton.addEventListener('click', () => {
      deliveryCostApplied = true;
      immediateDeliveryStatus.textContent = 'Sí';
      currentPrice = calculateFinalPrice(product, true);
      priceElement.textContent = `L ${currentPrice}`;
      deliveryMessage.style.display = 'none';
    });

    cancelDeliveryButton.addEventListener('click', () => {
      deliveryCostApplied = false;
      immediateDeliveryStatus.textContent = 'No';
      immediateDeliveryCheckbox.checked = false;
      currentPrice = calculateFinalPrice(product, false);
      priceElement.textContent = `L ${currentPrice}`;
      deliveryMessage.style.display = 'none';
    });
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const addToCartButton = modal.querySelector('.btn-add-cart');
  const buyNowButton = modal.querySelector('.btn-buy-now');

  if (addToCartButton) {
    addToCartButton.addEventListener('click', () => {
      const productData = {
        name: product.nombre,
        price: parseFloat(currentPrice),
        basePrice: basePrice,
        comision: parseFloat(product.comision) || 0,
        deliveryCost: deliveryCostApplied ? calculateDeliveryCost(product.precio) : 0,
        image: images[0],
        details: product.descripcion,
        quantity: parseInt(modal.querySelector('.quantity-input').value),
        stock: stock,
        proid: product.proid,
        immediateDelivery: deliveryCostApplied,
        ciudad: product.ciudad || 'No especificada'
      };
      console.log('Añadir al carrito:', productData); // Depuración
      window.addToCart(productData);
    });
  }

  if (buyNowButton) {
    buyNowButton.addEventListener('click', () => {
      const productData = {
        name: product.nombre,
        price: parseFloat(currentPrice),
        basePrice: basePrice,
        comision: parseFloat(product.comision) || 0,
        deliveryCost: deliveryCostApplied ? calculateDeliveryCost(product.precio) : 0,
        image: images[0],
        details: product.descripcion,
        quantity: parseInt(modal.querySelector('.quantity-input').value),
        stock: stock,
        proid: product.proid,
        immediateDelivery: deliveryCostApplied,
        ciudad: product.ciudad || 'No especificada'
      };
      console.log('Comprar ahora:', productData); // Depuración
      window.addToCart(productData);
      modal.classList.remove('open');
      document.body.style.overflow = 'auto';
      window.openCartModal();
    });
  }

  return modal;
}

export function calculatePriceWithCommission(product) {
  const basePrice = parseFloat(product.precio) || 0;
  const commission = parseFloat(product.comision) || 0;
  return (basePrice + (basePrice * commission)).toFixed(2);
}

export function calculateDeliveryCost(basePrice) {
  const price = parseFloat(basePrice) || 0;
  if (price < 1000) return 100;
  if (price >= 1000 && price <= 4999) return 200;
  if (price >= 5000 && price <= 9999) return 400;
  return 550;
}

export function calculateFinalPrice(product, applyDeliveryCost) {
  const basePrice = parseFloat(product.precio) || 0;
  const commission = parseFloat(product.comision) || 0;
  const deliveryCost = applyDeliveryCost ? calculateDeliveryCost(basePrice) : 0;
  return (basePrice + deliveryCost + (basePrice * commission)).toFixed(2);
}

function cleanForJSON(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/['"]/g, '').replace(/[^a-zA-Z0-9\s-]/g, '').trim();
}

export function renderProducts(products, selectedCategories, productsContainer, currentCategoryPage, categoriesPerPage, categoryCounts = {}, loadedProductsPerCategory = {}) {
  productsContainer.innerHTML = '';

  if (!products || products.length === 0) {
    productsContainer.innerHTML = '<p>No se encontraron productos.</p>';
    renderPagination(0, categoriesPerPage, currentCategoryPage, productsContainer);
    return;
  }

  const groupedProducts = {};
  products.forEach(producto => {
    const category = producto.categoria || 'Sin categoría';
    if (!groupedProducts[category]) {
      groupedProducts[category] = [];
    }
    groupedProducts[category].push(producto);
  });

  const allCategories = Object.keys(groupedProducts).sort();
  const startCategory = (currentCategoryPage - 1) * categoriesPerPage;
  const endCategory = startCategory + categoriesPerPage;
  const paginatedCategories = allCategories.slice(startCategory, endCategory);

  paginatedCategories.forEach(category => {
    if (selectedCategories.length === 0 || selectedCategories.includes(category)) {
      const label = document.createElement('div');
      label.className = 'category-label-row';
      const count = categoryCounts[category] || 0;
      label.innerHTML = `<span class="category-label">${category} (${count})</span>`;
      productsContainer.appendChild(label);

      const productsToShow = groupedProducts[category].slice(0, loadedProductsPerCategory[category] || 10);

      productsToShow.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const briefDetail = producto.descripcion.length > 50 ? 
          producto.descripcion.substring(0, 50) + '...' : 
          producto.descripcion || 'Sin detalles';
        const isAvailable = producto.stock > 0;

        const cleanedProduct = {
          ...producto,
          nombre: cleanForJSON(producto.nombre),
          fabricante: cleanForJSON(producto.fabricante),
          descripcion: cleanForJSON(producto.descripcion),
          categoria: cleanForJSON(producto.categoria),
          ciudad: producto.ciudad,
          genero: cleanForJSON(producto.genero),
          comision: producto.comision
        };

        card.innerHTML = `
          <div class="product-badge ${isAvailable ? 'available' : 'sold-out'}">
            ${isAvailable ? 'Disponible' : 'Agotado'}
          </div>
          <div class="product-image-container">
            <img src="${producto.imagenes[0]}" alt="${producto.nombre}" class="product-img" />
            <div class="overlay"></div>
            <button class="view-button" 
                    title="Ver producto" 
                    data-images='${JSON.stringify(producto.imagenes)}' 
                    data-product='${JSON.stringify(cleanedProduct)}'>
              <span class="material-icons">visibility</span> Ver detalles
            </button>
          </div>
          <div class="product-info">
            <h3 class="product-name-card">${producto.nombre}</h3>
            <p class="product-price-card">L ${calculatePriceWithCommission(producto)}</p>
            <p class="product-brief">${briefDetail}</p>
            <p class="product-manufacturer"><strong>Marca:</strong> ${producto.fabricante}</p>
          </div>
        `;

        productsContainer.appendChild(card);
      });

      const totalProductsInCategory = groupedProducts[category].length;
      const loadedCount = loadedProductsPerCategory[category] || 10;
      const remainingProducts = totalProductsInCategory - loadedCount;

      if (remainingProducts > 0) {
        const moreButton = document.createElement('button');
        moreButton.className = 'more-products-btn';
        moreButton.dataset.category = category;
        const buttonText = remainingProducts <= 10 ? 
          `Ver ${remainingProducts} productos más` : 'Ver 10 productos más';
        moreButton.innerHTML = `<span class="material-icons">expand_more</span> ${buttonText}`;
        productsContainer.appendChild(moreButton);
      }
    }
  });

  renderPagination(allCategories.length, categoriesPerPage, currentCategoryPage, productsContainer);
}

export function updateCartDisplay(cartItems, modalBodyCarrito) {
  if (!modalBodyCarrito) return;

  modalBodyCarrito.innerHTML = '';

  if (cartItems.length === 0) {
    modalBodyCarrito.innerHTML = `
      <div class="empty-cart">
        <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Carrito vacío" class="empty-cart-image">
        <p>Tu carrito está vacío</p>
      </div>
    `;
    return;
  }

  const total = cartItems.reduce((sum, item) => {
    const priceNum = parseFloat(item.price) || 0;
    const deliveryCost = parseFloat(item.deliveryCost) || 0;
    return sum + (priceNum * item.quantity) + (deliveryCost * item.quantity);
  }, 0);

  cartItems.forEach(item => {
    const priceNum = parseFloat(item.price) || 0;
    const deliveryCost = parseFloat(item.deliveryCost) || 0;
    const subtotal = (priceNum * item.quantity) + (deliveryCost * item.quantity);

    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p>${item.details}</p>
        <p><strong>Ciudad:</strong> ${item.ciudad || 'No especificada'}</p>
        <p><strong>Entrega inmediata:</strong> ${item.immediateDelivery ? 'Sí' : 'No'}</p>
        ${item.immediateDelivery ? `<p><strong>Costo de entrega:</strong> L ${deliveryCost.toFixed(2)}</p>` : ''}
      </div>
      <div class="cart-item-price">Precio: L ${priceNum.toFixed(2)}</div>
      <div class="quantity-control">
        <p style="color:black;">Cantidad</p>
        <button class="btn-decrement">-</button>
        <input type="number" class="cart-quantity" value="${item.quantity}" min="1" max="${item.stock}" data-id="${item.id}" data-stock="${item.stock}">
        <button class="btn-increment">+</button>
      </div>
      <div class="cart-item-subtotal">Subtotal: L ${subtotal.toFixed(2)}</div>
      <button class="remove-item" data-id="${item.id}">
        <span class="material-icons">delete</span>
      </button>
    `;
    modalBodyCarrito.appendChild(itemElement);
  });

  const footer = document.createElement('div');
  footer.className = 'cart-footer';
  footer.innerHTML = `
    <div class="cart-total">
      <span class="cart-total-label">Total:</span>
      <span class="cart-total-amount">L ${total.toFixed(2)}</span>
    </div>
    <div class="payment-methods">
      <button class="payment-btn online" id="onlinePaymentBtn">
        <span class="material-icons">credit_card</span>
        Pago Online (Transferencia)
      </button>
      <button class="payment-btn cash" id="cashPaymentBtn">
        <span class="material-icons">payments</span>
        Pago en Efectivo
      </button>
    </div>
  `;
  
  modalBodyCarrito.appendChild(footer);
}

export function renderCategories(categories, categoriesContainer) {
  categoriesContainer.innerHTML = '';

  if (categories.length === 0) {
    categoriesContainer.innerHTML = '<p class="no-categories">No hay categorías disponibles</p>';
    return;
  }

  categories.forEach(category => {
    const label = document.createElement('label');
    label.className = 'filter-item';
    label.innerHTML = `
      <input type="checkbox" name="category" value="${category}">
      <span>${category}</span>
    `;
    categoriesContainer.appendChild(label);
  });
}

export function renderPagination(totalCategories, categoriesPerPage, currentCategoryPage, productsContainer) {
  const existingPagination = productsContainer.querySelector('.pagination-row');
  if (existingPagination) {
    existingPagination.remove();
  }

  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-row';
  const totalPages = Math.ceil(totalCategories / categoriesPerPage);

  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-btn';
  prevButton.innerHTML = '<span class="material-icons">chevron_left</span>';
  prevButton.disabled = currentCategoryPage === 1;
  paginationContainer.appendChild(prevButton);

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentCategoryPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `pagination-btn ${i === currentCategoryPage ? 'active' : ''}`;
    pageButton.textContent = i;
    paginationContainer.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-btn';
  nextButton.innerHTML = '<span class="material-icons">chevron_right</span>';
  nextButton.disabled = currentCategoryPage === totalPages;
  paginationContainer.appendChild(nextButton);

  productsContainer.appendChild(paginationContainer);
}