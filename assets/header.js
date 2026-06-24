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
});
