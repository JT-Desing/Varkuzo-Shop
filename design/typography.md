# Varkuzo Brocha

Fuente de exhibición original de Varkuzo, construida a partir de trazos inclinados y bordes secos para acompañar el lettering de la marca. Se usa en los titulares de los dos banners de inicio como texto HTML seleccionable, accesible e indexable.

## Archivos

- `public/fonts/VarkuzoBrocha-Regular.woff2`: fuente web.
- `public/fonts/VarkuzoBrocha-Regular.ttf`: fuente instalable para diseño.
- `scripts/build_varkuzo_font.py`: fuente editable de los glifos.
- `scripts/requirements-font.txt`: dependencias para regenerarla.

Para reconstruirla: `python -m pip install -r scripts/requirements-font.txt` y `python scripts/build_varkuzo_font.py` desde la raíz del repositorio.

## Cobertura y uso

Incluye A–Z, a–z con apariencia de mayúsculas, Á É Í Ó Ú Ý Ñ Ü y sus minúsculas, números, signos españoles y puntuación frecuente. Es una fuente **solo para titulares cortos**. El texto corrido mantiene la fuente de lectura de la tienda.

El logotipo `varkuzo-wordmark.svg` sigue siendo una composición manual con uniones y subrayado propios. La fuente reproduce su lenguaje visual para escribir frases nuevas; un texto escrito con ella no sustituye exactamente el dibujo del logotipo.

La regla `@font-face` está en `app/globals.css`. Para un nuevo titular, usar `font-family: 'Varkuzo Brocha', Impact, sans-serif` y revisar saltos de línea, tamaño y contraste en móvil. El subrayado rojo del banner es una capa CSS independiente de la fuente.
