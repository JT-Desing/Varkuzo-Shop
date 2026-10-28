#!/usr/bin/env python3
"""Compile the supplied, editable Varkuzo outlines on your own computer.

Usage:
    python crear_fuente_local.py
    python crear_fuente_local.py --salida ./Fuente-generada

Dependencies: python -m pip install -r requirements.txt
No installed font is read or copied. Only glifos-y-espaciado.json is used.
"""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path


def compile_font(source: Path, output: Path) -> tuple[Path, Path]:
    try:
        from fontTools.fontBuilder import FontBuilder
        from fontTools.pens.ttGlyphPen import TTGlyphPen
        from fontTools.svgLib.path import parse_path
        from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
        from fontTools.ttLib import TTFont
    except ImportError as exc:
        raise RuntimeError('Instala las dependencias: python -m pip install -r requirements.txt') from exc
    data = json.loads(source.read_text(encoding='utf-8'))
    entries: dict = data['glyphs']
    if not entries or not all(isinstance(c, str) and len(c) == 1 for c in entries):
        raise ValueError('El archivo de contornos no tiene un mapa de caracteres valido.')
    name = lambda c: f'uni{ord(c):04X}'
    ordered = sorted(entries, key=ord)
    fb = FontBuilder(data['unitsPerEm'], isTTF=True)
    fb.setupGlyphOrder(['.notdef'] + [name(c) for c in ordered])
    fb.setupCharacterMap({ord(c): name(c) for c in ordered})
    pen = TTGlyphPen(None)
    # Notdef exterior clockwise and interior counter-clockwise.
    parse_path('M50 0 L50 700 L450 700 L450 0 Z M100 50 L400 50 L400 650 L100 650 Z', pen)
    glyphs = {'.notdef': pen.glyph()}
    metrics = {'.notdef': (500, 50)}
    for c in ordered:
        info = entries[c]
        pen = TTGlyphPen(None)
        if info['path']:
            parse_path(info['path'], pen)
        glyph = pen.glyph()
        glyphs[name(c)] = glyph
        if glyph.numberOfContours > 0:
            glyph.recalcBounds(None)
            left = glyph.xMin
        else:
            left = 0
        metrics[name(c)] = (int(info['advance']), left)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=data['ascender'], descent=data['descender'], lineGap=0)
    fb.setupNameTable({
        'familyName': 'Varkuzo Gestual R03',
        'styleName': 'Regular',
        'uniqueFontIdentifier': 'VarkuzoGestualR03-Regular-0.300',
        'fullName': 'Varkuzo Gestual R03 Regular',
        'psName': 'VarkuzoGestualR03-Regular',
        'version': 'Version 0.300',
        'manufacturer': 'Custom lettering project',
        'description': 'Gestural brush lettering based on the supplied VARKUZO wordmark. R03: pressure, directional strokes, curved structures, Spanish characters and optical spacing.',
    })
    fb.setupOS2(sTypoAscender=data['ascender'], sTypoDescender=data['descender'],
                sTypoLineGap=0, usWinAscent=data['ascender'], usWinDescent=abs(data['descender']),
                sxHeight=data['xHeight'], sCapHeight=data['capHeight'], usWeightClass=600,
                fsSelection=0x40, fsType=0)
    fb.setupPost(italicAngle=-10.7, underlinePosition=-180, underlineThickness=60)
    fb.setupMaxp()
    # Extend optical kerning to precomposed Spanish / Latin accented letters.
    pairs = []
    for a in ordered:
        ba = entries[a].get('base', a)
        for b in ordered:
            bb = entries[b].get('base', b)
            value = data['kerning'].get(ba + bb)
            if value is not None:
                pairs.append(f'pos {name(a)} {name(b)} {int(value)};')
    if pairs:
        feature = 'languagesystem DFLT dflt; languagesystem latn dflt; feature kern {\n' + '\n'.join(pairs) + '\n} kern;'
        addOpenTypeFeaturesFromString(fb.font, feature)
    output.mkdir(parents=True, exist_ok=True)
    ttf = output / 'VarkuzoGestualR03-Regular.ttf'
    woff2 = output / 'VarkuzoGestualR03-Regular.woff2'
    fb.save(ttf)
    check = TTFont(ttf)
    missing = sorted(set(ord(c) for c in entries) - set(check.getBestCmap()))
    if missing:
        raise RuntimeError(f'Caracteres ausentes tras la compilacion: {missing}')
    try:
        check.flavor = 'woff2'
        check.save(woff2)
    except ImportError as exc:
        raise RuntimeError('Se creo el TTF, pero falta Brotli para WOFF2. Ejecuta: python -m pip install brotli') from exc
    check.close()
    # CSS and a genuine editable-text browser specimen, generated locally.
    (output / 'varkuzo.css').write_text('''@font-face {
  font-family: "Varkuzo Gestual R03";
  src: url("./VarkuzoGestualR03-Regular.woff2") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
.varkuzo { font-family: "Varkuzo Gestual R03", sans-serif; font-weight: 600;
  font-kerning: normal; font-feature-settings: "kern" 1; line-height: 1.45; }
''', encoding='utf-8')
    (output / 'Prueba-texto-real.html').write_text('''<!doctype html>
<html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Varkuzo R03 - texto real</title><link rel="stylesheet" href="varkuzo.css">
<style>body{margin:4vw;background:#f5f1e8;color:#161512;font:16px system-ui}h1{font-size:18px;font-weight:500}
textarea{box-sizing:border-box;width:100%;min-height:75vh;border:1px solid #bbb3a6;background:transparent;
color:inherit;padding:32px;resize:vertical;font-size:clamp(32px,6vw,88px)}</style>
<h1>Varkuzo Gestual R03 / texto editable con la fuente compilada localmente</h1>
<textarea class="varkuzo" aria-label="Escribe para probar la tipografia" spellcheck="false">VARKUZO
NUEVA COLECCI\u00d3N
Dise\u00f1o con car\u00e1cter.
\u00a1Hola! \u00bfQu\u00e9 tal?
Ping\u00fcino, ni\u00f1ez y coraz\u00f3n.
0123456789</textarea></html>''', encoding='utf-8')
    return ttf, woff2


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--salida', type=Path, default=Path(__file__).resolve().parent / 'Fuente-generada')
    args = parser.parse_args()
    source = Path(__file__).resolve().parent / 'glifos-y-espaciado.json'
    try:
        outputs = compile_font(source, args.salida)
    except (OSError, ValueError, RuntimeError) as exc:
        print(f'Error: {exc}', file=sys.stderr)
        return 1
    print('Compilacion terminada. Archivos creados localmente:')
    for item in outputs:
        print(item.resolve())
    print('Abre Prueba-texto-real.html dentro de la misma carpeta para escribir con la fuente.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
