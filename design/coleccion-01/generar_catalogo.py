"""Genera un dossier conceptual para cotización de prototipos Varkuzo.

Las imágenes son simulaciones, no patrones ni fotografías de producto fabricado.
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

from PIL import Image, ImageOps
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[1]
PAGE_W, PAGE_H = A4
INK = colors.HexColor("#171516")
RED = colors.HexColor("#881b23")
MUTED = colors.HexColor("#5f5a57")
PAPER = colors.HexColor("#f8f7f4")
CREAM = colors.HexColor("#eee9df")
BRAND_FONT = "VarkuzoBrocha"

# Aplicaciones puntuales de marca. Las posiciones se ajustan a cada foto conceptual;
# el arte final y su escala se fijan después de aprobar la muestra física.
BRAND_APPLICATIONS = {
    3: ("VARKUZO completo", "pecho centrado, 18 cm", "logo", "hueso", (0.46, 0.27, 0.26)),
    7: ("VKZ", "pecho izquierdo, 8 cm", "monogram", "negro", (0.35, 0.25, 0.13)),
    16: ("VARKUZO completo", "pecho centrado, 19 cm", "logo", "gris tonal", (0.47, 0.28, 0.27)),
    23: ("VKZ", "pecho izquierdo, 7 cm", "monogram", "hueso", (0.35, 0.28, 0.12)),
    28: ("VKZ", "pecho izquierdo, 7 cm", "monogram", "hueso", (0.37, 0.27, 0.12)),
    29: ("VARKUZO completo", "pecho centrado, 18 cm", "logo", "hueso", (0.47, 0.27, 0.25)),
}

# Nombre, superior, inferior, paleta, arte/acabado, rasgo de confección.
LOOKS = [
 ("Trazo de concreto", "buzo cerrado lavado carbón", "jean ancho negro lavado", "carbón / negro / hueso", "brocha hueso al pecho", "costura diagonal visible en pierna"),
 ("Ruido limpio", "camiseta boxy hueso", "jean ancho gris ceniza", "hueso / ceniza / vino", "abstracción vino y negro frontal", "hombro caído; ruedo recto"),
 ("Porte vino", "buzo cerrado vino", "pantalón ancho negro", "vino / negro", "aplique tonal en pecho", "puño y fajón firmes"),
 ("Punto de fuga", "camiseta boxy petróleo", "jean ancho carbón", "petróleo / carbón / hueso", "marca pequeña en pecho", "bordado lineal en ambas piernas"),
 ("Media vuelta", "buzo con cierre negro lavado", "jean ancho negro lavado", "negro / hueso", "gráfica en una manga", "cierre metálico y hombro caído"),
 ("Tierra alta", "buzo cerrado oliva", "pantalón ancho hueso", "oliva / hueso", "aplique curvo frontal", "panel de pecho sobrepuesto"),
 ("Marca baja", "buzo cerrado crema", "jean ancho carbón", "crema / carbón / negro", "brocha pequeña en pecho", "costura contrastante en pierna"),
 ("Órbita trasera", "camiseta boxy carbón", "jean ancho gris humo", "carbón / gris / hueso", "gráfica orbital grande en espalda", "espalda protagonista; frente limpio"),
 ("Lavanda brava", "buzo cerrado lavanda polvo", "cargo ancho negro", "lavanda / vino / negro", "brochas vino en mangas", "bolsillos cargo de perfil bajo"),
 ("Rojo al corte", "camiseta boxy negro", "pantalón ancho vino", "negro / vino", "slash rojo en pecho", "puntada reforzada en bolsillos"),
 ("Margen de piedra", "buzo cerrado piedra", "jean ancho azul gastado", "piedra / azul / negro", "gráfica lateral en manga", "capucha doble y sisa amplia"),
 ("Cuadra geométrica", "camiseta boxy oliva", "pantalón ancho hueso", "oliva / hueso / carbón", "cuadros superpuestos en frente", "pinzas en rodilla"),
 ("Ruta lavada", "buzo con cierre carbón", "jean ancho carbón", "carbón / hueso", "líneas finas en manga y pecho", "cierre doble vía por evaluar"),
 ("Tinta tabaco", "camiseta boxy tabaco", "pantalón carpintero negro", "tabaco / negro / hueso", "marca gestual pequeña", "bolsillo utilitario lateral"),
 ("Corte diagonal", "camiseta boxy marfil", "jean ancho gris pizarra", "marfil / pizarra / vino", "brocha diagonal vino", "cuello rib ancho"),
 ("Relieve oscuro", "buzo cerrado negro", "jean ancho gris carbón", "negro / carbón", "aplique tonal en pecho", "prueba de relieve y lavado"),
 ("Corriente petróleo", "buzo cerrado petróleo", "pantalón ancho negro", "petróleo / negro / hueso", "líneas fluidas en mangas", "impresión que cruza sisa"),
 ("Sello de costado", "camiseta boxy crema", "jean ancho vino", "crema / vino / negro", "gráfica desgastada lateral", "costura de bajo reforzada"),
 ("Espina urbana", "camiseta boxy grafito", "jean ancho negro", "grafito / negro / hueso", "espinas abstractas al frente", "gráfica monocroma de una tinta"),
 ("Vino y ceniza", "buzo cerrado vino lavado", "jean ancho ceniza", "vino / ceniza / hueso", "brocha pequeña en pecho", "lavado vintage controlado"),
 ("Azul de loma", "buzo cerrado azul pizarra", "pantalón ancho crudo", "azul pizarra / crudo / rojo", "bordado rojo disperso", "costura aparente en rodilla"),
 ("Tajo asimétrico", "camiseta boxy hueso", "jean ancho carbón", "hueso / carbón / negro", "caligrafía abstracta al hombro", "impresión que cruza costura"),
 ("Panel de noche", "buzo con cierre negro", "cargo ancho negro", "negro / petróleo", "panel curvo petróleo", "panel cosido con pespunte doble"),
 ("Reverso claro", "camiseta boxy ciruela", "jean ancho gris claro", "ciruela / gris / hueso", "gráfica grande en espalda", "frente casi limpio"),
 ("Sombra gráfica", "buzo cerrado carbón", "jean ancho ceniza", "carbón / ceniza / negro", "símbolo tonal frontal", "textura mate sobre mate"),
 ("Tinta sobre crudo", "camiseta boxy marfil", "pantalón ancho oliva", "marfil / oliva / vino", "pinceladas vino diagonales", "ruedo con puntada doble"),
 ("Línea de la ciudad", "buzo cerrado azul grisáceo", "pantalón ancho negro", "azul gris / negro / hueso", "costura contrastante irregular", "sisa caída y capucha doble"),
 ("Marca mínima", "camiseta boxy vino", "jean ancho carbón", "vino / carbón / hueso", "gesto pequeño al pecho", "lavado y rotos limitados"),
 ("Una manga", "buzo cerrado negro", "cargo ancho pardo", "negro / pardo / hueso", "gráfica hueso en una manga", "bolsillo cargo con tapa"),
 ("Líneas en fuga", "camiseta boxy gris", "jean ancho negro", "gris / negro", "líneas tonales al frente", "bordado de línea sobre denim"),
]

def font_setup():
    font_dir = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("Arial", str(font_dir / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("ArialBold", str(font_dir / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont(BRAND_FONT, str(PROJECT / "public" / "fonts" / "VarkuzoBrocha-Regular.ttf")))

def ink_cutout(path, light=False, tone=None):
    """Transforma una marca negra sobre blanco en tinta transparente para un montaje."""
    src = Image.open(path).convert("L")
    alpha = ImageOps.invert(src).point(lambda p: 255 if p > 75 else int(p * 1.6))
    rgb = tone or ((246, 239, 224) if light else (24, 22, 21))
    out = Image.new("RGBA", src.size, (*rgb, 0)); out.putalpha(alpha)
    return out

def branded_look_path(n):
    if n not in BRAND_APPLICATIONS:
        return ROOT / "looks" / f"VKZ-{n:02d}.jpg"
    return ROOT / "looks-marca" / f"VKZ-{n:02d}.png"

def make_branded_looks(logo, monogram):
    target = ROOT / "looks-marca"; target.mkdir(exist_ok=True)
    for n, (_, _, kind, ink, (cx, cy, relative_width)) in BRAND_APPLICATIONS.items():
        base = Image.open(ROOT / "looks" / f"VKZ-{n:02d}.jpg").convert("RGBA")
        tone = (78, 77, 73) if ink == "gris tonal" else None
        mark = ink_cutout(logo if kind == "logo" else monogram, ink != "negro" and ink != "gris tonal", tone)
        width = round(base.width * relative_width)
        mark.thumbnail((width, base.height // 8), Image.Resampling.LANCZOS)
        x = round(base.width * cx - mark.width / 2)
        y = round(base.height * cy - mark.height / 2)
        base.alpha_composite(mark, (x, y))
        base.save(target / f"VKZ-{n:02d}.png", optimize=True)

def draw_wrapped(c, value, x, y, max_width, size=10, leading=15, font="Arial", color=INK):
    c.setFont(font, size); c.setFillColor(color)
    words = value.split(); line = ""
    for word in words:
        candidate = (line + " " + word).strip()
        if pdfmetrics.stringWidth(candidate, font, size) > max_width and line:
            c.drawString(x, y, line); y -= leading; line = word
        else:
            line = candidate
    if line: c.drawString(x, y, line); y -= leading
    return y

def section(c, label, value, x, y, width):
    c.setFont("ArialBold", 6.8); c.setFillColor(RED); c.drawString(x, y, label.upper())
    return draw_wrapped(c, value, x, y - 13, width, 8.5, 11.5) - 7

def header(c, index=None):
    c.setFillColor(INK); c.rect(0, PAGE_H - 42, PAGE_W, 42, stroke=0, fill=1)
    c.setFont("ArialBold", 10); c.setFillColor(colors.white)
    c.drawString(38, PAGE_H - 27, "VARKUZO / DISEÑO DE COLECCIÓN")
    c.setFont("Arial", 8); c.drawRightString(PAGE_W - 38, PAGE_H - 27, "EDICIÓN 01 · CONCEPTOS")
    c.setStrokeColor(colors.HexColor("#d7d0c8")); c.line(38, 34, PAGE_W - 38, 34)
    c.setFont("Arial", 7); c.setFillColor(MUTED)
    c.drawString(38, 22, "Materiales y medidas: objetivos de desarrollo, sujetos a muestra y cotización.")
    if index: c.drawRightString(PAGE_W - 38, 22, f"VKZ-{index:02d}")

def crop_looks():
    output = ROOT / "looks"; output.mkdir(exist_ok=True)
    for sheet in range(1, 6):
        im = Image.open(ROOT / "laminas" / f"lamina-{sheet:02d}.png").convert("RGB")
        w, h = im.size
        for row in range(2):
            for col in range(3):
                num = (sheet - 1) * 6 + row * 3 + col + 1
                split = round(h * 0.47)
                y0, y1 = (3, split - 3) if row == 0 else (split + 3, h - 3)
                box = (round(col*w/3)+3, y0, round((col+1)*w/3)-3, y1)
                im.crop(box).save(output / f"VKZ-{num:02d}.jpg", quality=90)

def material_top(top):
    if "camiseta" in top:
        return "Jersey 100 % algodón peinado, objetivo 220–260 g/m²; cuello rib 1×1. Confirmar encogimiento y solidez."
    return "Fleece perchado o french terry, objetivo 360–420 g/m²; algodón predominante. Rib 2×2. Confirmar composición real."

def material_bottom(bottom):
    if "jean" in bottom:
        return "Denim rígido 12–13.5 oz, algodón predominante; lavado de muestra y prueba de solidez."
    return "Sarga de algodón 280–340 g/m²; confirmar caída, resistencia y encogimiento en muestra."

def spec_top(top):
    if "camiseta" in top:
        return "Boxy oversized; hombro caído, manga amplia. Jersey peinado 220–260 g/m²; algodón 100 % como objetivo. Cuello rib 1×1, pespunte doble en bajo y manga."
    return "Oversized; hombro caído y cuerpo amplio. Fleece o french terry 360–420 g/m², algodón predominante; composición por definir. Capucha doble si aplica, rib 2×2 y costuras reforzadas."

def spec_bottom(bottom):
    if "jean" in bottom:
        return "Pierna ancha; tiro medio-alto, caída larga. Denim rígido 12–13.5 oz; algodón predominante. Pretina con entretela, cierre metálico, 5 bolsillos y costura de seguridad."
    if "cargo" in bottom or "carpintero" in bottom:
        return "Pierna ancha; tiro medio-alto. Sarga 280–340 g/m²; composición a validar. Bolsillos funcionales, pespunte doble, presillas y refuerzo en entrepierna."
    return "Pierna ancha; tiro medio-alto. Sarga 280–340 g/m²; composición a validar. Pretina estable, bolsillos funcionales y refuerzo en entrepierna."

def draw_look(c, n, look):
    name, top, bottom, palette, art, detail = look
    c.setFillColor(PAPER); c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1); header(c, n)
    c.setFont("ArialBold", 11); c.setFillColor(RED); c.drawString(38, PAGE_H - 83, f"{n:02d} / LOOK")
    title = name.upper(); font_size = 35
    while pdfmetrics.stringWidth(title, BRAND_FONT, font_size) > PAGE_W - 134 and font_size > 23:
        font_size -= 1
    c.setFont(BRAND_FONT, font_size); c.setFillColor(INK); c.drawString(105, PAGE_H - 87, title)
    c.setStrokeColor(RED); c.setLineWidth(2); c.line(38, PAGE_H - 101, PAGE_W - 38, PAGE_H - 101)
    c.setFont("Arial", 7.5); c.setFillColor(MUTED); c.drawString(38, PAGE_H - 118, "DIRECCIÓN DE PRODUCTO / PROTOTIPO POR VALIDAR")
    img_path = branded_look_path(n)
    img = Image.open(img_path)
    iw, ih = img.size
    target_h = 554; target_w = target_h * iw / ih
    c.drawImage(str(img_path), 35, PAGE_H - 690, width=target_w, height=target_h)
    c.setFont("Arial", 7); c.setFillColor(MUTED)
    c.drawCentredString(35 + target_w/2, PAGE_H - 703, "VISTA CONCEPTUAL · FRENTE DE LOOK")
    x = 335; y = PAGE_H - 145; width = PAGE_W - x - 37
    y = section(c, "Superior", top, x, y, width)
    y = section(c, "Inferior", bottom, x, y, width)
    y = section(c, "Paleta", palette, x, y, width)
    y = section(c, "Gráfica / técnica", art + ". Explorar serigrafía, bordado o aplique según muestra.", x, y, width)
    y = section(c, "Construcción", detail + ". Preparar prototipo frente y espalda.", x, y, width)
    if n in BRAND_APPLICATIONS:
        mark, placement, _, ink, _ = BRAND_APPLICATIONS[n]
        y = section(c, "Marca aplicada en simulación", f"{mark}; {placement}; tinta {ink}. Validar escala en muestra.", x, y, width)
    y = section(c, "Tela superior", material_top(top), x, y, width)
    y = section(c, "Tela inferior", material_bottom(bottom), x, y, width)
    y = section(c, "Silueta y confección", spec_top(top) + " " + spec_bottom(bottom), x, y, width)
    y = section(c, "Muestra a pedir", "Talla base M, tabla de medidas, ficha de consumo, prueba de lavado y costo por 30/60/120 unidades.", x, y, width)
    if y < 145:
        raise ValueError(f"La ficha {n:02d} invade la nota inferior: y={y:.1f}")
    c.setFillColor(colors.HexColor("#eee8df")); c.roundRect(x, 55, width, 82, 6, stroke=0, fill=1)
    draw_wrapped(c, "Concepto visual para selección. La ilustración puede diferir de una prenda confeccionada; proporciones, estampas y color se fijan con la primera muestra física.", x+12, 111, width-24, 8.4, 12, color=MUTED)
    c.showPage()

def draw_cover(c, logo):
    c.setFillColor(PAPER); c.rect(0,0,PAGE_W,PAGE_H,fill=1,stroke=0)
    c.setFillColor(INK); c.rect(0,PAGE_H-403,PAGE_W,403,fill=1,stroke=0)
    c.setFillColor(RED); c.rect(0,PAGE_H-407,PAGE_W,4,fill=1,stroke=0)
    c.drawImage(str(ROOT / "logo-blanco.png"), 145, PAGE_H-179, width=305, height=152, preserveAspectRatio=True, mask='auto')
    c.setFillColor(CREAM); c.setFont("ArialBold", 39)
    c.drawCentredString(PAGE_W/2, PAGE_H-238, "30 LOOKS")
    c.setFillColor(colors.HexColor("#cbbfb5")); c.setFont("ArialBold", 12)
    c.drawCentredString(PAGE_W/2, PAGE_H-263, "COLECCIÓN CONCEPTUAL / EDICIÓN 01")
    c.setFillColor(CREAM); c.setFont("Arial", 10)
    c.drawCentredString(PAGE_W/2, PAGE_H-291, "BUZOS · CAMISETAS · PANTALONES")
    c.setFillColor(colors.HexColor("#b25155")); c.rect(190,PAGE_H-322,215,2,fill=1,stroke=0)
    c.setFillColor(CREAM); c.setFont("ArialBold", 10)
    c.drawCentredString(PAGE_W/2, PAGE_H-347, "DE MEDELLÍN PA’ CUALQUIER LADO")
    # Una muestra de siluetas, sin cargar la portada con detalles de ficha.
    for idx, n in enumerate((1, 7, 20)):
        x = 38 + idx * 174
        img = Image.open(branded_look_path(n)); iw, ih = img.size
        box_w, box_h = 161, 250
        scale = min(box_w / iw, box_h / ih)
        draw_w, draw_h = iw*scale, ih*scale
        c.saveState()
        p = c.beginPath(); p.rect(x, 168, box_w, box_h); c.clipPath(p, stroke=0)
        c.drawImage(str(branded_look_path(n)), x+(box_w-draw_w)/2, 168, draw_w, draw_h)
        c.restoreState()
        c.setFillColor(INK); c.setFont("ArialBold", 7)
        c.drawString(x, 155, f"VKZ-{n:02d} / {LOOKS[n-1][0].upper()}")
    c.setFillColor(RED); c.rect(38, 126, PAGE_W-76, 2, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont("ArialBold", 12)
    c.drawCentredString(PAGE_W/2, 104, "DOSSIER PARA SELECCIÓN Y COTIZACIÓN")
    c.setFont("Arial", 8.5); c.setFillColor(MUTED)
    c.drawCentredString(PAGE_W/2, 82, "Conceptos visuales. Materiales, medidas y gráficas sujetos a prototipo.")
    c.drawCentredString(PAGE_W/2, 54, "OCTUBRE 2026  /  MEDELLÍN, COLOMBIA")
    c.showPage()

def draw_label_pages(c, logo, monogram):
    c.setFillColor(PAPER); c.rect(0,0,PAGE_W,PAGE_H,fill=1,stroke=0); header(c)
    c.setFont("ArialBold",24);c.setFillColor(INK);c.drawString(38,PAGE_H-88,"SISTEMA DE MARQUILLAS")
    c.setFont("Arial",10);c.setFillColor(MUTED);c.drawString(38,PAGE_H-110,"Dos rutas para el cuello, lado a lado. Elegir tras muestra y prueba de lavado.")
    card_y, card_h, card_w = 418, 247, 252
    for x in (38, 305):
        c.setFillColor(colors.white); c.roundRect(x,card_y,card_w,card_h,7,fill=1,stroke=0)
    # A: conserva la opción clara inicial, ahora mejor proporcionada.
    c.setFillColor(CREAM);c.rect(56,555,216,72,fill=1,stroke=0)
    c.setStrokeColor(colors.HexColor("#c8c0b7"));c.rect(56,555,216,72,fill=0,stroke=1)
    c.drawImage(str(ROOT / "logo-negro-transparente.png"),86,576,width=154,height=43,preserveAspectRatio=True,mask='auto')
    c.setFillColor(INK);c.setFont("ArialBold",7);c.drawRightString(265,561,"M")
    c.setFont("ArialBold",10);c.drawString(56,533,"A / CRUDO EDITORIAL")
    draw_wrapped(c,"Satinado mate crudo, impresión negra. 70 × 25 mm. La talla va en pestaña lateral para conservar el logo limpio.",56,512,216,8.2,12)
    c.setFillColor(MUTED);c.setFont("Arial",7);c.drawString(56,434,"CUELLO POSTERIOR / COSTURA SUPERIOR")
    # B: nueva opción oscura, con acento vino y marca blanca aprobada.
    c.setFillColor(INK);c.rect(323,555,216,72,fill=1,stroke=0)
    c.setFillColor(RED);c.rect(323,555,216,5,fill=1,stroke=0)
    c.drawImage(str(ROOT / "logo-blanco.png"),350,577,width=162,height=42,preserveAspectRatio=True,mask='auto')
    c.setFillColor(CREAM);c.setFont("ArialBold",7);c.drawRightString(532,563,"M")
    c.setFillColor(INK);c.setFont("ArialBold",10);c.drawString(323,533,"B / NOCHE VARKUZO")
    draw_wrapped(c,"Satinado negro de alta densidad, marca blanca y filete vino. 70 × 25 mm. Pestaña de talla negra separada.",323,512,216,8.2,12)
    c.setFillColor(MUTED);c.setFont("Arial",7);c.drawString(323,434,"PRUEBA DE ROCE, SOLIDEZ Y LAVADO")
    # Hangtag: la misma arquitectura de marca, con campos comerciales editables.
    c.setFillColor(colors.HexColor("#ece5dc"));c.roundRect(38,115,519,279,7,fill=1,stroke=0)
    c.setFillColor(INK);c.roundRect(64,142,190,224,5,fill=1,stroke=0)
    c.setFillColor(CREAM);c.circle(159,352,5,fill=1,stroke=0)
    c.drawImage(str(ROOT / "logo-blanco.png"),82,290,width=154,height=54,preserveAspectRatio=True,mask='auto')
    c.setFillColor(CREAM);c.setFont("Arial",6.4);c.drawCentredString(159,276,"DE MEDELLÍN PA’ CUALQUIER LADO")
    c.setStrokeColor(colors.HexColor("#a59d94"));c.line(82,259,236,259)
    c.setFillColor(CREAM);c.setFont("Arial",7)
    for y, line in ((240,"REF: ___________"),(225,"TALLA: ________"),(210,"COLOR: ________"),(195,"PRECIO COP: _____")):
        c.drawString(82,y,line)
    c.setFont("ArialBold",12);c.setFillColor(INK);c.drawString(279,343,"ETIQUETA COLGANTE")
    c.setFont("Arial",9);c.setFillColor(RED);c.drawString(279,325,"60 × 100 MM / CARTULINA MATE")
    draw_wrapped(c,"Cartulina 350–400 g/m², cordón negro y perforación de 4 mm. Frente con el logo aprobado; reverso para SKU, talla, color, precio y código real de inventario.",279,297,245,9,14)
    draw_wrapped(c,"La etiqueta técnica de composición, origen y cuidado se desarrolla por separado con información verificada de cada prenda.",279,209,245,8.5,13,color=MUTED)
    c.showPage()

def draw_supplier_page(c):
    c.setFillColor(PAPER);c.rect(0,0,PAGE_W,PAGE_H,fill=1,stroke=0);header(c)
    c.setFillColor(INK);c.setFont("ArialBold",25);c.drawString(38,PAGE_H-90,"ANTES DE PRODUCIR")
    items=[
      ("01", "Escoger 4–6 looks para prototipo", "Pedir una muestra por silueta, más una prueba de gráfica en cada técnica."),
      ("02", "Cerrar ficha de medidas", "Definir largos, anchos, caída, gradación S–XL y tolerancias con la prenda física."),
      ("03", "Validar telas y procesos", "Solicitar composición documentada, gramaje real, prueba de encogimiento, lavado y solidez del color."),
      ("04", "Cotizar por separado", "Tela, confección, lavado, estampado, bordado, marquillas, hangtag, empaque y merma."),
      ("05", "Cerrar arte de producción", "Cada gráfica requiere arte vectorial/tamaño exacto y ubicación por talla; estas imágenes son referencias visuales."),
      ("06", "Completar etiquetado obligatorio", "La marquilla de marca no sustituye la etiqueta técnica de composición, origen y cuidado. Validar antes de comercializar."),
    ]
    y=PAGE_H-137
    for number,title,body in items:
        c.setFillColor(RED);c.setFont("ArialBold",20);c.drawString(42,y,number)
        c.setFillColor(INK);c.setFont("ArialBold",12);c.drawString(92,y+2,title)
        y=draw_wrapped(c,body,92,y-18,PAGE_W-135,9.5,15)-25
    c.showPage()

def main():
    font_setup();crop_looks()
    logo=ROOT.parents[2]/"varkuzo-logo-raya-corta.png"
    mono=PROJECT/"public"/"images"/"vkz-monogram-approved.png"
    source=Image.open(logo).convert("L")
    alpha=ImageOps.invert(source)
    white=Image.new("RGBA",source.size,(255,255,255,0));white.putalpha(alpha)
    white.save(ROOT/"logo-blanco.png")
    black=Image.new("RGBA",source.size,(23,21,22,0));black.putalpha(alpha)
    black.save(ROOT/"logo-negro-transparente.png")
    make_branded_looks(logo, mono)
    records=[]
    for i,(name,top,bottom,palette,art,detail) in enumerate(LOOKS,1):
        application = BRAND_APPLICATIONS.get(i)
        records.append({"id":f"VKZ-{i:02d}","nombre":name,"superior":top,"inferior":bottom,"paleta":palette,"grafica":art,"construccion":detail,"aplicacion_marca":f"{application[0]}; {application[1]}; tinta {application[3]}" if application else "sin marca exterior protagonista","material_superior_objetivo":material_top(top),"material_inferior_objetivo":material_bottom(bottom),"especificacion_superior":spec_top(top),"especificacion_inferior":spec_bottom(bottom),"talla_base":"M; escalar S–XL después de fit sample","medidas_por_definir":"pecho, largo, hombro, manga, cintura, cadera, tiro, muslo, boca y entrepierna","validaciones":"gramaje real; composición; encogimiento; solidez de color; lavado; resistencia de costura","imagen":str(branded_look_path(i).relative_to(ROOT)).replace('\\','/'),"estado":"concepto / pendiente de muestra"})
    (ROOT/"fichas.json").write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding="utf-8")
    with (ROOT/"fichas.csv").open("w",encoding="utf-8-sig",newline="") as f:
        w=csv.DictWriter(f,fieldnames=records[0].keys());w.writeheader();w.writerows(records)
    pdf=canvas.Canvas(str(ROOT/"Varkuzo_30_looks_y_marquillas.pdf"),pagesize=A4,pageCompression=1)
    pdf.setTitle("Varkuzo — 30 looks y sistema de marquillas")
    draw_cover(pdf,logo)
    for i,look in enumerate(LOOKS,1): draw_look(pdf,i,look)
    draw_label_pages(pdf,logo,mono);draw_supplier_page(pdf);pdf.save()
    print(f"Generados {len(records)} looks; PDF: {ROOT/'Varkuzo_30_looks_y_marquillas.pdf'}")

if __name__ == "__main__": main()
