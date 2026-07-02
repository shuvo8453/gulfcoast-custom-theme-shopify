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
    { toggle: '[data-gcf-mini-cart-toggle="true"]', drawer: '[data-gcf-mini-cart="true"]', bodyClass: 'has-mini-cart-open' },
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
  if (!notifyForm) return;

  notifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = notifyForm.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
      const modalEl = document.getElementById('notifyModal');
      
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
      emailInput.value = '';
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
    stockEl.className = 'stock-status-pill stock-in';
    stockEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> In stock';
    if (addForm) addForm.classList.remove('d-none');
  } else {
    stockEl.className = 'stock-status-pill stock-out';
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

