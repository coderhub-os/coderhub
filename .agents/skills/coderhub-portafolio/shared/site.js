// site.js — portafolio: toggle claro/oscuro, selector de idioma
// y el botón "Copiar para IA".
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

  // "Copiar para IA": copia el perfil en markdown embebido en la página (sin requests).
  function aiProfile() {
    var el = document.getElementById('ai-profile');
    if (!el) return '';
    return el.textContent.replace(/<\\\/(script)/gi, '</$1').replace(/<\\!--/g, '<!--').trim() + '\n';
  }
  function copyFallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }
  function copied(btn) {
    var label = btn.querySelector('[data-copy-ai-label]');
    var status = btn.parentNode.querySelector('[data-copy-ai-status]');
    if (!label) return;
    if (!btn.getAttribute('data-label')) btn.setAttribute('data-label', label.textContent);
    label.textContent = btn.getAttribute('data-copied');
    btn.classList.add('is-copied');
    if (status) status.textContent = btn.getAttribute('data-copied');
    clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(function () {
      label.textContent = btn.getAttribute('data-label');
      btn.classList.remove('is-copied');
      if (status) status.textContent = '';
    }, 2000);
  }
  function copyAi(btn) {
    var text = aiProfile();
    if (!text) return;
    var done = function () { copied(btn); };
    var fallback = function () { if (copyFallback(text)) done(); };
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
  }

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('[data-mode-toggle]');
    if (btn) {
      set(current() === 'dark' ? 'light' : 'dark', true);
      return;
    }
    var ai = ev.target.closest && ev.target.closest('[data-copy-ai]');
    if (ai) {
      copyAi(ai);
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
