/**
 * Gulf Coast Outfitters - Checklist Bundle Cart Script
 */
document.addEventListener('DOMContentLoaded', () => {
  const bundleContainer = document.querySelector('.gcf-bundle-section');
  if (!bundleContainer) return;

  const cards = bundleContainer.querySelectorAll('.bundle-product-card');
  const checkboxes = bundleContainer.querySelectorAll('.bundle-checkbox');
  const totalPriceElement = bundleContainer.querySelector('.bundle-total-price');
  const addBtn = bundleContainer.querySelector('.add-bundle-to-cart');

  const discountValue = parseFloat(bundleContainer.dataset.discountValue) || 0;
  const discountType = bundleContainer.dataset.discountType || 'percentage'; // 'percentage' or 'fixed'

  function calculateBundleTotal() {
    let subtotal = 0;
    let selectedCount = 0;

    cards.forEach(card => {
      const checkbox = card.querySelector('.bundle-checkbox');
      if (checkbox && checkbox.checked) {
        subtotal += parseFloat(card.dataset.price);
        selectedCount++;
      }
    });

    // Apply bundle discount logic on frontend view
    let finalTotal = subtotal;
    if (selectedCount > 1 && discountValue > 0) {
      if (discountType === 'percentage') {
        finalTotal = subtotal * (1 - (discountValue / 100));
      } else if (discountType === 'fixed') {
        finalTotal = Math.max(0, subtotal - (discountValue * 100));
      }
    }

    if (totalPriceElement) {
      totalPriceElement.innerHTML = formatMoney(finalTotal);
    }
  }

  function formatMoney(cents) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    let value = '';
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatString = window.theme ? window.theme.moneyFormat : "$ {{amount}}";

    function defaultOption(opt, def) {
      return (typeof opt == 'undefined' ? def : opt);
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal   = defaultOption(decimal, '.');

      if (isNaN(number) || number == null) return 0;

      number = (number/100.0).toFixed(precision);

      var parts   = number.split('.'),
          dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
          cents   = parts[1] ? (decimal + parts[1]) : '';

      return dollars + cents;
    }

    switch(formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  // Bind checkbox changes
  checkboxes.forEach(box => {
    box.addEventListener('change', calculateBundleTotal);
  });

  // Bind click add bundle to cart
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addBtn.disabled = true;
      addBtn.textContent = 'Adding...';

      const items = [];
      cards.forEach(card => {
        const checkbox = card.querySelector('.bundle-checkbox');
        if (checkbox && checkbox.checked) {
          items.push({
            id: parseInt(card.dataset.variantId, 10),
            quantity: 1,
            properties: {
              '_bundle_reference': 'gulfcoast_custom_deal'
            }
          });
        }
      });

      if (items.length === 0) {
        addBtn.disabled = false;
        addBtn.textContent = 'Add Bundle to Cart';
        return;
      }

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items })
      })
      .then(res => res.json())
      .then(data => {
        if (typeof window.showGcfToast === 'function') {
          window.showGcfToast('Bundle added to your cart!', 'success');
        }
        
        // Refresh cart drawer or redirect
        setTimeout(() => {
          window.location.href = '/cart';
        }, 1000);
      })
      .catch(err => {
        console.error('Failed to add bundle to cart:', err);
        addBtn.disabled = false;
        addBtn.textContent = 'Add Bundle to Cart';
        if (typeof window.showGcfToast === 'function') {
          window.showGcfToast('Failed to add bundle.', 'error');
        }
      });
    });
  }

  // Initial calculation
  calculateBundleTotal();
});
