'use strict';
(() => {
  const button = document.createElement('button');
  button.id = 'orix-layer-access'; button.type = 'button';
  button.textContent = 'Open ORIX controls';
  document.body.appendChild(button);
  button.addEventListener('click', () => { window.__orixKeepOpen = true; setView('home'); sendInteractive(true); });
  const images = new Map();
  window.__orixDrawBrand = (name, context, x, y, size = 20) => {
    const theme = currentView === 'home' ? 'dark' : document.documentElement.dataset.theme;
    const source = window.ORIXIcons.asset(name, theme); if (!source) return false;
    let image = images.get(source);
    if (!image) { image = new Image(); image.src = source; images.set(source, image); }
    if (image.complete && image.naturalWidth) { context.save(); context.drawImage(image, x - size / 2, y - size / 2, size, size); context.restore(); }
    return true;
  };
})();
