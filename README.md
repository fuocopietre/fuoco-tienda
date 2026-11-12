# fuoco-tienda
Scripts para hacer un super tienda

Scripts propios de la tienda fuoco.com.ar (Empretienda).

- `compra-sugerida.js`: fuente comentada de la compra sugerida (ficha de producto + carrito). Los ajustes están arriba de todo.
- `compra-sugerida.min.js`: versión comprimida que carga la tienda vía jsDelivr.
- `ventanas.js`: fuente de las ventanas desplegables de la ficha (estilos + armado). Textos fijos en `TEXTOS`.
- `ventanas.min.js`: versión comprimida que carga la tienda.
- `inicio.js`: ajustes generales (fotos del inicio con link a su categoría, links del dominio viejo pasados a fuoco.com.ar).
- `inicio.min.js`: versión comprimida que carga la tienda.

En Etiquetas HTML (head) de Empretienda solo quedan las líneas `<script src="https://cdn.jsdelivr.net/gh/fuocopietre/fuoco-tienda@COMMIT/....min.js" defer>`, fijadas a un commit (jsDelivr deja `@main` en caché del navegador por 7 días). Después de cada cambio: minificar, subir a main y cambiar el commit de las líneas en el panel.
