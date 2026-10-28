# Varkuzo Gestual R03

Fuente de titulares suministrada en `Varkuzo-R03-Aplicacion-Web.zip`. El sitio sirve `public/fonts/VarkuzoGestualR03-Regular.woff2` y la portada la usa como texto HTML seleccionable en ambos banners. La tipografía de lectura del resto de la tienda permanece optimizada para párrafos y controles.

Los contornos y el espaciado editables están en `scripts/glifos-y-espaciado.json`. Para regenerar el archivo web:

```powershell
py -3 -m pip install -r scripts/requirements-varkuzo-r03.txt
py -3 scripts/build_varkuzo_gestual_r03.py --salida public/fonts
```

La fuente R03 tiene un solo peso de diseño (600). El subrayado rojo del banner es un recurso independiente. La selección de texto de toda la web se muestra en rojo mediante `::selection`.
