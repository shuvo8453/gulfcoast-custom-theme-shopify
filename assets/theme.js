/**
 * Gulf Coast Outfitters - Core Theme Script (Vanilla JS)
 */
document.addEventListener('DOMContentLoaded', () => {
  // Init features
  initQuantityControls();
  initScrollToTop();
  initFAQAccordion();
  initDrawers();
  initCollectionFiltersMobileDrawer();
  initNotifyModal();
  initAjaxAddToCart();
  initFloatingCart();
});

// Toast Notification System
window.showGcfToast = function (message, type = "success") {
  let container = document.getElementById('gcf-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'gcf-toast-container';
    container.className = 'gcf-toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `gcf-toast gcf-toast-${type}`;
  const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
  toast.innerHTML = `<i class="fas ${iconClass}"></i><span class="gcf-toast-message">${message}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Quantity Increment/Decrement Controls
function initQuantityControls() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    
    e.preventDefault();
    const container = btn.closest('.quantity-controls');
    if (!container) return;
    
    const input = container.querySelector('.qty-input');
    if (!input) return;
    
    let currentVal = parseFloat(input.value) || 1;
    const min = parseFloat(input.getAttribute('min')) || 1;
    const max = parseFloat(input.getAttribute('max')) || Infinity;
    const step = parseFloat(input.getAttribute('step')) || 1;
    
    if (btn.classList.contains('qty-plus')) {
      if (currentVal + step <= max) {
        input.value = currentVal + step;
      } else {
        input.value = max;
      }
    } else if (btn.classList.contains('qty-minus')) {
      if (currentVal - step >= min) {
        input.value = currentVal - step;
      } else {
        input.value = min;
      }
    }
    
    // Dispatch change event to trigger update calculations if listening
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

// Scroll to Top Handler
function initScrollToTop() {
  const btn = document.getElementById('scroll-to-top');
  if (!btn) return;
  
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 300) {
          btn.classList.add('show');
        } else {
          btn.classList.remove('show');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// FAQ Accordion Trigger Toggle
function initFAQAccordion() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.faq-trigger');
    if (!trigger) return;
    
    e.preventDefault();
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    const faqItem = trigger.closest('.faq-item');
    const answerPanel = faqItem.querySelector('.faq-answer-panel');
    
    // Close other items
    const siblings = faqItem.parentNode.querySelectorAll('.faq-item');
    siblings.forEach(sib => {
      if (sib !== faqItem) {
        sib.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        sib.querySelector('.faq-answer-panel').classList.add('d-none');
      }
    });
    
    // Toggle active item
    trigger.setAttribute('aria-expanded', !expanded);
    if (!expanded) {
      answerPanel.classList.remove('d-none');
    } else {
      answerPanel.classList.add('d-none');
    }
  });
}

// Global Drawer Controller (Cart, Wishlist, Compare Offcanvas Drawer triggers)
function initDrawers() {
  const overlay = document.createElement('div');
  overlay.className = 'drawer-overlay d-none';
  document.body.appendChild(overlay);
  
  const drawerTriggers = [
    { toggle: '[data-gcf-wishlist-drawer-toggle="true"]', drawer: '[data-gcf-wishlist-drawer="true"]', bodyClass: 'has-wishlist-open' },
    { toggle: '[data-gcf-compare-drawer-toggle="true"]', drawer: '[data-gcf-compare-drawer="true"]', bodyClass: 'has-compare-open' }
  ];
  
  drawerTriggers.forEach(d => {
    const toggles = document.querySelectorAll(d.toggle);
    const drawerElement = document.querySelector(d.drawer);
    if (!drawerElement) return;
    
    const closeBtn = drawerElement.querySelector('[data-drawer-close="true"]');
    
    function open() {
      drawerElement.removeAttribute('hidden');
      setTimeout(() => drawerElement.classList.add('is-open'), 50);
      document.body.classList.add(d.bodyClass);
      overlay.classList.remove('d-none');
      toggles.forEach(t => t.setAttribute('aria-expanded', 'true'));
    }
    
    function close() {
      drawerElement.classList.remove('is-open');
      document.body.classList.remove(d.bodyClass);
      overlay.classList.add('d-none');
      toggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
      setTimeout(() => {
        if (!drawerElement.classList.contains('is-open')) {
          drawerElement.setAttribute('hidden', 'true');
        }
      }, 380);
    }
    
    toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const href = toggle.getAttribute('href');
        if (href && href !== '#' && href !== '' && !toggle.hasAttribute('data-gcf-mini-cart-toggle')) {
          return; // Let the navigation redirect to the page
        }
        e.preventDefault();
        open();
      });
    });
    
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        close();
      });
    }
    
    overlay.addEventListener('click', close);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  });
}

// Mobile Filters Drawer Open/Close Handler
function initCollectionFiltersMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-filter-toggle');
  const closeBtn = document.getElementById('mobile-filter-close');
  const drawer = document.getElementById('collection-filters-drawer');
  
  if (!toggleBtn || !drawer) return;
  
  // Create or select the overlay
  let overlay = document.querySelector('.collection-drawer-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'collection-drawer-overlay';
    document.body.appendChild(overlay);
  }
  
  function openDrawer() {
    drawer.classList.add('show-drawer');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  }
  
  function closeDrawer() {
    drawer.classList.remove('show-drawer');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  
  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }
  overlay.addEventListener('click', closeDrawer);
  
  // Close drawer on window resize if layout switches to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      closeDrawer();
    }
  });
}

// Back-in-Stock Notification Form handler
function initNotifyModal() {
  const notifyForm = document.getElementById('notify-form');
  const modalEl = document.getElementById('notifyModal');
  if (!notifyForm || !modalEl) return;

  // Listen to modal open event to capture the product details from the clicked button
  modalEl.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    if (!button) return;

    // Capture product data attributes and store on the form
    notifyForm.dataset.productSku = button.getAttribute('data-product-sku') || '';
    notifyForm.dataset.productTitle = button.getAttribute('data-product-title') || '';
    notifyForm.dataset.productUrl = button.getAttribute('data-product-url') || '';
  });

  notifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = notifyForm.querySelector('input[type="email"]');
    const submitBtn = notifyForm.querySelector('button[type="submit"]');
    
    if (!emailInput || !emailInput.value) return;

    const email = emailInput.value;
    const sku = notifyForm.dataset.productSku || '';
    const title = notifyForm.dataset.productTitle || '';
    const url = notifyForm.dataset.productUrl || '';

    // UI Loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';

    try {
      const apiKey = (window.theme && window.theme.backorderApiKey) || '19fbe914177e43b396d23c0ef8971367';
      const apiUrl = (window.theme && window.theme.backorderApiUrl) || '/api/v1/backorders/public/subscribe';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          sku: sku,
          product_title: title,
          product_url: url,
          customer_email: email
        })
      });

      if (!response.ok) {
        throw new Error('API subscription failed');
      }

      // Bootstrap 5 modal hide
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        if (modal) modal.hide();
      } else {
        // Fallback if bootstrap object is not fully initialized
        modalEl.classList.remove('show');
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
      }

      if (typeof window.showGcfToast === 'function') {
        window.showGcfToast('Thank you! We will notify you when this item is back in stock.', 'success');
      }
      
      // Clear form inputs
      emailInput.value = '';
    } catch (error) {
      console.error('Error subscribing to backorder notifications:', error);
      if (typeof window.showGcfToast === 'function') {
        window.showGcfToast('Something went wrong. Please check your email and try again.', 'error');
      }
    } finally {
      // Restore button UI state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

// Quick View Modal Controller
document.addEventListener('click', (e) => {
  const qvBtn = e.target.closest('.quick-view-btn');
  if (!qvBtn) return;

  e.preventDefault();
  
  // Extract data attributes
  const handle = qvBtn.dataset.handle;
  const title = qvBtn.dataset.title;
  const price = qvBtn.dataset.price;
  const comparePrice = qvBtn.dataset.comparePrice;
  const image = qvBtn.dataset.image;
  const available = qvBtn.dataset.available === 'true';
  const sku = qvBtn.dataset.sku;
  const vendor = qvBtn.dataset.vendor;
  const url = qvBtn.dataset.url;
  const weight = qvBtn.dataset.weight;
  const dimensions = qvBtn.dataset.dimensions;
  const mpn = qvBtn.dataset.mpn;
  const dropShips = qvBtn.dataset.dropShips;
  const hazardous = qvBtn.dataset.hazardous;
  const truckFreight = qvBtn.dataset.truckFreight;
  const exportable = qvBtn.dataset.exportable;
  const firstClass = qvBtn.dataset.firstClass;
  const oversized = qvBtn.dataset.oversized;
  const remanufactured = qvBtn.dataset.remanufactured;
  const closeout = qvBtn.dataset.closeout;
  const countryOrigin = qvBtn.dataset.countryOrigin;
  const prop65 = qvBtn.dataset.prop65;
  const returnable = qvBtn.dataset.returnable;
  const googleCategory = qvBtn.dataset.googleCategory;
  const categories = qvBtn.dataset.categories;
  const variantId = qvBtn.dataset.variantId;
  const inventoryQuantity = parseInt(qvBtn.dataset.inventoryQuantity);
  const inventoryManagement = qvBtn.dataset.inventoryManagement;

  // Populate Modal Fields
  const modal = document.getElementById('quickViewModal');
  if (!modal) return;

  modal.querySelector('#qv-product-image').src = image;
  modal.querySelector('#qv-product-image').alt = title;
  modal.querySelector('#qv-product-title').textContent = title;
  modal.querySelector('#qv-product-price').textContent = price;

  const compPriceEl = modal.querySelector('#qv-product-compare-price');
  if (comparePrice) {
    compPriceEl.textContent = comparePrice;
    compPriceEl.classList.remove('d-none');
  } else {
    compPriceEl.classList.add('d-none');
  }

  // Stock Badge
  const stockEl = modal.querySelector('#qv-product-stock');
  const addForm = modal.querySelector('#qv-add-to-cart-form');
  if (available) {
    if (inventoryManagement && inventoryQuantity > 0 && inventoryQuantity <= 10) {
      if (inventoryQuantity <= 5) {
        stockEl.className = 'stock-status-pill';
        stockEl.style.backgroundColor = '#fee2e2';
        stockEl.style.color = '#dc2626';
        stockEl.style.borderColor = '#fee2e2';
        stockEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Only ${inventoryQuantity} left – order soon!`;
      } else {
        stockEl.className = 'stock-status-pill';
        stockEl.style.backgroundColor = '#ffedd5';
        stockEl.style.color = '#ea580c';
        stockEl.style.borderColor = '#ffedd5';
        stockEl.innerHTML = `<i class="fa-solid fa-bolt-lightning"></i> Low stock – selling fast`;
      }
    } else {
      stockEl.className = 'stock-status-pill stock-in';
      stockEl.style.backgroundColor = '';
      stockEl.style.color = '';
      stockEl.style.borderColor = '';
      stockEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> In stock';
    }
    if (addForm) addForm.classList.remove('d-none');
  } else {
    stockEl.className = 'stock-status-pill stock-out';
    stockEl.style.backgroundColor = '';
    stockEl.style.color = '';
    stockEl.style.borderColor = '';
    stockEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Out of stock';
    if (addForm) addForm.classList.add('d-none');
  }

  // Populate Specifications
  modal.querySelector('.qv-spec-weight').textContent = weight || '-';
  modal.querySelector('.qv-spec-dimensions').textContent = dimensions || '-';
  modal.querySelector('.qv-spec-mpn').textContent = mpn || '-';
  modal.querySelector('.qv-spec-vendor').textContent = vendor || '-';
  modal.querySelector('.qv-spec-drop-ships').textContent = dropShips || 'no';
  modal.querySelector('.qv-spec-hazardous').textContent = hazardous || 'no';
  modal.querySelector('.qv-spec-truck-freight').textContent = truckFreight || 'no';
  modal.querySelector('.qv-spec-exportable').textContent = exportable || 'no';
  modal.querySelector('.qv-spec-first-class').textContent = firstClass || 'no';
  modal.querySelector('.qv-spec-oversized').textContent = oversized || 'no';
  modal.querySelector('.qv-spec-remanufactured').textContent = remanufactured || 'no';
  modal.querySelector('.qv-spec-closeout').textContent = closeout || 'no';
  modal.querySelector('.qv-spec-country-origin').textContent = countryOrigin || '-';
  modal.querySelector('.qv-spec-prop-65').textContent = prop65 || 'no';
  modal.querySelector('.qv-spec-returnable').textContent = returnable || 'no';
  modal.querySelector('.qv-spec-google-category').textContent = googleCategory || '-';

  // Variant ID for Add to Cart
  modal.querySelector('#qv-variant-id').value = variantId;

  // Metadata
  modal.querySelector('.qv-meta-sku').textContent = sku || '-';
  modal.querySelector('.qv-meta-categories').innerHTML = categories || '-';
  modal.querySelector('.qv-meta-brand').textContent = vendor || '-';

  // Share links
  const absoluteUrl = window.location.origin + url;
  const shareContainer = modal.querySelector('.qv-meta-share');
  shareContainer.innerHTML = `
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}" target="_blank" class="text-muted hover:text-primary me-2"><i class="fa-brands fa-facebook-f"></i></a>
    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(absoluteUrl)}&text=${encodeURIComponent(title)}" target="_blank" class="text-muted hover:text-primary me-2"><i class="fa-brands fa-twitter"></i></a>
    <a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(absoluteUrl)}&description=${encodeURIComponent(title)}&media=${encodeURIComponent(image)}" target="_blank" class="text-muted hover:text-primary me-2"><i class="fa-brands fa-pinterest-p"></i></a>
    <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(absoluteUrl)}&title=${encodeURIComponent(title)}" target="_blank" class="text-muted hover:text-primary"><i class="fa-brands fa-linkedin-in"></i></a>
  `;

  // Reset Quantity Input
  const qtyInput = modal.querySelector('.qty-input');
  if (qtyInput) qtyInput.value = '1';

  // Show Bootstrap 5 Modal
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    let bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (!bootstrapModal) {
      bootstrapModal = new bootstrap.Modal(modal);
    }
    bootstrapModal.show();
  }
});

