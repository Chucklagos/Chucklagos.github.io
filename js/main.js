(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('.site-nav');
  const year = document.getElementById('year');

  const preferredTheme = () => {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const updateThemeLabel = () => {
    if (!themeToggle) return;
    const nextTheme = preferredTheme() === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    themeToggle.title = `Switch to ${nextTheme} theme`;
  };

  themeToggle?.addEventListener('click', () => {
    const theme = preferredTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (error) { /* Theme still works for this page view. */ }
    updateThemeLabel();
  });

  const closeNavigation = () => {
    if (!navToggle || !navigation) return;
    navigation.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.querySelector('.sr-only').textContent = 'Open navigation';
  };

  navToggle?.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeNavigation();
    else {
      navigation?.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.querySelector('.sr-only').textContent = 'Close navigation';
    }
  });

  navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavigation();
  });

  window.matchMedia('(min-width: 921px)').addEventListener('change', (event) => {
    if (event.matches) closeNavigation();
  });

  if (year) year.textContent = String(new Date().getFullYear());
  updateThemeLabel();
})();
