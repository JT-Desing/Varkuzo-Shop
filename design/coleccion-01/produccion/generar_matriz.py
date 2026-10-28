"""Rebuild supplier development tables from the 30 concept fichas."""
from pathlib import Path
import csv
import json

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "fichas.json"


def write_csv(path, rows):
    with path.open("w", encoding="utf-8-sig", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def top_type(value):
    if "camiseta" in value:
        return "CAM-BOX-01"
    if "cierre" in value:
        return "BUZ-ZIP-01"
    return "BUZ-HOOD-01"


def bottom_type(value):
    if "jean" in value:
        return "DEN-WIDE-01"
    if "cargo" in value:
        return "CRG-WIDE-01"
    if "carpintero" in value:
        return "CAR-WIDE-01"
    return "SAR-WIDE-01"


MATERIAL = {
    "CAM-BOX-01": "jersey algodón 100 %, 240 g/m² objetivo, prueba ±10 g/m²; rib cuello algodón/elastano por validar",
    "BUZ-HOOD-01": "french terry algodón 100 %, 380 g/m² objetivo, prueba ±20 g/m²; rib 2x2 algodón/elastano por validar",
    "BUZ-ZIP-01": "french terry algodón 100 %, 380 g/m² objetivo, prueba ±20 g/m²; rib 2x2 algodón/elastano por validar",
    "DEN-WIDE-01": "denim rígido algodón 100 %, 13 oz/yd² objetivo, prueba ±0.5 oz/yd²",
    "CRG-WIDE-01": "sarga algodón 100 %, 320 g/m² objetivo, prueba ±20 g/m²",
    "CAR-WIDE-01": "sarga algodón 100 %, 320 g/m² objetivo, prueba ±20 g/m²",
    "SAR-WIDE-01": "sarga algodón 100 %, 320 g/m² objetivo, prueba ±20 g/m²",
}


def main():
    concepts = json.loads(SOURCE.read_text(encoding="utf-8"))
    matrix = []
    for look in concepts:
        code = look["id"]
        top = top_type(look["superior"])
        bottom = bottom_type(look["inferior"])
        matrix.append({
            "look": code,
            "nombre": look["nombre"],
            "sku_superior_desarrollo": f"{code}-SUP",
            "bloque_superior": top,
            "prenda_superior": look["superior"],
            "tejido_superior_para_prototipo": MATERIAL[top],
            "tejido_superior_objetivo": look["material_superior_objetivo"],
            "sku_inferior_desarrollo": f"{code}-INF",
            "bloque_inferior": bottom,
            "prenda_inferior": look["inferior"],
            "tejido_inferior_para_prototipo": MATERIAL[bottom],
            "tejido_inferior_objetivo": look["material_inferior_objetivo"],
            "paleta_visual_pendiente_muestra": look["paleta"],
            "grafica_a_desarrollar": look["grafica"],
            "construccion_especial": look["construccion"],
            "marca_aplicacion": look["aplicacion_marca"],
            "entregables_del_proveedor": "patron editable; muestra M; tabla real S-XL; ficha de tela; prueba de lavado y tecnica; costo por volumen",
            "estado": "desarrollo de muestra; no aprobado para lote",
        })
    write_csv(HERE / "matriz-30-looks.csv", matrix)

    # Flat measurements in centimetres, proposed only for the first fit sample.
    specs = [
        ("CAM-BOX-01", "pecho ancho a 2.5 cm sisa", 64, 1),
        ("CAM-BOX-01", "largo centro espalda desde cuello", 72, 1),
        ("CAM-BOX-01", "hombro a hombro", 60, 1),
        ("CAM-BOX-01", "largo manga desde hombro", 23, 0.7),
        ("CAM-BOX-01", "boca manga ancho", 22, 0.5),
        ("BUZ-HOOD-01", "pecho ancho a 2.5 cm sisa", 68, 1),
        ("BUZ-HOOD-01", "largo centro espalda desde cuello", 71, 1),
        ("BUZ-HOOD-01", "hombro a hombro", 65, 1),
        ("BUZ-HOOD-01", "largo manga desde hombro", 60, 0.7),
        ("BUZ-HOOD-01", "boca bajo sin estirar", 50, 1),
        ("BUZ-ZIP-01", "pecho ancho a 2.5 cm sisa", 68, 1),
        ("BUZ-ZIP-01", "largo centro espalda desde cuello", 71, 1),
        ("BUZ-ZIP-01", "hombro a hombro", 65, 1),
        ("BUZ-ZIP-01", "largo manga desde hombro", 60, 0.7),
        ("BUZ-ZIP-01", "boca bajo sin estirar", 50, 1),
    ]
    for block in ("DEN-WIDE-01", "CRG-WIDE-01", "CAR-WIDE-01", "SAR-WIDE-01"):
        specs += [
            (block, "cintura ancho pretina cerrada", 42, 0.7),
            (block, "cadera ancho 20 cm bajo cintura", 58, 1),
            (block, "tiro delantero incl pretina", 34, 0.7),
            (block, "tiro trasero incl pretina", 44, 0.7),
            (block, "muslo ancho 2.5 cm bajo entrepierna", 37, 0.7),
            (block, "bota ancho", 27, 0.7),
            (block, "entrepierna", 79, 1),
        ]
    write_csv(HERE / "medidas-base.csv", [
        {"bloque": block, "punto_de_medida": pom, "talla_base": "M",
         "objetivo_cm": target, "tolerancia_muestra_cm": tol,
         "estado": "propuesta de fit; confirmar en muestra física"}
        for block, pom, target, tol in specs
    ])

    grade = []
    for block, pom, m, _ in specs:
        if "largo" in pom or "entrepierna" in pom:
            step = 1
        elif "tiro" in pom or "bota" in pom or "manga" in pom:
            step = 0.5
        elif "cintura" in pom:
            step = 2
        else:
            step = 2
        grade.append({"bloque": block, "punto_de_medida": pom,
                      "S_cm": m - step, "M_cm": m, "L_cm": m + step,
                      "XL_cm": m + 2 * step,
                      "estado": "gradación preliminar; patronista debe validar"})
    write_csv(HERE / "gradacion-propuesta.csv", grade)
    print(f"{len(matrix)} looks; {len(specs)} puntos de medida")


if __name__ == "__main__":
    main()
