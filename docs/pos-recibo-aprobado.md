# Tirilla Varkuzo aprobada

**Estado:** diseño aprobado por el propietario el 28 de octubre de 2026. Esta es la referencia visual y funcional para el módulo de pedidos e impresión del POS.

## Archivos de referencia

- `design/pos-recibo-preview.html`: maqueta editable de la tirilla de 80 mm.
- `design/pos-recibo-preview.png`: captura aprobada para comparación visual.
- `design/print_sample.py`: prueba local ESC/POS directa para Gainscha GA-E200I (VID_0471, PID_0055), sin suponer un puerto USB fijo.
- `design/varkuzo-wordmark-print.png`: versión monocroma del logotipo para la impresora.

## Reglas para la implementación

1. Conservar el logo Varkuzo aprobado, el número de pedido como elemento dominante y el estado del pago inmediatamente visible.
2. Mostrar fecha y hora de Colombia, método de entrega, productos, cantidades, variantes, notas necesarias y total. Evitar datos personales que no se requieran para preparar el pedido.
3. Imprimir en 80 mm con ESC/POS directo; mantener texto operativo legible y ajustar a aproximadamente 42 caracteres por línea. La captura HTML sirve para revisar el diseño, pero la salida física se genera con comandos ESC/POS.
4. Un pedido nuevo produce una sola tirilla automática. Los reintentos de webhook y cambios de estado no generan duplicados. Toda reimpresión debe ser manual y quedar registrada con usuario, fecha y motivo.
5. Guardar los trabajos de impresión pendientes y reintentarlos cuando la impresora vuelva a estar disponible. Mantener por separado estados de pedido, pago, facturación e impresión.
6. La tirilla lleva la leyenda **«NO ES FACTURA ELECTRÓNICA NI DOCUMENTO FISCAL»** mientras no exista integración de facturación habilitada y validada. Nunca generar numeración fiscal, CUFE o QR inventados.
7. Los datos del ejemplo `#1048` son ficticios; en producción el contenido debe venir de un pedido WooCommerce verificado.

## Prueba realizada y pendientes

El 28 de octubre de 2026 se enviaron 4.526 bytes ESC/POS al dispositivo local identificado por VID/PID, incluido el comando de corte. La API de Windows confirmó la escritura completa; aún falta confirmar visualmente la tirilla física y ajustar su densidad o espacios si hace falta.

Todavía no hay acceso a pedidos WooCommerce reales. Quedan pendientes la conexión, las pruebas de deduplicación y reconciliación, el panel de pedidos y la integración fiscal colombiana. El diseño aprobado de la tirilla debe conservarse al construir esas etapas.
