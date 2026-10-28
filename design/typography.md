# Varkuzo Brocha

Fuente de exhibición original de Varkuzo. Las letras V, A, R, K, U, Z y O proceden de los contornos del logo aprobado. Además, la fuente incluye tres ligaduras dibujadas con los contornos aprobados: `VARKUZO`, `HECHO PARA DESTACAR` y `DE AQUÍ PA’ DONDE SEA`. Los dos titulares del banner son texto HTML real, seleccionable e indexable.

## Archivos

- `public/fonts/VarkuzoBrocha-Regular.woff2`: fuente web.
- `public/fonts/VarkuzoBrocha-Regular.ttf`: fuente instalable para diseño.
- `scripts/build_varkuzo_font.py`: fuente editable de los glifos.
- `design/lettering/*.svg`: trazados originales de los dos titulares del banner.
- `scripts/requirements-font.txt`: dependencias para regenerarla.

Para reconstruirla: `python -m pip install -r scripts/requirements-font.txt` y `python scripts/build_varkuzo_font.py` desde la raíz del repositorio.

## Cobertura y uso

Incluye A–Z, a–z con apariencia de mayúsculas, Á É Í Ó Ú Ý Ñ Ü y sus minúsculas, números, signos españoles y puntuación frecuente. Es una fuente **solo para titulares cortos**. El texto corrido mantiene la fuente de lectura de la tienda.

La ligadura `VARKUZO` conserva los trazos del vector original. Los dos titulares del banner conservan su lettering original al escribirse como frases completas. Para otras frases, la fuente usa glifos complementarios; todavía requieren revisión de diseño si se busca el mismo carácter de un lettering hecho a mano. El subrayado rojo es una capa CSS aparte.

La regla `@font-face` está en `app/globals.css`. Para conservar las ligaduras, cada frase debe aparecer como un solo nodo de texto con `font-variant-ligatures: common-ligatures`; dividirla en varios `span` impide formar el trazado completo.
