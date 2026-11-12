/* =====================================================================
   FUOCO · Ajustes generales de la tienda
   1. Las fotos de los bloques "imagen + texto" del inicio (Pulseras,
      Colgantes y collares) llevan al mismo lugar que su botón.
   2. Los links que apuntan al dominio viejo (fuocopietre.empretienda.com.ar)
      se pasan a fuoco.com.ar, así el cliente no cambia de dominio
      y no pierde el carrito.
   ===================================================================== */
(function () {
  var DOMINIO_VIEJO = /^https?:\/\/fuocopietre\.empretienda\.com\.ar/i;

  function arreglarLinks() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (DOMINIO_VIEJO.test(h)) a.setAttribute('href', h.replace(DOMINIO_VIEJO, '') || '/');
    });
  }

  function fotosConLink() {
    document.querySelectorAll('.block-composed-images-text').forEach(function (bloque) {
      var boton = bloque.querySelector('a[href]');
      if (!boton) return;
      bloque.querySelectorAll('img.block-composed-images-text__image').forEach(function (img) {
        if (img.closest('a')) return;
        var link = document.createElement('a');
        link.href = boton.getAttribute('href');
        link.setAttribute('aria-label', (bloque.querySelector('h2') || boton).textContent.trim());
        link.style.display = 'block';
        img.parentNode.insertBefore(link, img);
        link.appendChild(img);
      });
    });
  }

  function correr() {
    arreglarLinks();
    fotosConLink();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', correr);
  else correr();
})();
