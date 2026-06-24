/**
 * Gulf Coast Outfitters - Wishlist & Compare Manager (Vanilla JS)
 */

const WishlistManager = {
  get: () => JSON.parse(localStorage.getItem('gcf_wishlist') || '[]'),
  has: (handle) => WishlistManager.get().includes(handle),
  toggle: (handle) => {
    let list = WishlistManager.get();
    const idx = list.indexOf(handle);
    let added = false;
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(handle);
      added = true;
    }
    localStorage.setItem('gcf_wishlist', JSON.stringify(list));
    document.dispatchEvent(new CustomEvent('wishlist:updated', { detail: { handle, added } }));
    return added;
  }
};

const CompareManager = {
  get: () => JSON.parse(localStorage.getItem('gcf_compare') || '[]'),
  has: (handle) => CompareManager.get().includes(handle),
  toggle: (handle) => {
    let list = CompareManager.get();
    const idx = list.indexOf(handle);
    let added = false;
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      if (list.length >= 4) {
        if (typeof window.showGcfToast === 'function') {
          window.showGcfToast('You can compare up to 4 items max.', 'error');
        }
        return false;
      }
      list.push(handle);
      added = true;
    }
    localStorage.setItem('gcf_compare', JSON.stringify(list));
    document.dispatchEvent(new CustomEvent('compare:updated', { detail: { handle, added } }));
    return added;
  }
};

// UI Bindings
document.addEventListener('DOMContentLoaded', () => {
  updateButtonsState();

  // Watch for dynamic clicks
  document.addEventListener('click', (e) => {
    const wishlistBtn = e.target.closest('.wishlist-btn-toggle');
    if (wishlistBtn) {
      e.preventDefault();
      const handle = wishlistBtn.dataset.handle;
      if (!handle) return;
      
      const added = WishlistManager.toggle(handle);
      if (typeof window.showGcfToast === 'function') {
        window.showGcfToast(added ? 'Added to Wishlist!' : 'Removed from Wishlist!', 'success');
      }
    }

    const compareBtn = e.target.closest('.compare-btn-toggle');
    if (compareBtn) {
      e.preventDefault();
      const handle = compareBtn.dataset.handle;
      if (!handle) return;
      
      const result = CompareManager.toggle(handle);
      if (result !== false && typeof window.showGcfToast === 'function') {
        window.showGcfToast(result ? 'Added to Compare!' : 'Removed from Compare!', 'success');
      }
    }
  });

  // Watch update events to sync UI state
  document.addEventListener('wishlist:updated', () => {
    updateButtonsState();
    renderWishlistDrawer();
  });

  document.addEventListener('compare:updated', () => {
    updateButtonsState();
    renderCompareDrawer();
  });

  // Init drawers render
  renderWishlistDrawer();
  renderCompareDrawer();
});

// Update grid heart and exchange icon styles
function updateButtonsState() {
  const wishlistButtons = document.querySelectorAll('.wishlist-btn-toggle');
  wishlistButtons.forEach(btn => {
    const handle = btn.dataset.handle;
    const isWishlisted = WishlistManager.has(handle);
    const icon = btn.querySelector('i');
    
    btn.classList.toggle('is-active', isWishlisted);
    if (icon) {
      if (isWishlisted) {
        icon.className = 'fa-solid fa-heart text-danger';
      } else {
        icon.className = 'fa-regular fa-heart';
      }
    }
  });

  const compareButtons = document.querySelectorAll('.compare-btn-toggle');
  compareButtons.forEach(btn => {
    const handle = btn.dataset.handle;
    const isCompared = CompareManager.has(handle);
    
    btn.classList.toggle('is-active', isCompared);
  });

  // Update counts in header badges
  const wishlistBadges = document.querySelectorAll('.header-wishlist-count');
  wishlistBadges.forEach(badge => {
    badge.textContent = WishlistManager.get().length;
  });

  const compareBadges = document.querySelectorAll('.header-compare-count');
  compareBadges.forEach(badge => {
    badge.textContent = CompareManager.get().length;
  });
}

// Render dynamic Wishlist Drawer content
function renderWishlistDrawer() {
  const container = document.querySelector('[data-gcf-wishlist-drawer-content="true"]');
  if (!container) return;

  const list = WishlistManager.get();
  if (list.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">Your wishlist is empty.</p>';
    return;
  }

  container.innerHTML = '<div class="d-flex justify-content-center py-4"><i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i></div>';

  const promises = list.map(handle => fetch(`/products/${handle}.js`).then(res => res.json()));

  Promise.all(promises)
    .then(products => {
      container.innerHTML = products.map(product => {
        const formattedPrice = formatMoney(product.price);
        return `
          <div class="wishlist-item d-flex gap-3 mb-3 pb-3 border-bottom align-items-center">
            <img src="${product.featured_image}" class="rounded border" style="width: 60px; height: 60px; object-fit: cover;" alt="${product.title}">
            <div class="flex-grow-1 min-w-0">
              <h6 class="small fw-bold text-dark text-truncate mb-1"><a href="${product.url}">${product.title}</a></h6>
              <span class="small text-primary fw-bold">${formattedPrice}</span>
            </div>
            <button class="btn btn-sm btn-outline-danger border-0 wishlist-btn-toggle" data-handle="${product.handle}" title="Remove">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
      }).join('');
    })
    .catch(err => {
      console.error('Error rendering wishlist drawer:', err);
      container.innerHTML = '<p class="text-danger small text-center">Failed to load wishlist items.</p>';
    });
}

// Render dynamic Compare Drawer content
function renderCompareDrawer() {
  const container = document.querySelector('[data-gcf-compare-drawer-content="true"]');
  if (!container) return;

  const list = CompareManager.get();
  if (list.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No products selected for comparison.</p>';
    return;
  }

  container.innerHTML = '<div class="d-flex justify-content-center py-4"><i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i></div>';

  const promises = list.map(handle => fetch(`/products/${handle}.js`).then(res => res.json()));

  Promise.all(promises)
    .then(products => {
      container.innerHTML = products.map(product => {
        const formattedPrice = formatMoney(product.price);
        return `
          <div class="compare-item d-flex gap-3 mb-3 pb-3 border-bottom align-items-center">
            <img src="${product.featured_image}" class="rounded border" style="width: 60px; height: 60px; object-fit: cover;" alt="${product.title}">
            <div class="flex-grow-1 min-w-0">
              <h6 class="small fw-bold text-dark text-truncate mb-1"><a href="${product.url}">${product.title}</a></h6>
              <span class="small text-primary fw-bold">${formattedPrice}</span>
            </div>
            <button class="btn btn-sm btn-outline-danger border-0 compare-btn-toggle" data-handle="${product.handle}" title="Remove">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
      }).join('');
      
      // If we have items to compare, append an action link to view full compare table
      if (products.length > 0) {
        container.innerHTML += `
          <div class="mt-4">
            <a href="/pages/compare" class="btn btn-primary w-100 btn-sm">Compare Selected Products</a>
          </div>
        `;
      }
    })
    .catch(err => {
      console.error('Error rendering compare drawer:', err);
      container.innerHTML = '<p class="text-danger small text-center">Failed to load compare items.</p>';
    });
}

// Money Formatting Utility
function formatMoney(cents) {
  const formatString = window.theme ? window.theme.moneyFormat : "$ {{amount}}";
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;

  if (isNaN(cents) || cents == null) return "$0.00";
  let formatted = (cents / 100.0).toFixed(2);
  
  return formatString.replace(placeholderRegex, formatted);
}
