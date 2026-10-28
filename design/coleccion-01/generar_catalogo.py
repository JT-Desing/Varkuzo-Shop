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
    c.setFont("ArialBold", 7); c.setFillColor(RED); c.drawString(x, y, label.upper())
    return draw_wrapped(c, value, x, y - 17, width, 9.5, 14) - 12

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
    c.setFont("ArialBold", 23); c.setFillColor(INK); c.drawString(38, PAGE_H - 84, f"{n:02d} / {name.upper()}")
    c.setFont("Arial", 8); c.setFillColor(RED); c.drawString(38, PAGE_H - 103, "PROPUESTA DE LOOK · VISTA CONCEPTUAL")
    img = Image.open(ROOT / "looks" / f"VKZ-{n:02d}.jpg")
    iw, ih = img.size
    target_h = 565; target_w = target_h * iw / ih
    c.drawImage(str(ROOT / "looks" / f"VKZ-{n:02d}.jpg"), 35, PAGE_H - 685, width=target_w, height=target_h)
    x = 335; y = PAGE_H - 142; width = PAGE_W - x - 37
    y = section(c, "Superior", top, x, y, width)
    y = section(c, "Inferior", bottom, x, y, width)
    y = section(c, "Paleta", palette, x, y, width)
    y = section(c, "Gráfica / técnica", art + ". Explorar serigrafía, bordado o aplique según muestra.", x, y, width)
    y = section(c, "Construcción", detail + ". Preparar prototipo frente y espalda.", x, y, width)
    y = section(c, "Tela superior", material_top(top), x, y, width)
    y = section(c, "Tela inferior", material_bottom(bottom), x, y, width)
    y = section(c, "Silueta y confección", spec_top(top) + " " + spec_bottom(bottom), x, y, width)
    y = section(c, "Muestra a pedir", "Talla base M, tabla de medidas, ficha de consumo, prueba de lavado y costo por 30/60/120 unidades.", x, y, width)
    c.setFillColor(colors.HexColor("#eee8df")); c.roundRect(x, 55, width, 82, 6, stroke=0, fill=1)
    draw_wrapped(c, "Concepto visual para selección. La ilustración puede diferir de una prenda confeccionada; proporciones, estampas y color se fijan con la primera muestra física.", x+12, 111, width-24, 8.4, 12, color=MUTED)
    c.showPage()

def draw_cover(c, logo):
    c.setFillColor(PAPER); c.rect(0,0,PAGE_W,PAGE_H,fill=1,stroke=0)
    c.setFillColor(INK); c.rect(0,PAGE_H-300,PAGE_W,300,fill=1,stroke=0)
    c.drawImage(str(ROOT / "logo-blanco.png"), 45, PAGE_H-160, width=315, height=158, preserveAspectRatio=True, mask='auto')
    c.setFont("ArialBold", 31); c.setFillColor(INK); c.drawString(42, PAGE_H-365, "30 LOOKS / EDICIÓN 01")
    c.setFont("Arial", 13); c.setFillColor(RED); c.drawString(42, PAGE_H-390, "DE MEDELLÍN PA’ CUALQUIER LADO")
    y=PAGE_H-440
    for text in ["Buzos, camisetas y pantalones de silueta amplia.", "Gráficas originales con trazos de brocha, costuras y color.", "Documento de selección y cotización para proveedores."]:
        y=draw_wrapped(c,text,42,y,PAGE_W-84,12,20)-7
    c.setFillColor(MUTED);c.setFont("Arial",9);c.drawString(42,70,"Conceptos visuales · No son fotos de producto fabricado · Octubre 2026")
    c.showPage()

def draw_label_pages(c, logo, monogram):
    c.setFillColor(PAPER); c.rect(0,0,PAGE_W,PAGE_H,fill=1,stroke=0); header(c)
    c.setFont("ArialBold",24);c.setFillColor(INK);c.drawString(38,PAGE_H-88,"SISTEMA DE MARQUILLAS")
    c.setFont("Arial",10);c.setFillColor(MUTED);c.drawString(38,PAGE_H-110,"Dos aplicaciones de la identidad aprobada; producción sujeta a prueba real.")
    c.setFillColor(colors.white);c.roundRect(55,412,485,247,8,stroke=0,fill=1)
    c.setStrokeColor(INK);c.rect(104,510,386,90,stroke=1,fill=0)
    c.drawImage(str(logo),135,522,width=230,height=64,preserveAspectRatio=True,mask='auto')
    c.setFont("ArialBold",11);c.setFillColor(INK);c.drawString(105,477,"MARQUILLA INTERIOR DE CUELLO")
    draw_wrapped(c,"Opción inicial: etiqueta satinada estampada de 70 × 25 mm. Logo de pincel a 48 mm de ancho, negro sobre crudo. Costura en cuello posterior. Talla en pestaña separada de 12 × 20 mm. Probar legibilidad a tamaño real.",105,456,386,9,14)
    c.setFillColor(colors.HexColor("#efeae3"));c.roundRect(55,140,485,245,8,stroke=0,fill=1)
    c.setFillColor(INK);c.roundRect(174,178,246,175,4,stroke=0,fill=1)
    c.setFillColor(colors.white);c.circle(297,340,6,fill=1,stroke=0)
    c.drawImage(str(ROOT / "logo-blanco.png"),218,301,width=158,height=42,preserveAspectRatio=True,mask='auto')
    c.setFont("Arial",8);c.drawCentredString(297,283,"DE MEDELLÍN PA’ CUALQUIER LADO")
    c.setStrokeColor(colors.HexColor("#a8a29b"));c.line(200,268,394,268)
    c.setFont("Arial",8);c.drawString(200,246,"REF: ________   TALLA: _____")
    c.drawString(200,230,"COLOR: __________________")
    c.drawString(200,214,"PRECIO COP: ______________")
    c.setFont("Arial",7);c.drawCentredString(297,190,"QR / CÓDIGO SEGÚN SISTEMA FINAL")
    c.setFont("ArialBold",11);c.setFillColor(INK);c.drawString(55,125,"ETIQUETA COLGANTE / HANGTAG")
    draw_wrapped(c,"Cartulina de 350–400 g/m², acabado mate. Formato propuesto 60 × 100 mm, perforación de 4 mm a 7 mm del borde superior, cordón negro. Reverso: campos de SKU, talla, color, precio COP y código de barras/QR real cuando exista inventario.",55,107,485,9,13)
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
    records=[]
    for i,(name,top,bottom,palette,art,detail) in enumerate(LOOKS,1):
        records.append({"id":f"VKZ-{i:02d}","nombre":name,"superior":top,"inferior":bottom,"paleta":palette,"grafica":art,"construccion":detail,"material_superior_objetivo":material_top(top),"material_inferior_objetivo":material_bottom(bottom),"especificacion_superior":spec_top(top),"especificacion_inferior":spec_bottom(bottom),"talla_base":"M; escalar S–XL después de fit sample","medidas_por_definir":"pecho, largo, hombro, manga, cintura, cadera, tiro, muslo, boca y entrepierna","validaciones":"gramaje real; composición; encogimiento; solidez de color; lavado; resistencia de costura","imagen":f"looks/VKZ-{i:02d}.jpg","estado":"concepto / pendiente de muestra"})
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
