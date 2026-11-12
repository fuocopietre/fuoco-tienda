/* =====================================================================
   FUOCO · Ventanas desplegables de la ficha de producto
   Arma las solapas Descripción / Medidas / Cuidados (solo colgantes) /
   Entregas / Cambios a partir de los títulos h3 de cada descripción.
   Los textos fijos de Cuidados, Entregas y Cambios están en TEXTOS.
   ===================================================================== */
/* Estilos */
document.head.insertAdjacentHTML("beforeend","\x3cstyle>.fuoco-acc{margin:8px 0 0;border-top:1px solid rgba(26,20,16,.18);font-family:'DM Sans',sans-serif}.fuoco-acc details{border-bottom:1px solid rgba(26,20,16,.18)}.fuoco-acc summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:18px 2px;font-family:'Syne',sans-serif;font-weight:700;font-size:17px;letter-spacing:.01em;color:#1A1410}.fuoco-acc summary::-webkit-details-marker{display:none}.fuoco-acc summary::after{content:'';width:9px;height:9px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg) translate(-3px,-3px);transition:transform .25s ease;flex:none;margin-left:12px}.fuoco-acc details[open] summary::after{transform:rotate(-135deg) translate(-3px,-3px)}.fuoco-acc .fuoco-acc__body{padding:0 2px 18px;font-size:15px;line-height:1.6;color:#2B231D}.fuoco-acc .fuoco-acc__body p{margin:0 0 10px}.fuoco-acc .fuoco-acc__body ul{margin:0 0 10px;padding-left:18px}.fuoco-acc .fuoco-acc__body li{margin-bottom:6px}.fuoco-acc .fuoco-acc__body a{color:#B8461B;text-decoration:underline}@media (min-width:960px){.fuoco-acc-ancho{margin:48px 0 0;display:grid;grid-template-columns:1fr 1fr;column-gap:64px;align-items:start}.fuoco-acc-ancho .fuoco-acc{margin:0}}\x3c/style>");

/* Armado */
(function () {
var TEXTOS = {
cuidados:
'\x3cp>Te recomendamos \x3cstrong>sacártelo para bañarte\x3c/strong>: con el tiempo, el agua puede hacer que el capuchón tome un tono cobrizo.\x3c/p>',
entregas:
'\x3cp>Despachamos tu pedido en \x3cstrong>2 a 10 días hábiles\x3c/strong> por Correo Argentino o Andreani, a domicilio o a sucursal, a \x3cstrong>todo el país\x3c/strong>.\x3c/p>\x3cp>\x3cstrong>Envío gratis en compras desde $80.000.\x3c/strong>\x3c/p>\x3cp>Te pasamos el número de seguimiento por mail o WhatsApp. El costo lo calculás con tu código postal, más arriba.\x3c/p>\x3cp>Si estás en CABA, también podés \x3cstrong>retirarlo sin cargo\x3c/strong> en nuestro punto de entrega en Parque Avellaneda.\x3c/p>\x3cp>\x3ca href="/envios">Ver toda la info de envíos\x3c/a>\x3c/p>',
cambios:
'\x3cul>\x3cli>\x3cstrong>Cambios:\x3c/strong> hasta 15 días desde que la recibís, sin uso y en su packaging original. El envío corre por tu cuenta, o traela sin cargo a Parque Avellaneda. Por única vez.\x3c/li>\x3cli>\x3cstrong>¿Te llegó otra pieza o llegó dañada?\x3c/strong> Avisanos dentro de las 48 h y te la reponemos sin costo.\x3c/li>\x3cli>\x3cstrong>Arrepentimiento:\x3c/strong> 10 días con el Botón de arrepentimiento, al pie de la tienda. La devolución la pagamos nosotros.\x3c/li>\x3c/ul>\x3cp>\x3ca href="/cambios-y-devoluciones">Ver la política completa\x3c/a>\x3c/p>'
};
/* Títulos que ya vienen escritos dentro de la descripción */
var T_DESC = /^descripci[oó]n$/i;
var T_MEDIDAS = /^(medidas|talle|largo)/i;
var T_FUERA = /^(cuidados|entregas?|env[ií]os?|cambios)/i;
/* Por si algún producto no tiene títulos */
var INICIO_MEDIDAS = /^(elegí tu largo|elegí el largo|medidas|largo|talle)/i;
var INICIO_ENVIO = /^¿cómo es el envío/i;
var A_MEDIDA = /^¿l[oa] querés a tu medida/i;
var DESCARTAR = /env[ií]os? a todo el pa[ií]s/i;
function seccion(titulo, html, abierta) {
return '\x3cdetails'+(abierta ? ' open' : '')+'>\x3csummary>'+titulo +
'\x3c/summary>\x3cdiv class="fuoco-acc__body">'+html+'\x3c/div>\x3c/details>';
}
function esColgante() {
var t = document.querySelector('.product-vip__title');
return /colgante/i.test(t ? t.textContent : location.pathname.split('/').pop());
}
function armar(cont) {
if (cont.getAttribute('data-fuoco-acc')) return;
cont.setAttribute('data-fuoco-acc', '1');
var desc = [], medidas = [], zona = 'desc', tituloMedidas = 'Medidas';
Array.prototype.slice.call(cont.children).forEach(function (el) {
var t = (el.textContent || '').trim();
if (!t && !el.querySelector('img,iframe')) return;
if (/^H[1-6]$/.test(el.tagName)) {
if (T_DESC.test(t)) { zona = 'desc'; return; }
if (T_MEDIDAS.test(t)) { zona = 'medidas'; tituloMedidas = t; return; }
if (T_FUERA.test(t)) { zona = 'fuera'; return; }
}
if (INICIO_ENVIO.test(t)) { zona = 'fuera'; return; }
if (zona === 'fuera') return;
if (zona === 'desc' && INICIO_MEDIDAS.test(t)) { zona = 'medidas'; tituloMedidas = 'Medidas y talle'; }
if (DESCARTAR.test(t) && 40 > t.length) return;
if (A_MEDIDA.test(t)) { medidas.push(el.outerHTML); return; }
(zona === 'medidas' ? medidas : desc).push(el.outerHTML);
});
var html = '\x3cdiv class="fuoco-acc">' +
seccion('Descripción', desc.join(''), true) +
(medidas.length ? seccion(tituloMedidas, medidas.join(''), false) : '') +
(esColgante() ? seccion('Cuidados', TEXTOS.cuidados, false) : '') +
seccion('Entregas', TEXTOS.entregas, false) +
seccion('Cambios y devoluciones', TEXTOS.cambios, false) +
'\x3c/div>';
cont.innerHTML = html;
cont.style.height = 'auto';
var grilla = document.querySelector('.product-vip__container');
if (cont.classList.contains('uk-visible@m') && grilla) {
var det = cont.querySelectorAll('details');
var ancho = document.createElement('div');
ancho.className = 'fuoco-acc-ancho uk-visible@m';
var izq = document.createElement('div'), der = document.createElement('div');
izq.className = der.className = 'fuoco-acc';
var nIzq = Math.floor(det.length / 2);
Array.prototype.forEach.call(det, function (d, i) { (nIzq > i ? izq : der).appendChild(d); });
ancho.appendChild(izq); ancho.appendChild(der);
grilla.parentNode.insertBefore(ancho, grilla.nextSibling);
cont.style.display = 'none';
}
}
function correr() {
document.querySelectorAll('.product-vip__description').forEach(armar);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', correr);
else correr();
})();
