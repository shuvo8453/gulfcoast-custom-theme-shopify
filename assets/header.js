// Custom Header navigation drawer and tab toggling scripts
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.mobile-menu-trigger-btn');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.querySelector('.drawer-nav-close-btn');
  const backdrop = document.querySelector('.drawer-nav-backdrop');

  const toggleDrawer = () => {
    if (!drawer) return;
    drawer.classList.toggle('open');
    const isOpen = drawer.classList.contains('open');
    drawer.setAttribute('aria-hidden', !isOpen);
  };

  if (trigger) trigger.addEventListener('click', toggleDrawer);
  if (closeBtn) closeBtn.addEventListener('click', toggleDrawer);
  if (backdrop) backdrop.addEventListener('click', toggleDrawer);

  // Tab switcher logic inside drawer
  const tabButtons = document.querySelectorAll('.drawer-tab-btn');
  const tabPanes = document.querySelectorAll('.drawer-tab-content-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active-pane'));

      btn.classList.add('active');
      const target = btn.getAttribute('data-target');
      const targetPane = document.getElementById(target);
      if (targetPane) {
        targetPane.classList.add('active-pane');
      }
    });
  });

  // Submenu Toggle within Categories Tab
  const toggles = document.querySelectorAll('.drawer-submenu-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const item = e.target.closest('.drawer-category-item');
      if (!item) return;
      const submenu = item.querySelector('.drawer-submenu-list');
      if (submenu) {
        submenu.classList.toggle('d-none');
        const chevron = toggle.querySelector('i');
        if (chevron) {
          if (chevron.classList.contains('fa-chevron-down')) {
            chevron.classList.replace('fa-chevron-down', 'fa-chevron-up');
          } else {
            chevron.classList.replace('fa-chevron-up', 'fa-chevron-down');
          }
        }
      }
    });
  });

  // Integrated Search Box & Predictive Search logic
  const searchForm = document.querySelector('.search-bar-form');
  const searchInput = document.querySelector('.search-input');
  const searchDropdown = document.querySelector('[data-gcf-live-search-results="true"]');
  const searchResultsInner = document.querySelector('[data-gcf-live-search-results-inner="true"]');
  const categorySelect = document.querySelector('.category-select');

  if (searchForm && searchInput && searchDropdown && searchResultsInner) {
    let debounceTimeout;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimeout);
      const query = searchInput.value.trim();

      if (query.length < 2) {
        searchDropdown.classList.add('d-none');
        searchResultsInner.innerHTML = '';
        return;
      }

      debounceTimeout = setTimeout(() => {
        performLiveSearch(query);
      }, 250);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!searchForm.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.add('d-none');
      }
    });

    // Show dropdown again when input is focused (if it has query)
    searchInput.addEventListener('focus', () => {
      const query = searchInput.value.trim();
      if (query.length >= 2 && searchResultsInner.children.length > 0) {
        searchDropdown.classList.remove('d-none');
      }
    });

    async function performLiveSearch(query) {
      // Build API request URL
      let searchUrl = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`;
      
      // If collection is selected, filter inside that collection
      if (categorySelect && categorySelect.value !== 'last') {
        const collectionHandle = categorySelect.value;
        searchUrl = `/search/suggest.json?q=collection:${collectionHandle}+${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`;
      }

      try {
        searchResultsInner.innerHTML = `
          <div class="p-3 text-center text-muted" style="font-size: 13px;">
            <i class="fa-solid fa-circle-notch fa-spin me-2"></i> Searching...
          </div>
        `;
        searchDropdown.classList.remove('d-none');

        const response = await fetch(searchUrl);
        const data = await response.json();
        const products = data.resources?.results?.products || [];

        if (products.length === 0) {
          searchResultsInner.innerHTML = `
            <div class="p-3 text-center text-muted" style="font-size: 13px;">
              No products found for "${query}"
            </div>
          `;
          return;
        }

        let html = '<div class="predictive-search-results-list d-flex flex-column">';
        products.forEach(product => {
          // Format price
          const price = parseFloat(product.price).toFixed(2);
          const formattedPrice = `$${price}`;

          html += `
            <a href="${product.url}" class="predictive-search-item">
              <div class="predictive-search-image-wrapper">
                <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.title}">
              </div>
              <div class="predictive-search-info">
                <h4 class="predictive-search-title">${product.title}</h4>
                <p class="predictive-search-vendor">${product.vendor || ''}</p>
              </div>
              <div class="predictive-search-price">
                ${formattedPrice}
              </div>
            </a>
          `;
        });
        html += '</div>';

        // Add view all link
        const viewAllUrl = categorySelect && categorySelect.value !== 'last' 
          ? `/collections/${categorySelect.value}?q=${encodeURIComponent(query)}`
          : `/search?type=product&q=${encodeURIComponent(query)}`;
        
        html += `
          <div class="border-top mt-2 pt-2 text-center">
            <a href="${viewAllUrl}" class="btn btn-sm btn-link text-decoration-none fw-bold" style="font-size: 13px; color: #3b52c4;">
              View all results <i class="fa-solid fa-arrow-right ms-1"></i>
            </a>
          </div>
        `;

        searchResultsInner.innerHTML = html;

      } catch (error) {
        console.error(error);
        searchResultsInner.innerHTML = `
          <div class="p-3 text-center text-danger small">
            Failed to load search results.
          </div>
        `;
      }
    }
  }

  // Mobile Drawer Search Box & Predictive Search logic
  const searchInputDrawer = document.querySelector('.search-input-drawer');
  const searchDropdownDrawer = document.querySelector('[data-gcf-live-search-results-drawer="true"]');
  const searchResultsInnerDrawer = document.querySelector('[data-gcf-live-search-results-inner-drawer="true"]');

  if (searchInputDrawer && searchDropdownDrawer && searchResultsInnerDrawer) {
    let debounceTimeoutDrawer;

    searchInputDrawer.addEventListener('input', () => {
      clearTimeout(debounceTimeoutDrawer);
      const query = searchInputDrawer.value.trim();

      if (query.length < 2) {
        searchDropdownDrawer.classList.add('d-none');
        searchResultsInnerDrawer.innerHTML = '';
        return;
      }

      debounceTimeoutDrawer = setTimeout(() => {
        performLiveSearchDrawer(query);
      }, 250);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!searchInputDrawer.contains(e.target) && !searchDropdownDrawer.contains(e.target)) {
        searchDropdownDrawer.classList.add('d-none');
      }
    });

    // Show dropdown again when input is focused (if it has query)
    searchInputDrawer.addEventListener('focus', () => {
      const query = searchInputDrawer.value.trim();
      if (query.length >= 2 && searchResultsInnerDrawer.children.length > 0) {
        searchDropdownDrawer.classList.remove('d-none');
      }
    });

    async function performLiveSearchDrawer(query) {
      let searchUrl = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`;

      try {
        searchResultsInnerDrawer.innerHTML = `
          <div class="p-3 text-center text-muted" style="font-size: 13px;">
            <i class="fa-solid fa-circle-notch fa-spin me-2"></i> Searching...
          </div>
        `;
        searchDropdownDrawer.classList.remove('d-none');

        const response = await fetch(searchUrl);
        const data = await response.json();
        const products = data.resources?.results?.products || [];

        if (products.length === 0) {
          searchResultsInnerDrawer.innerHTML = `
            <div class="p-3 text-center text-muted" style="font-size: 13px;">
              No products found for "${query}"
            </div>
          `;
          return;
        }

        let html = '<div class="predictive-search-results-list d-flex flex-column">';
        products.forEach(product => {
          const price = parseFloat(product.price).toFixed(2);
          const formattedPrice = `$${price}`;

          html += `
            <a href="${product.url}" class="predictive-search-item">
              <div class="predictive-search-image-wrapper">
                <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.title}">
              </div>
              <div class="predictive-search-info">
                <h4 class="predictive-search-title">${product.title}</h4>
                <p class="predictive-search-vendor">${product.vendor || ''}</p>
              </div>
              <div class="predictive-search-price">
                ${formattedPrice}
              </div>
            </a>
          `;
        });
        html += '</div>';

        html += `
          <div class="border-top mt-2 pt-2 text-center">
            <a href="/search?type=product&q=${encodeURIComponent(query)}" class="btn btn-sm btn-link text-decoration-none fw-bold" style="font-size: 13px; color: #3b52c4;">
              View all results <i class="fa-solid fa-arrow-right ms-1"></i>
            </a>
          </div>
        `;

        searchResultsInnerDrawer.innerHTML = html;

      } catch (error) {
        console.error(error);
        searchResultsInnerDrawer.innerHTML = `
          <div class="p-3 text-center text-danger small">
            Failed to load search results.
          </div>
        `;
      }
    }
  }

  // Smart Sticky Header (Reveal on Scroll Up)
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      // 1. Near the top of the page: reset header to inline state
      if (currentScrollY <= 180) {
        header.classList.remove('header-sticky', 'header-hidden');
        lastScrollY = currentScrollY;
        return;
      }

      // 2. Scrolling Down: Hide the header (only if past 300px to hide layout shift off-screen)
      if (currentScrollY > lastScrollY) {
        if (currentScrollY > 300) {
          header.classList.add('header-sticky');
          header.classList.add('header-hidden');
        }
      } 
      // 3. Scrolling Up: Reveal the sticky header
      else if (currentScrollY < lastScrollY && currentScrollY > 300) {
        header.classList.add('header-sticky');
        header.classList.remove('header-hidden');
      }

      lastScrollY = currentScrollY;
    });
  }
});

