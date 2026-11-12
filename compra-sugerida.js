/* =====================================================================
   FUOCO · Compra sugerida (ficha de producto + carrito)
   Va en Etiquetas HTML (HEAD), dentro de una etiqueta script.
   Ojo: no usar el signo menor en el código (Empretienda lo rechaza); usar \x3c.
   ---------------------------------------------------------------------
   LO ÚNICO QUE HACE FALTA TOCAR ESTÁ EN "AJUSTES".
   ===================================================================== */
(function () {
  if (window.__fuocoSugeridas) return;
  window.__fuocoSugeridas = true;

  /* ============================ AJUSTES ============================ */
  var AJUSTES = {
    envioGratisDesde: 80000,   // monto para el envío gratis
    cupon: 'MASDE2PRODUCTOS',  // código del cupón de 2 piezas. Vacío = apagado.
    cuponMonto: 3000,          // lo que descuenta el cupón (solo para el texto)
    sugerenciasFicha: 3,       // cuántas piezas mostrar en la ficha
    sugerenciasCarrito: 2      // cuántas mostrar en el carrito
  };

  /* Familias de color de cada piedra. Dos piedras "combinan" si comparten
     al menos una familia. PIEDRA NUEVA = agregar una línea acá
     (sin tildes y en minúscula, como está escrita en el nombre del producto). */
  var FAMILIAS = {
    'ojo de tigre':      ['tierra'],
    'citrino':           ['tierra'],
    'piedra volcanica':  ['tierra', 'noche'],
    'onix negro':        ['noche'],
    'cuarzo cristal':    ['noche', 'agua'],
    'lapislazuli':       ['agua'],
    'piedra de la luna': ['agua', 'suave'],
    'onix cielo':        ['agua'],
    'cuarzo rosa':       ['suave'],
    'amatista':          ['agua', 'suave'],
    'pirita':            ['tierra', 'noche'],
    'obsidiana':         ['noche']
  };

  /* Productos que llevan más de una piedra (la dirección es el final del link). */
  var PIEDRAS_MANUAL = {
    'trio-de-colgantes': ['ojo de tigre', 'citrino', 'onix cielo']
  };

  /* Sugerencias forzadas (opcional). Se muestran primero.
     Formato: 'link-del-producto': ['link-sugerido-1', 'link-sugerido-2'] */
  var FORZADAS = {
  };
  /* ========================== FIN AJUSTES ========================== */

  var TIPOS = ['pulsera', 'colgante', 'collar', 'trio', 'anillo', 'aros', 'tobillera'];

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  }
  function slugDe(url) {
    var p = (url || '').split('?')[0].split('#')[0].replace(/\/+$/, '').split('/');
    return p[p.length - 1];
  }
  function tipoDe(nombre) {
    var n = norm(nombre);
    for (var i = 0; TIPOS.length > i; i++) if (n.indexOf(TIPOS[i]) === 0 || n.indexOf(' ' + TIPOS[i]) >= 0) return TIPOS[i];
    return 'otro';
  }
  function piedrasDe(nombre, slug) {
    if (PIEDRAS_MANUAL[slug]) return PIEDRAS_MANUAL[slug];
    var n = norm(nombre), out = [];
    Object.keys(FAMILIAS).sort(function (a, b) { return b.length - a.length; }).forEach(function (p) {
      if (n.indexOf(p) >= 0 && !out.some(function (o) { return o.indexOf(p) >= 0; })) out.push(p);
    });
    return out;
  }
  function familiasDe(piedras) {
    var f = {};
    piedras.forEach(function (p) { (FAMILIAS[p] || []).forEach(function (x) { f[x] = 1; }); });
    return Object.keys(f);
  }
  function plata(n) {
    return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function esc(s) {
    return String(s).replace(/[&\x3c>"]/g, function (c) { return { '&': '&amp;', '\x3c': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function ajax(opts) {
    opts.headers = { 'X-CSRF-TOKEN': window.csrf_token };
    opts.dataType = 'JSON';
    opts.cache = false;
    return window.jQuery.ajax(opts);
  }

  /* ----------------------------- ESTILOS ----------------------------- */
  var CSS =
    '.fs-box{margin:22px 0 4px;font-family:"DM Sans",system-ui,sans-serif;color:#1a1614}' +
    '.fs-tit{font-family:Syne,system-ui,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.04em;font-size:15px;margin:0 0 4px}' +
    '.fs-sub{font-size:13px;color:#5a504a;margin:0 0 12px}' +
    '.fs-sub b{color:#c2502e}' +
    '.fs-list{display:grid;gap:10px}' +
    '.fs-card{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center;padding:8px;border:1px solid rgba(26,22,20,.14);border-radius:4px;background:rgba(255,255,255,.35)}' +
    '.fs-card img{width:72px;height:72px;object-fit:cover;border-radius:3px;display:block}' +
    '.fs-why{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#c2502e;margin:0 0 2px}' +
    '.fs-name{font-size:14px;font-weight:500;margin:0;line-height:1.25}' +
    '.fs-name a{color:inherit;text-decoration:none}' +
    '.fs-price{font-size:14px;margin:2px 0 6px}' +
    '.fs-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}' +
    '.fs-sel{font:inherit;font-size:13px;padding:5px 6px;border:1px solid rgba(26,22,20,.3);border-radius:3px;background:#efe6d8;color:#1a1614}' +
    '.fs-btn{font:inherit;font-size:13px;font-weight:500;padding:6px 14px;border:0;border-radius:3px;background:#c2502e;color:#efe6d8;cursor:pointer}' +
    '.fs-btn[disabled]{opacity:.6;cursor:default}' +
    '.fs-ok{font-size:12px;color:#2f6b3a}' +
    '.fs-err{font-size:12px;color:#a32}' +
    '.fs-bar{margin:4px 0 14px}' +
    '.fs-bar p{font-size:13px;margin:0 0 6px}' +
    '.fs-bar p b{color:#c2502e}' +
    '.fs-track{height:6px;border-radius:3px;background:rgba(26,22,20,.12);overflow:hidden}' +
    '.fs-fill{height:100%;background:#c2502e;transition:width .4s,background .4s}' +
    '.fs-bar.fs-listo p b{color:#2e8b57}' +
    '.fs-bar.fs-listo .fs-fill{background:#2e8b57}' +
    '.fs-papel{position:fixed;z-index:2147483000;pointer-events:none;border-radius:1px}' +
    '#fs-ficha.fs-ancho{margin:48px 0 0}' +
    '.fs-ancho .fs-list{grid-template-columns:repeat(3,1fr);gap:16px}' +
    '.fs-ancho .fs-card{grid-template-columns:96px 1fr;padding:10px}' +
    '.fs-ancho .fs-card img{width:96px;height:96px}' +
    '.fs-cart{display:block!important;list-style:none;padding:6px 0 4px}' +
    '.fs-cart .fs-box{margin:6px 0}' +
    '.fs-cart .fs-card{grid-template-columns:56px 1fr}' +
    '.fs-cart .fs-card img{width:56px;height:56px}';

  function ponerEstilos() {
    if (document.getElementById('fs-css')) return;
    var s = document.createElement('style');
    s.id = 'fs-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ------------------------- CATÁLOGO EN VIVO ------------------------- */
  var catalogoPromesa = null;
  function catalogo() {
    if (catalogoPromesa) return catalogoPromesa;
    catalogoPromesa = fetch('/productos', { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (h) {
      var d = new DOMParser().parseFromString(h, 'text/html');
      var vistos = {}, lista = [];
      d.querySelectorAll('.products-feed__product-wrapper').forEach(function (w) {
        var a = w.querySelector('a.products-feed__product-link');
        if (!a) return;
        var url = a.getAttribute('href'), slug = slugDe(url);
        if (vistos[slug]) return;
        vistos[slug] = 1;
        var img = w.querySelector('img.products-feed__product-image');
        var nombre = '';
        w.querySelectorAll('*').forEach(function (e) {
          if (!nombre && !e.children.length && !e.closest('.products-feed__product-media') && e.textContent.trim() &&
              !/price|additional/.test(e.className || '')) nombre = e.textContent.trim();
        });
        if (!nombre && img) nombre = (img.getAttribute('alt') || '').replace(/^Producto - /, '').replace(/ - \d+$/, '');
        lista.push({
          url: url, slug: slug, nombre: nombre,
          img: img ? img.getAttribute('src') : '',
          tipo: tipoDe(nombre), piedras: piedrasDe(nombre, slug)
        });
      });
      return lista;
    }).catch(function () { catalogoPromesa = null; return []; });
    return catalogoPromesa;
  }

  /* Datos de compra de un producto (id, variantes con stock, precio). */
  var fichas = {};
  function ficha(p) {
    if (fichas[p.slug]) return fichas[p.slug];
    fichas[p.slug] = fetch(p.url, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (h) {
      var d = new DOMParser().parseFromString(h, 'text/html');
      var idp = d.querySelector('input[name=product]');
      var m = h.match(/var\s+stock\s*=\s*(\[[\s\S]*?\]);\s*\n/);
      var stock = [];
      try { stock = m ? JSON.parse(m[1]) : []; } catch (e) { stock = []; }
      var variantes = stock.filter(function (s) { return s.s_ilimitado || s.s_cantidad > 0; }).map(function (s) {
        var precio = (s.s_oferta && s.s_precio_oferta) ? s.s_precio_oferta : s.s_precio;
        return {
          idStock: s.idStock, precio: precio, antes: (s.s_oferta && s.s_precio_oferta) ? s.s_precio : 0,
          etiqueta: (s.valoratributo || []).map(function (v) { return v.valor.vat_valor; }).join(' / '),
          atributos: (s.valoratributo || []).map(function (v) { return v.valor.vat_valor; })
        };
      });
      return { id: idp ? idp.value : null, variantes: variantes };
    }).catch(function () { return { id: null, variantes: [] }; });
    return fichas[p.slug];
  }

  /* --------------------------- QUÉ SUGERIR --------------------------- */
  function candidatos(base, todos, excluir) {
    var piedrasBase = {}, famBase = {}, tiposBase = {};
    base.forEach(function (b) {
      b.piedras.forEach(function (x) { piedrasBase[x] = 1; });
      familiasDe(b.piedras).forEach(function (x) { famBase[x] = 1; });
      tiposBase[b.tipo] = 1;
    });
    var forzadas = [];
    base.forEach(function (b) { (FORZADAS[b.slug] || []).forEach(function (s) { forzadas.push(s); }); });

    var lista = [];
    todos.forEach(function (p) {
      if (excluir[p.slug]) return;
      var puntos = 0, motivo = '';
      var fi = forzadas.indexOf(p.slug);
      var mismaPiedra = p.piedras.some(function (x) { return piedrasBase[x]; });
      var mismaFamilia = familiasDe(p.piedras).some(function (x) { return famBase[x]; });
      if (fi >= 0) { puntos = 100 - fi; motivo = 'Elegida para vos'; }
      else if (mismaPiedra && !tiposBase[p.tipo]) { puntos = 50; motivo = 'Misma piedra, otro formato'; }
      else if (mismaFamilia && !mismaPiedra) { puntos = 30 + (tiposBase[p.tipo] ? 2 : 0); motivo = 'Combina en color'; }
      /* Relleno: si una piedra tiene pocas combinaciones, se completa con otras piezas. */
      else { puntos = tiposBase[p.tipo] ? 5 : 10; motivo = 'También te puede gustar'; }
      lista.push({ p: p, puntos: puntos, motivo: motivo });
    });
    lista.sort(function (a, b) { return b.puntos - a.puntos; });
    return lista;
  }

  /* Trae fichas y se queda con las que tienen stock. */
  function conStock(lista, cuantas) {
    var elegidos = lista.slice(0, cuantas + 3);
    return Promise.all(elegidos.map(function (c) { return ficha(c.p); })).then(function (fs) {
      var out = [];
      elegidos.forEach(function (c, i) {
        if (cuantas > out.length && fs[i].id && fs[i].variantes.length) { c.f = fs[i]; out.push(c); }
      });
      return out;
    });
  }

  /* ----------------------------- TARJETAS ----------------------------- */
  function tarjeta(c, origen) {
    var v = c.f.variantes, precio = v[0].precio, mismoPrecio = v.every(function (x) { return x.precio === precio; });
    var sel = '';
    if (v.length > 1 || v[0].etiqueta) {
      sel = '\x3cselect class="fs-sel" aria-label="Elegí la medida">' + v.map(function (x) {
        return '\x3coption value="' + x.idStock + '">' + esc(x.etiqueta || 'Única') + '\x3c/option>';
      }).join('') + '\x3c/select>';
    }
    return '\x3cdiv class="fs-card" data-slug="' + esc(c.p.slug) + '" data-origen="' + origen + '">' +
      '\x3ca href="' + esc(c.p.url) + '">\x3cimg src="' + esc(c.p.img) + '" alt="' + esc(c.p.nombre) + '" loading="lazy">\x3c/a>' +
      '\x3cdiv>' +
        '\x3cp class="fs-why">' + esc(c.motivo) + '\x3c/p>' +
        '\x3cp class="fs-name">\x3ca href="' + esc(c.p.url) + '">' + esc(c.p.nombre) + '\x3c/a>\x3c/p>' +
        '\x3cp class="fs-price">' + (mismoPrecio ? '' : 'desde ') + plata(Math.min.apply(null, v.map(function (x) { return x.precio; }))) + '\x3c/p>' +
        '\x3cdiv class="fs-row">' + sel + '\x3cbutton type="button" class="fs-btn">Sumar\x3c/button>\x3cspan class="fs-msg">\x3c/span>\x3c/div>' +
      '\x3c/div>\x3c/div>';
  }

  function activarBotones(cont, mapa) {
    cont.querySelectorAll('.fs-card').forEach(function (card) {
      var c = mapa[card.getAttribute('data-slug')];
      var btn = card.querySelector('.fs-btn'), sel = card.querySelector('.fs-sel'), msg = card.querySelector('.fs-msg');
      btn.addEventListener('click', function () {
        var idStock = sel ? sel.value : c.f.variantes[0].idStock;
        var v = c.f.variantes.filter(function (x) { return String(x.idStock) === String(idStock); })[0];
        var fd = new FormData();
        fd.append('product', c.f.id);
        fd.append('stock', idStock);
        fd.append('quantity', '1');
        (v.atributos || []).forEach(function (a, i) { fd.append('atributos-' + i, a); });
        btn.disabled = true; btn.textContent = 'Sumando…'; msg.className = 'fs-msg'; msg.textContent = '';
        ajax({ url: '/v4/cart/add', method: 'POST', data: fd, contentType: false, processData: false }).done(function (r) {
          var errores = (r.message && r.message.description) || [];
          window.build_cart(r.data, true, errores);
          btn.textContent = 'Sumada ✓';
          if (window.facebook_pixel_tracking && typeof window.fbq === 'function') {
            try { window.fbq('track', 'AddToCart', { content_ids: [String(c.f.id)], content_name: c.p.nombre, content_type: 'product', value: v.precio, currency: 'ARS' }); } catch (e) {}
          }
        }).fail(function () {
          btn.disabled = false; btn.textContent = 'Sumar';
          msg.className = 'fs-msg fs-err'; msg.textContent = 'No se pudo sumar, probá de nuevo.';
        });
      });
    });
  }

  function textoCupon(piezas) {
    if (!AJUSTES.cupon) return '';
    if (piezas >= 2) return '';
    return 'Llevando 2 piezas te descontamos \x3cb>' + plata(AJUSTES.cuponMonto) + '\x3c/b>.';
  }

  /* -------------------------- FICHA DE PRODUCTO -------------------------- */
  function ficharProducto() {
    var form = document.getElementById('add_to_cart-form');
    if (!form || document.getElementById('fs-ficha')) return;
    var slug = slugDe(location.pathname);
    catalogo().then(function (todos) {
      var yo = todos.filter(function (p) { return p.slug === slug; })[0];
      if (!yo) {
        var t = document.querySelector('.product-vip__title');
        var nombre = t ? t.textContent.trim() : (window.p_nombre || '');
        yo = { slug: slug, nombre: nombre, tipo: tipoDe(nombre), piedras: piedrasDe(nombre, slug) };
      }
      var excluir = {}; excluir[slug] = 1;
      return conStock(candidatos([yo], todos, excluir), AJUSTES.sugerenciasFicha);
    }).then(function (lista) {
      if (!lista.length || document.getElementById('fs-ficha')) return;
      var mapa = {}; lista.forEach(function (c) { mapa[c.p.slug] = c; });
      var caja = document.createElement('div');
      caja.id = 'fs-ficha';
      caja.className = 'fs-box';
      var sub = textoCupon(1);
      caja.innerHTML = '\x3cp class="fs-tit">Combiná con\x3c/p>' + (sub ? '\x3cp class="fs-sub">' + sub + '\x3c/p>' : '\x3cp class="fs-sub">Piezas que van bien con esta.\x3c/p>') +
        '\x3cdiv class="fs-list">' + lista.map(function (c) { return tarjeta(c, 'ficha'); }).join('') + '\x3c/div>';
      activarBotones(caja, mapa);
      ubicarFicha(caja, form, 0);
    });
  }

  /* En PC va a lo ancho, debajo de las dos columnas de ventanas; en el celu, debajo del botón. */
  function ubicarFicha(caja, form, n) {
    var pc = window.matchMedia && window.matchMedia('(min-width: 960px)').matches;
    var ancho = document.querySelector('.fuoco-acc-ancho');
    if (pc && !ancho && 10 > n) { setTimeout(function () { ubicarFicha(caja, form, n + 1); }, 200); return; }
    if (pc && ancho) {
      caja.classList.add('fs-ancho');
      ancho.parentNode.insertBefore(caja, ancho.nextSibling);
      return;
    }
    var ancla = form.parentElement && form.parentElement.classList.contains('uk-first-column') ? form.parentElement : form;
    ancla.parentNode.insertBefore(caja, ancla.nextSibling);
  }

  /* ------------------------------ CARRITO ------------------------------ */
  var ultimoCarrito = null, intentosCupon = 0;

  function dibujarCarrito(data) {
    ultimoCarrito = data;
    var ul = document.querySelector('.cart-sidenav__content');
    if (!ul || !data || !data.productos) return;
    var viejo = ul.querySelector('.fs-cart');
    if (viejo) viejo.remove();

    var items = Object.keys(data.productos).map(function (k) { return data.productos[k]; });
    if (!items.length) return;
    var subtotal = 0, piezas = 0, ids = {};
    items.forEach(function (it) { subtotal += it.precio_unitario * it.cantidad; piezas += it.cantidad; ids[String(it.id)] = 1; });

    /* Cupón automático: con 2 piezas o más, si no hay otro cupón puesto. */
    if (AJUSTES.cupon && piezas >= 2 && data.cupon && !data.cupon.id && 2 > intentosCupon) aplicarCupon();

    var li = document.createElement('li');
    li.className = 'cart-sidenav__item fs-cart';
    /* Empretienda mira el total CON el descuento del cupón para el envío gratis. */
    var desc = (data.cupon && data.cupon.id) ? (Number(data.cupon.monto_descuento) || 0)
      : (AJUSTES.cupon && piezas >= 2 ? AJUSTES.cuponMonto : 0);
    var total = subtotal - desc;
    var falta = AJUSTES.envioGratisDesde - total;
    var pct = Math.max(4, Math.min(100, total / AJUSTES.envioGratisDesde * 100));
    var barra = '\x3cdiv class="fs-bar' + (falta > 0 ? '' : ' fs-listo') + '">\x3cp>' + (falta > 0
      ? 'Te faltan \x3cb>' + plata(falta) + '\x3c/b> para el \x3cb>envío gratis\x3c/b>.'
      : '¡Listo! Tu pedido tiene \x3cb>envío gratis\x3c/b>.') +
      '\x3c/p>\x3cdiv class="fs-track">\x3cdiv class="fs-fill" style="width:' + pct + '%">\x3c/div>\x3c/div>\x3c/div>';
    li.innerHTML = barra + '\x3cdiv class="fs-box" id="fs-carrito-sug">\x3c/div>';

    var detalle = [].filter.call(ul.children, function (x) { return /Subtotal/.test(x.textContent); })[0];
    if (detalle) ul.insertBefore(li, detalle.nextSibling); else ul.appendChild(li);

    /* Festejo una sola vez cada vez que se cruza el monto del envío gratis. */
    var yaFesteje = leer('fs-festejo') === '1';
    if (falta > 0) { if (yaFesteje) guardar('fs-festejo', '0'); }
    else if (!yaFesteje) intentarFestejo(0);

    catalogo().then(function (todos) {
      var base = [], excluir = {};
      items.forEach(function (it) {
        var p = todos.filter(function (x) { return norm(x.nombre) === norm(it.nombre); })[0];
        if (p) { base.push(p); excluir[p.slug] = 1; }
        else base.push({ slug: '', nombre: it.nombre, tipo: tipoDe(it.nombre), piedras: piedrasDe(it.nombre, '') });
      });
      return conStock(candidatos(base, todos, excluir), AJUSTES.sugerenciasCarrito + 2);
    }).then(function (lista) {
      var caja = document.getElementById('fs-carrito-sug');
      if (!caja || ultimoCarrito !== data) return;
      lista = lista.filter(function (c) { return !ids[String(c.f.id)]; }).slice(0, AJUSTES.sugerenciasCarrito);
      if (!lista.length) { caja.remove(); return; }
      var mapa = {}; lista.forEach(function (c) { mapa[c.p.slug] = c; });
      var sub = textoCupon(piezas);
      if (!sub && falta > 0) {
        /* Al sumar una pieza puede entrar el cupón, que también baja el total. */
        var descExtra = AJUSTES.cupon ? Math.max(0, AJUSTES.cuponMonto - desc) : 0;
        var alcanza = lista.some(function (c) { return c.f.variantes[0].precio - descExtra >= falta; });
        sub = alcanza ? 'Sumando una de estas, \x3cb>el envío te sale gratis\x3c/b>.' : '';
      }
      caja.innerHTML = '\x3cp class="fs-tit">Sumale una más\x3c/p>' + (sub ? '\x3cp class="fs-sub">' + sub + '\x3c/p>' : '') +
        '\x3cdiv class="fs-list">' + lista.map(function (c) { return tarjeta(c, 'carrito'); }).join('') + '\x3c/div>';
      activarBotones(caja, mapa);
    });
  }

  function leer(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  /* El carrito se vuelve a dibujar y se abre con animación: se espera a que la barra se vea. */
  var timerFestejo = null;
  function intentarFestejo(n) {
    clearTimeout(timerFestejo);
    timerFestejo = setTimeout(function () {
      if (leer('fs-festejo') === '1') return;
      var b = document.querySelector('.fs-cart .fs-bar.fs-listo');
      if (b && festejar(b)) guardar('fs-festejo', '1');
      else if (12 > n) intentarFestejo(n + 1);
    }, 400);
  }

  /* Papelitos de colores que saltan desde la barra (sin sonido). */
  function festejar(barra) {
    if (!barra || !barra.animate) return false;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    var r = barra.getBoundingClientRect();
    if (!r.width || 0 > r.top || r.top > window.innerHeight) return false;
    var colores = ['#c2502e', '#2e8b57', '#f2b134', '#3b7dd8', '#e85d9e', '#8e5bd8', '#ffffff'];
    for (var i = 0; 46 > i; i++) {
      var d = document.createElement('i');
      d.className = 'fs-papel';
      var w = 5 + Math.random() * 5;
      d.style.cssText = 'left:' + (r.left + Math.random() * r.width) + 'px;top:' + r.top + 'px;width:' + w + 'px;height:' + (w * (Math.random() > .5 ? 1.8 : 1)) + 'px;background:' + colores[i % colores.length];
      document.body.appendChild(d);
      var dx = (Math.random() - .5) * 220, alto = 90 + Math.random() * 130, gira = (Math.random() - .5) * 1080;
      var a = d.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: 'translate(' + dx * .6 + 'px,' + (-alto) + 'px) rotate(' + gira / 2 + 'deg)', opacity: 1, offset: .35 },
        { transform: 'translate(' + dx + 'px,' + (alto * .9) + 'px) rotate(' + gira + 'deg)', opacity: 0 }
      ], { duration: 1400 + Math.random() * 700, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' });
      a.onfinish = (function (el) { return function () { el.remove(); }; })(d);
    }
    return true;
  }

  function aplicarCupon() {
    intentosCupon++;
    /* Se espera un momento: Empretienda vuelve a dibujar el carrito y borraría el campo. */
    setTimeout(function () {
      var input = document.getElementById('add_coupon-coupon');
      var btn = document.getElementById('add_coupon-btn');
      if (!input || !btn) return;
      input.value = AJUSTES.cupon;
      btn.click();
    }, 400);
  }

  /* Engancha el armado del carrito de Empretienda. */
  function engancharCarrito() {
    if (typeof window.build_cart !== 'function' || window.build_cart.__fs) return false;
    var original = window.build_cart;
    var envuelta = function (data) {
      var r = original.apply(this, arguments);
      try { dibujarCarrito(data); } catch (e) {}
      return r;
    };
    envuelta.__fs = true;
    window.build_cart = envuelta;
    ajax({ url: '/v4/cart', method: 'GET' }).done(function (r) { try { dibujarCarrito(r.data); } catch (e) {} });
    return true;
  }

  /* ------------------------------ ARRANQUE ------------------------------ */
  function arrancar() {
    if (!window.jQuery) return setTimeout(arrancar, 300);
    ponerEstilos();
    try { ficharProducto(); } catch (e) {}
    var intentos = 0;
    (function esperar() {
      if (engancharCarrito() || ++intentos > 40) return;
      setTimeout(esperar, 250);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
