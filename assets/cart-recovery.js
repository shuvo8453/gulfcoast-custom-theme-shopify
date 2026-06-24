/**
 * Gulf Coast Outfitters - Cart Recovery Toast Script (Client-Side)
 */
document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('gcf-cart-recovery-toast');
  if (!toast) return;

  // Do not show on cart or checkout page
  if (window.location.pathname === '/cart' || window.location.pathname.includes('/checkout')) return;

  // Do not show if closed during the current session
  if (sessionStorage.getItem('gcf_cart_recovery_closed') === 'true') return;

  const showDelay = parseInt(toast.dataset.delay, 10) || 5000;

  setTimeout(() => {
    fetch('/cart.js')
      .then(res => res.json())
      .then(cart => {
        if (cart.item_count > 0) {
          const container = document.getElementById('recovery-items-container');
          if (!container) return;

          container.innerHTML = cart.items.map(item => {
            const formattedPrice = formatMoney(item.price);
            return `
              <div class="recovery-item d-flex gap-3 mb-3 align-items-center">
                <img src="${item.image}" class="rounded border" style="width: 50px; height: 50px; object-fit: cover;" alt="${item.title}">
                <div class="flex-grow-1 min-w-0">
                  <span class="d-block small fw-bold text-truncate text-dark mb-0">${item.product_title}</span>
                  <span class="small text-muted">${formattedPrice} x ${item.quantity}</span>
                </div>
              </div>
            `;
          }).join('');

          // Show the toast popup
          toast.classList.remove('d-none');
        }
      })
      .catch(err => console.error('Error fetching cart for recovery:', err));
  }, showDelay);

  // Bind close action
  const closeBtn = toast.querySelector('.close-toast');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.classList.add('d-none');
      sessionStorage.setItem('gcf_cart_recovery_closed', 'true');
    });
  }

  // Format price helper
  function formatMoney(cents) {
    const formatString = window.theme ? window.theme.moneyFormat : "$ {{amount}}";
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;

    if (isNaN(cents) || cents == null) return "$0.00";
    let formatted = (cents / 100.0).toFixed(2);
    
    // Simple replacement
    return formatString.replace(placeholderRegex, formatted);
  }
});
