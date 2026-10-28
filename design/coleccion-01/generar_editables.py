"""Generate editable SVG supplier sheets from fichas.json.

The model photographs remain raster concept references. All labels, copy,
guides and specification fields are editable SVG text and shapes.
"""
from pathlib import Path
from html import escape
import json
import shutil
import textwrap
import zipfile

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "editables-proveedor"
ASSETS = OUT / "imagenes-conceptuales"
SHEETS = OUT / "fichas-svg"
BRAND = OUT / "marca-y-etiquetas"


def t(x, y, value, size=19, fill="#171717", weight="400", spacing=0, anchor="start"):
    return (f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" '
            f'font-weight="{weight}" letter-spacing="{spacing}" text-anchor="{anchor}">{escape(str(value))}</text>')


def lines(x, y, value, width=48, size=18, leading=26):
    wrapped = textwrap.wrap(str(value), width=width, break_long_words=False,
                            break_on_hyphens=False) or ["—"]
    return "\n".join(t(x, y + i * leading, part, size) for i, part in enumerate(wrapped)), len(wrapped)


def field(x, y, label, value, width=54):
    body, count = lines(x, y + 28, value, width)
    return t(x, y, label.upper(), 13, "#9b1721", "700", 2) + "\n" + body, 42 + count * 26


def svg(inner, width=1400, height=1000):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{width}" height="{height}" viewBox="0 0 {width} {height}">\n'
            '<style>text{font-family:Arial,sans-serif}</style>\n'
            f'{inner}\n</svg>\n')


def concept_sheet(item):
    ident = item["id"]
    img = f"../imagenes-conceptuales/{ident}.jpg"
    parts = ['<rect width="1400" height="1000" fill="#f4f1eb"/>',
             '<rect x="36" y="36" width="1328" height="928" fill="#fff"/>',
             '<rect x="62" y="62" width="535" height="820" fill="#fafafa"/>',
             f'<image x="62" y="62" width="535" height="820" '
             f'preserveAspectRatio="xMidYMid meet" xlink:href="{img}"/>',
             t(630, 82, "VARKUZO / COLECCIÓN CONCEPTUAL 01", 16, "#9b1721", "700", 2),
             t(630, 148, ident, 52, "#111", "800"),
             t(630, 194, item["nombre"].upper(), 31, "#111", "700"),
             '<line x1="630" y1="218" x2="1330" y2="218" stroke="#9b1721" stroke-width="4"/>']
    y = 262
    for label, key in [("Superior", "superior"), ("Inferior", "inferior"),
                       ("Paleta", "paleta"), ("Gráfica", "grafica"),
                       ("Construcción", "construccion"),
                       ("Marca", "aplicacion_marca"),
                       ("Talla base", "talla_base")]:
        block, advance = field(630, y, label, item.get(key, "—"), 53)
        parts.append(block)
        y += advance + 11
    parts += [t(62, 925, "IMAGEN CONCEPTUAL · NO ES ARTE DE PRODUCCIÓN", 15, "#777", "700", 1),
              t(630, 925, "EDITA TEXTOS Y UBICACIONES EN SVG", 15, "#777", "700", 1)]
    return svg("\n".join(parts))


def technical_sheet(item):
    ident = item["id"]
    parts = ['<rect width="1400" height="1000" fill="#fff"/>',
             '<rect x="36" y="36" width="1328" height="928" fill="none" stroke="#d7d0c8"/>',
             t(70, 94, f"{ident} / FICHA PARA MUESTRA Y COTIZACIÓN", 26, "#9b1721", "700"),
             t(70, 144, item["nombre"].upper(), 42, "#111", "800"),
             '<line x1="70" y1="166" x2="1325" y2="166" stroke="#111" stroke-width="3"/>']
    y = 212
    for label, key in [("Prenda superior", "especificacion_superior"),
                       ("Tela superior objetivo", "material_superior_objetivo"),
                       ("Prenda inferior", "especificacion_inferior"),
                       ("Tela inferior objetivo", "material_inferior_objetivo"),
                       ("Medidas por definir", "medidas_por_definir"),
                       ("Validaciones", "validaciones")]:
        block, advance = field(70, y, label, item.get(key, "—"), 116)
        parts.append(block)
        y += advance + 16
    parts += [t(70, 917, "OBJETIVOS DE DESARROLLO: CONFIRMAR TELA, MEDIDAS Y TÉCNICA EN MUESTRA FÍSICA.", 16, "#9b1721", "700"),
              t(70, 943, "Solicitar patrón, consumo, prueba de lavado y cotización por volumen antes de producción.", 15, "#555")]
    return svg("\n".join(parts))


