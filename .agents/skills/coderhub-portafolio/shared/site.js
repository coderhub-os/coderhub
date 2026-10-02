// site.js — portafolio: toggle claro/oscuro + selector de idioma.
// Sin dependencias, sin cookies, sin requests. El modo inicial lo fija un
// script inline en <head> (antes del paint); acá solo se cambia y se guarda.
(function () {
  'use strict';
  var KEY = 'portafolio-mode';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function stored() {
    try {
      var m = localStorage.getItem(KEY);
      return m === 'light' || m === 'dark' ? m : null;
    } catch (e) {
      return null;
    }
  }
  function current() {
    return root.getAttribute('data-mode') === 'dark' ? 'dark' : 'light';
  }
  function sync() {
    var dark = current() === 'dark';
    var buttons = document.querySelectorAll('[data-mode-toggle]');
    for (var i = 0; i < buttons.length; i++) buttons[i].setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  function set(mode, persist) {
    root.setAttribute('data-mode', mode);
    if (persist) {
      try {
        localStorage.setItem(KEY, mode);
      } catch (e) {}
    }
    sync();
  }

  if (!root.getAttribute('data-mode')) set(media && media.matches ? 'dark' : 'light', false);
  sync();

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('[data-mode-toggle]');
    if (btn) {
      set(current() === 'dark' ? 'light' : 'dark', true);
      return;
    }
    // Selector de idioma: conserva la sección (#ancla) al cambiar de idioma.
    var link = ev.target.closest && ev.target.closest('a.lang__link');
    if (link && location.hash && !link.hasAttribute('aria-current')) link.setAttribute('href', link.getAttribute('href').split('#')[0] + location.hash);
  });

  // Si la persona nunca eligió, sigue al sistema.
  if (media) {
    var onChange = function (e) {
      if (!stored()) set(e.matches ? 'dark' : 'light', false);
    };
    if (media.addEventListener) media.addEventListener('change', onChange);
    else if (media.addListener) media.addListener(onChange);
  }
})();
