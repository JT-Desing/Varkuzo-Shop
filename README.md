# Varkuzo Shop

Prototipo funcional de la tienda Varkuzo: frontend Next.js/React y catálogo administrado desde WordPress + WooCommerce. El diseño actual es una dirección visual en revisión; las imágenes y productos marcados como **CONCEPTO** no representan inventario disponible.

## Arranque local

1. Copia `.env.example` como `.env`, asigna tres contraseñas locales diferentes y genera claves aleatorias largas y distintas para `VARKUZO_FAVORITES_KEY` y `VARKUZO_NEWSLETTER_KEY`.
2. Ejecuta `docker compose up --build -d`.
3. Abre la tienda en `http://localhost:3000` y WordPress en `http://localhost:8080/wp-admin`.
4. Si WordPress está vacío, completa su instalación inicial, instala WooCommerce y configura moneda COP y zona de venta antes de cargar productos.
5. Activa los plugins con `docker compose --profile admin run --rm -T wpcli plugin activate varkuzo-favorites varkuzo-newsletter`. Para la cuenta de clientes, habilita el registro en WooCommerce y deja el rol predeterminado como `customer`.

El frontend lee los productos publicados desde la WooCommerce Store API. Cuando aún no hay productos, muestra un catálogo de demostración local. No hay checkout ni cobros reales en esta versión.

El newsletter de prototipo guarda en WordPress el correo, consentimiento y beneficio reservado del 10 %. Aún no envía campañas ni genera cupones canjeables. Antes del lanzamiento faltan el correo de contacto de privacidad, las condiciones del descuento, el canal de baja, el servicio de envío y conectar el disparador preparado `varkuzo:cart-view` a una pantalla de carrito real.

La página `/descuentos` solo muestra productos publicados que WooCommerce marque como rebajados, tengan existencias y cuyo precio actual sea menor que el regular. Se consulta la Store API cada minuto; el porcentaje se calcula con esos precios. Si todavía no hay promociones reales, aparece un estado vacío. Los filtros de categoría, talla y precios actúan sobre esa lista. Para cambiar la foto central del banner desde WordPress, crea una página con slug `descuentos` y asígnale una imagen destacada recortada con transparencia; el frontend la sirve mediante una ruta interna, con la imagen incluida en el proyecto como respaldo.

La ficha incluye guía para medir tallas, información de entregas locales, preguntas frecuentes y favoritos guardados en el navegador. La tabla de medidas queda identificada como pendiente hasta medir físicamente cada talla. Los corazones del catálogo y la ficha alimentan un conteo en WordPress, único por navegador y prenda, sin cifras inventadas. La sección «Lo más agogó» muestra solo piezas con guardados registrados. La lista personal sigue siendo local a cada navegador; todavía no se sincroniza con la cuenta. La ruta `/cuenta` enlaza al panel de cliente WooCommerce para registro, acceso, pedidos y datos. Si WordPress usa otra URL pública, configura `WORDPRESS_PUBLIC_URL` en el frontend.

El sitio también incluye `/nosotros` (dirección de marca, misión y visión) y `/ayuda` (preguntas frecuentes, entregas, retracto, devoluciones, garantía y pagos). Los apartados legales enlazan normas y guías oficiales colombianas. Son información de orientación para la etapa de diseño; antes de vender habrá que publicar identidad del vendedor, canal de reclamaciones y condiciones operativas definitivas.

## Estructura

- `app/`: portada, catálogo y ficha de producto.
- `components/`: navegación, carrusel, tarjetas, filtros, galería y animaciones.
- `lib/products.ts`: adaptación de productos WooCommerce y catálogo de demostración.
- `public/images/`: recursos visuales de la propuesta, separados de los componentes interactivos.
- `compose.yaml`: frontend, WordPress y MariaDB para desarrollo local.

## Diseño actual

La portada tiene dos banners que cambian cada seis segundos y permiten selección manual. El titular de la primera campaña se presenta como arte gráfico; su texto también está en un encabezado HTML accesible. El logo del header conserva el SVG y aplica una distorsión líquida al pasar el cursor, con una versión estática cuando el usuario prefiere reducir movimiento o WebGL no está disponible. La sección «Piezas esenciales» usa una textura de papel suave y cuatro tarjetas independientes.

## Pendiente antes de vender

- Completar catálogo, variantes e inventario real en WooCommerce.
- Implementar carrito, pagos, envíos, impuestos y políticas de venta.
- Diseñar la tipografía original Varkuzo para reemplazar el arte gráfico del titular por texto seleccionable con el mismo trazo.
- Validar identidad de marca y preparar imágenes y fichas definitivas de producto.
- Desarrollar el plugin interno de WordPress para capturar fotos frontal, posterior y de detalle, medidas por talla, estado de revisión y archivo 3D por producto o variante. El archivo no se publicará automáticamente: requiere revisión de fidelidad frente a la prenda física. Después, conectar el visor de la ficha a un modelo aprobado; el control «Explorar 3D» permanece deshabilitado mientras no exista ese flujo.
- Confirmar mediante muestras físicas las tablas de medidas, composición y cuidados de cada referencia, así como cobertura, plazos y tarifas de entrega antes de habilitar compras.
- Completar y revisar los textos comerciales y legales con los datos reales del negocio: identidad del vendedor, dirección y canal de atención, política de cambios comerciales, medios de pago, tratamiento de datos y condiciones de compra. Conservar los derechos legales de retracto y garantía tal como corresponda.

Las credenciales locales y los respaldos SQL se mantienen fuera de Git. El archivo `.env.example` solo contiene valores de ejemplo.

