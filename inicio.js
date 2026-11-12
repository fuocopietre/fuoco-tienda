/* =====================================================================
   FUOCO · Ajustes generales de la tienda
   1. Las fotos de los bloques "imagen + texto" del inicio (Pulseras,
      Colgantes y collares) llevan al mismo lugar que su botón.
   2. Los links que apuntan al dominio viejo (fuocopietre.empretienda.com.ar)
      se pasan a fuoco.com.ar, así el cliente no cambia de dominio
      y no pierde el carrito.
   3. La barra de arriba alterna los anuncios de ANUNCIOS.
   4. El teléfono del pie abre WhatsApp (antes abría un SMS).
   5. Las tarjetas de producto muestran el descuento por transferencia
      una sola vez (Empretienda lo repetía en dos renglones).
   ===================================================================== */
(function () {
  var DOMINIO_VIEJO = /^https?:\/\/fuocopietre\.empretienda\.com\.ar/i;
  var ANUNCIOS = ['10% OFF pagando con transferencia', 'Envío gratis desde $80.000'];
  var WHATSAPP = '5491166052393';

  document.head.insertAdjacentHTML('beforeend', '\x3cstyle>' +
    '.products-feed__product-additional{display:none!important}' +
    '.header-announcement__text{transition:opacity .35s}' +
    '.header-announcement__text.fu-out{opacity:0}' +
    '\x3c/style>');

  function anuncios() {
    var p = document.querySelector('.header-announcement__text');
    if (!p || !ANUNCIOS.length) return;
    var i = 0;
    p.textContent = ANUNCIOS[0];
    if (2 > ANUNCIOS.length) return;
    setInterval(function () {
      p.classList.add('fu-out');
      setTimeout(function () {
        i = (i + 1) % ANUNCIOS.length;
        p.textContent = ANUNCIOS[i];
        p.classList.remove('fu-out');
      }, 350);
    }, 4000);
  }

  function telefonoWhatsapp() {
    document.querySelectorAll('a[href^="sms:"], a[href^="tel:"]').forEach(function (a) {
      a.setAttribute('href', 'https://wa.me/' + WHATSAPP);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      var i = a.querySelector('i');
      if (i) i.className = i.className.replace(/\bfas fa-phone\b/, 'fab fa-whatsapp');
    });
  }

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
    anuncios();
    telefonoWhatsapp();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', correr);
  else correr();
})();
