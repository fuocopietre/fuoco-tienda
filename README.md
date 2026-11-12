# fuoco-tienda
Scripts para hacer un super tienda

Scripts propios de la tienda fuoco.com.ar (Empretienda).

- `compra-sugerida.js`: fuente comentada de la compra sugerida (ficha de producto + carrito). Los ajustes están arriba de todo.
- `compra-sugerida.min.js`: versión comprimida que carga la tienda vía jsDelivr.
- `ventanas.js`: fuente de las ventanas desplegables de la ficha (estilos + armado). Textos fijos en `TEXTOS`.
- `ventanas.min.js`: versión comprimida que carga la tienda.

En Etiquetas HTML (head) de Empretienda solo quedan las dos líneas `<script src="https://cdn.jsdelivr.net/gh/fuocopietre/fuoco-tienda@main/....min.js" defer>`. Después de cada cambio: minificar, subir a main y purgar la caché en `https://purge.jsdelivr.net/gh/fuocopietre/fuoco-tienda@main/ARCHIVO.min.js`.
