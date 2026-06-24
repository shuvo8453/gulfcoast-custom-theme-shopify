/**
 * Gulf Coast Outfitters - Core Theme Script (Vanilla JS)
 */
document.addEventListener('DOMContentLoaded', () => {
  // Init features
  initQuantityControls();
  initScrollToTop();
  initFAQAccordion();
  initDrawers();
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