// Ajax Add To Cart handler
function initAjaxAddToCart() {
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form');
    if (!form) return;
    const action = form.getAttribute('action') || '';
    if (!action.includes('/cart/add')) return;

    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    if (!submitBtn) return;

    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;

    // Show spinner loader state on button
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Adding...`;

    const formData = new FormData(form);
    const rootPath = window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/';

    fetch(rootPath + 'cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      if (typeof window.showGcfToast === 'function') {
        window.showGcfToast(`${data.title || 'Product'} added to your cart!`, 'success');
      }

      // Update cart count badges and floating cart contents
      fetch(rootPath + 'cart.js')
      .then(res => res.json())
      .then(cart => {
        document.querySelectorAll('.header-cart-count').forEach(el => {
          el.textContent = cart.item_count;
        });
        const floatingBadge = document.querySelector('.floating-cart-count');
        if (floatingBadge) {
          floatingBadge.textContent = cart.item_count;
        }
        document.querySelectorAll('[data-gcf-mini-cart-toggle="true"] .badge').forEach(el => {
          el.textContent = cart.item_count;
        });
        
        // Render updated items
        renderFloatingCartItems(cart);
        
        // Open the Bootstrap Offcanvas drawer
        const cartDrawerEl = document.getElementById('cartDrawer');
        if (cartDrawerEl && typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
          const offcanvas = bootstrap.Offcanvas.getInstance(cartDrawerEl) || new bootstrap.Offcanvas(cartDrawerEl);
          if (offcanvas) offcanvas.show();
        }
      });
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      if (typeof window.showGcfToast === 'function') {
        window.showGcfToast('Failed to add product to cart.', 'error');
      }
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
    });
  });
}

// Floating Popover Cart & Offcanvas Drawer behavior
function initFloatingCart() {
  const trigger = document.getElementById('floating-cart-trigger');
  const popover = document.getElementById('floating-cart-popover');
  const closeBtn = document.getElementById('floating-cart-close');
  const drawer = document.getElementById('cartDrawer');
  
  // Toggle Popover
  if (trigger && popover) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.toggle('d-none');
      if (!popover.classList.contains('d-none')) {
        updateFloatingCartContent();
      }
    });

    // Close Popover
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.classList.add('d-none');
      });
    }

    // Click outside to close Popover
    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
        popover.classList.add('d-none');
      }
    });
  }

  // Update cart contents when the offcanvas drawer starts to show
  if (drawer) {
    drawer.addEventListener('show.bs.offcanvas', () => {
      updateFloatingCartContent();
    });
  }

  // Common Remove Item Handler
  const handleRemoveItem = (e) => {
    const removeBtn = e.target.closest('.btn-remove-item');
    if (!removeBtn) return;
    
    e.preventDefault();
    const variantId = removeBtn.dataset.variantId;
    if (!variantId) return;
    
    removeBtn.disabled = true;
    removeBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
    
    const rootPath = window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/';
    
    fetch(rootPath + 'cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 0 })
    })
    .then(res => res.json())
    .then(cart => {
      // Update counts
      document.querySelectorAll('.header-cart-count').forEach(el => {
        el.textContent = cart.item_count;
      });
      const floatingBadge = document.querySelector('.floating-cart-count');
      if (floatingBadge) {
        floatingBadge.textContent = cart.item_count;
      }
      document.querySelectorAll('[data-gcf-mini-cart-toggle="true"] .badge').forEach(badge => {
        badge.textContent = cart.item_count;
      });
      
      // Re-render contents
      renderFloatingCartItems(cart);
    })
    .catch(err => {
      console.error('Failed to remove item:', err);
      removeBtn.disabled = false;
      removeBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    });
  };

  // Bind remove handlers to both containers if they exist
  if (popover) popover.addEventListener('click', handleRemoveItem);
  if (drawer) drawer.addEventListener('click', handleRemoveItem);
}

// Function to fetch and update floating cart content
function updateFloatingCartContent() {
  const rootPath = window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/';
  fetch(rootPath + 'cart.js')
  .then(res => res.json())
  .then(cart => {
    renderFloatingCartItems(cart);
  });
}

// Function to render items inside both the popover and the drawer
function renderFloatingCartItems(cart) {
  const formatString = window.theme ? window.theme.moneyFormat : "$ {{amount}}";
  
  // Update subtotal (drawer only)
  const subtotalContainer = document.getElementById('cart-drawer-subtotal');
  if (subtotalContainer) {
    const formattedTotal = formatString.replace(/\{\{\s*(\w+)\s*\}\}/, (cart.total_price / 100.0).toFixed(2));
    subtotalContainer.textContent = formattedTotal;
  }
  
  let html = '';
  if (cart.items && cart.items.length > 0) {
    cart.items.forEach((item, index) => {
      const formattedPrice = formatString.replace(/\{\{\s*(\w+)\s*\}\}/, (item.final_line_price / 100.0).toFixed(2));
      const imageUrl = item.image ? item.image : '';
      
      html += `
        <div class="cart-item-row d-flex align-items-center gap-3 p-3 bg-light rounded-4 mb-3 position-relative" data-line="${index + 1}">
          ${imageUrl ? `<img src="${imageUrl}" alt="${item.product_title}" class="rounded-3 border" style="width: 60px; height: 60px; object-fit: cover;" width="60" height="60">` : `
            <div class="rounded-3 border overflow-hidden" style="width: 60px; height: 60px; flex-shrink: 0;">
              <svg class="placeholder-svg w-100 h-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="#f8f9fa"></rect></svg>
            </div>
          `}
          <div class="flex-grow-1 overflow-hidden" style="padding-right: 35px;">
            <h6 class="mb-1 text-truncate fw-medium text-dark" style="font-size: 14px;">${item.product_title}</h6>
            <div class="text-primary fw-medium" style="font-size: 13px;">${formattedPrice}</div>
          </div>
          <button class="btn-remove-item border-0 bg-transparent text-danger position-absolute end-0 top-50 translate-middle-y me-3" data-variant-id="${item.variant_id}" aria-label="Remove item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    });
  } else {
    html = `
      <div class="text-center py-5 text-muted">
        <i class="fa-solid fa-basket-shopping fa-3x mb-3 text-secondary"></i>
        <p class="mb-0">Your cart is empty</p>
      </div>
    `;
  }

  // Render HTML in both containers
  const popoverContainer = document.getElementById('floating-cart-items-container');
  if (popoverContainer) popoverContainer.innerHTML = html;

  const drawerContainer = document.getElementById('cart-drawer-items-container');
  if (drawerContainer) drawerContainer.innerHTML = html;
}