def label_templates():
    # Dimensions are prototype artboards; final production measurements follow supplier sampling.
    light = ('<rect width="600" height="320" fill="#f4f1eb"/>'
             '<rect x="28" y="28" width="544" height="264" fill="#f8f5ef" stroke="#161616" stroke-width="2"/>'
             '<image x="93" y="74" width="414" height="125" preserveAspectRatio="xMidYMid meet" '
             'xlink:href="varkuzo-wordmark.svg"/>'
             + t(300, 232, "DE MEDELLÍN PA’ CUALQUIER LADO", 16, "#171717", "700", 1.5, "middle")
             + t(300, 268, "TALLA M · HECHO EN COLOMBIA", 15, "#171717", "700", 1, "middle"))
    dark = ('<rect width="600" height="320" fill="#171717"/>'
            '<rect x="28" y="28" width="544" height="264" fill="#151515" stroke="#f4f1eb" stroke-width="2"/>'
            '<image x="93" y="74" width="414" height="125" preserveAspectRatio="xMidYMid meet" '
            'xlink:href="varkuzo-wordmark.svg"/>'
            + t(300, 232, "DE MEDELLÍN PA’ CUALQUIER LADO", 16, "#f4f1eb", "700", 1.5, "middle")
            + t(300, 268, "TALLA M · HECHO EN COLOMBIA", 15, "#f4f1eb", "700", 1, "middle"))
    # Wordmark SVG is black; the dark variant applies a CSS filter to the image.
    dark = dark.replace('<image ', '<image style="filter:invert(1)" ', 1)
    hang = ('<rect width="600" height="900" fill="#f4f1eb"/>'
            '<rect x="28" y="28" width="544" height="844" fill="#171717"/>'
            '<circle cx="300" cy="72" r="13" fill="none" stroke="#f4f1eb" stroke-width="3"/>'
            '<image x="75" y="150" width="450" height="190" style="filter:invert(1)" '
            'preserveAspectRatio="xMidYMid meet" xlink:href="varkuzo-wordmark.svg"/>'
            + t(300, 414, "DE MEDELLÍN PA’ CUALQUIER LADO", 17, "#f4f1eb", "700", 2, "middle")
            + '<line x1="88" y1="478" x2="512" y2="478" stroke="#9b1721" stroke-width="6"/>'
            + t(88, 556, "REFERENCIA: VKZ-__", 24, "#f4f1eb", "700")
            + t(88, 611, "TALLA: ____", 24, "#f4f1eb", "700")
            + t(88, 666, "PRECIO: $ ______ COP", 24, "#f4f1eb", "700")
            + t(88, 776, "CONCEPTO EDITABLE / DATOS A CONFIRMAR", 15, "#aaa", "700"))
    for name, art, dimensions in [("marquilla-clara.svg", light, (600, 320)),
                                  ("marquilla-oscura.svg", dark, (600, 320)),
                                  ("etiqueta-colgante.svg", hang, (600, 900))]:
        (BRAND / name).write_text(svg(art, *dimensions), encoding="utf-8")


def main():
    data = json.loads((ROOT / "fichas.json").read_text(encoding="utf-8"))
    for directory in (ASSETS, SHEETS, BRAND):
        directory.mkdir(parents=True, exist_ok=True)
    for item in data:
        ident = item["id"]
        shutil.copy2(ROOT / item["imagen"], ASSETS / f"{ident}.jpg")
        (SHEETS / f"{ident}-look.svg").write_text(concept_sheet(item), encoding="utf-8")
        (SHEETS / f"{ident}-tecnica.svg").write_text(technical_sheet(item), encoding="utf-8")
    shutil.copy2(ROOT.parent.parent / "public/images/varkuzo-wordmark.svg", BRAND / "varkuzo-wordmark.svg")
    shutil.copy2(ROOT / "fichas.csv", OUT / "fichas.csv")
    shutil.copy2(ROOT / "fichas.json", OUT / "fichas.json")
    label_templates()
    (OUT / "LEEME.txt").write_text(
        "VARKUZO / Editables para proveedores\n\n"
        "60 fichas SVG: look y ficha técnica para cada una de las 30 propuestas.\n"
        "Abrir y editar en Inkscape, Illustrator o software compatible con SVG.\n"
        "Las fotos JPG son referencias raster y NO permiten editar patrones ni estampados.\n"
        "Los textos, líneas y composiciones de las fichas sí son editables.\n"
        "CSV/JSON contienen los datos estructurados editables.\n"
        "Marquillas y etiqueta son bocetos; confirmar dimensiones y datos legales.\n"
        "Gramajes y composición son objetivos de desarrollo, pendientes de muestra.\n"
        "Conservar la estructura de carpetas para que los SVG encuentren sus imágenes.\n",
        encoding="utf-8")
    archive = ROOT / "Varkuzo_30_looks_editables_proveedores.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as package:
        for file in OUT.rglob("*"):
            if file.is_file():
                package.write(file, file.relative_to(ROOT))
    print(f"{len(data)} looks; paquete: {archive} ({archive.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
