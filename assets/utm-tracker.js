/**
 * Gulf Coast Outfitters - UTM Tracker & Attribution Script
 */
(function() {
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', '_kx'];
  const getParams = new URLSearchParams(window.location.search);
  let utmData = {};

  utmKeys.forEach(key => {
    let val = getParams.get(key);
    if (val) {
      localStorage.setItem(`gcf_${key}`, val);
      utmData[key] = val;
    } else {
      let storedVal = localStorage.getItem(`gcf_${key}`);
      if (storedVal) utmData[key] = storedVal;
    }
  });

  // Automatically attach to Shopify Cart attributes so they pass to checkout orders
  if (Object.keys(utmData).length > 0) {
    fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes: utmData })
    })
    .catch(err => console.error('Failed to sync UTM parameters with cart:', err));
  }

  // Update dynamic internal links on page load if needed (helps preserve session attribution)
  document.addEventListener('DOMContentLoaded', () => {
    if (!utmData.utm_source) return;
    
    document.querySelectorAll('a[href]').forEach(link => {
      let href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//') && !href.includes('/cart') && !href.includes('/checkout')) {
        try {
          let url = new URL(href, window.location.origin);
          Object.keys(utmData).forEach(key => {
            url.searchParams.set(key, utmData[key]);
          });
          link.href = url.pathname + url.search;
        } catch(e) {
          // Fallback if URL parsing fails
        }
      }
    });
  });
})();
