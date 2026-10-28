"""Build Varkuzo Brocha, a custom all-caps display font for brand headlines.

Requires fonttools, shapely and brotli. Run from the repository root.
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from shapely.affinity import skew, translate
from shapely.geometry import LineString, Polygon
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)


def arc(cx, cy, rx, ry, start, end, count=16):
    return [
        (cx + rx * math.cos(math.radians(start + (end - start) * i / count)),
         cy + ry * math.sin(math.radians(start + (end - start) * i / count)))
        for i in range(count + 1)
    ]


# Each capital is drawn as a group of original brush skeletons in a 700-unit cap box.
# Curves intentionally use short, angular segments like a broad dry marker.
GLYPHS = {
    "A": [[(55, 0), (270, 700)], [(265, 700), (535, 0)], [(120, 235), (445, 235)]],
    "B": [[(65, 0), (100, 700)], [(100, 700), (380, 670), (505, 560), (430, 405), (90, 355)], [(90, 355), (435, 360), (535, 180), (455, 25), (65, 0)]],
    "C": [arc(330, 350, 265, 345, 55, 305, 18)],
    "D": [[(70, 0), (90, 700)], [(90, 700), (360, 660), (510, 540), (545, 320), (450, 90), (300, 10), (70, 0)]],
    "E": [[(75, 0), (85, 690)], [(70, 685), (515, 700)], [(85, 355), (445, 370)], [(70, 0), (535, 15)]],
    "F": [[(75, 0), (85, 690)], [(70, 685), (515, 700)], [(85, 355), (445, 370)]],
    "G": [arc(330, 350, 265, 345, 55, 305, 18), [(565, 330), (365, 325)], [(565, 330), (545, 65)]],
    "H": [[(75, 0), (100, 700)], [(540, 0), (535, 700)], [(90, 350), (535, 355)]],
    "I": [[(80, 695), (495, 700)], [(275, 700), (280, 0)], [(60, 5), (525, 0)]],
    "J": [[(80, 695), (545, 700)], [(440, 700), (420, 115), (310, 0), (165, 15), (55, 125)]],
    "K": [[(75, 0), (90, 700)], [(540, 700), (80, 305)], [(280, 430), (555, 0)]],
    "L": [[(75, 700), (65, 0)], [(65, 0), (525, 20)]],
    "M": [[(55, 0), (65, 700)], [(65, 700), (305, 230), (565, 700)], [(565, 700), (575, 0)]],
    "N": [[(60, 0), (65, 700)], [(65, 700), (560, 0)], [(560, 0), (560, 700)]],
    "O": [arc(300, 350, 245, 350, 0, 360, 28)],
    "P": [[(75, 0), (80, 700)], [(80, 700), (390, 675), (515, 570), (455, 410), (80, 360)]],
    "Q": [arc(300, 350, 245, 350, 0, 360, 28), [(350, 130), (585, -60)]],
    "R": [[(75, 0), (80, 700)], [(80, 700), (390, 675), (515, 570), (455, 410), (80, 355)], [(265, 375), (550, 0)]],
    "S": [[(520, 620), (390, 700), (190, 660), (65, 520), (140, 405), (445, 330), (540, 210), (455, 55), (250, -5), (45, 75)]],
    "T": [[(35, 700), (560, 690)], [(290, 700), (285, 0)]],
    "U": [[(75, 700), (65, 190), (180, 10), (400, 10), (535, 175), (545, 700)]],
    "V": [[(55, 700), (220, 0), (540, 700)]],
    "W": [[(30, 700), (150, 0), (295, 415), (415, 0), (585, 700)]],
    "X": [[(55, 700), (540, 0)], [(520, 700), (60, 0)]],
    "Y": [[(40, 700), (285, 340), (540, 700)], [(285, 340), (280, 0)]],
    "Z": [[(50, 700), (545, 695), (65, 0), (570, 10)]],
}

# Figures and punctuation keep the same broad marker construction. The face is
# intentionally an all-caps display face; lowercase code points use caps forms.
FIGURES = {
    "0": [arc(300, 350, 245, 350, 0, 360, 28), [(155, 90), (445, 610)]],
    "1": [[(95, 540), (290, 700), (300, 0)], [(120, 0), (485, 0)]],
    "2": [[(75, 550), (185, 690), (390, 675), (515, 540), (455, 385), (70, 0), (550, 0)]],
    "3": [[(80, 645), (415, 695), (520, 545), (365, 355), (155, 345)], [(365, 355), (525, 195), (435, 20), (80, 55)]],
    "4": [[(405, 0), (405, 700)], [(405, 700), (50, 220), (565, 220)]],
    "5": [[(530, 700), (120, 700), (80, 365), (400, 385), (535, 230), (430, 15), (70, 45)]],
    "6": [[(470, 655), (300, 700), (100, 525), (85, 195), (245, 0), (450, 50), (515, 230), (420, 375), (100, 335)]],
    "7": [[(50, 695), (550, 700), (200, 0)]],
    "8": [arc(300, 530, 190, 170, 0, 360, 20), arc(300, 175, 225, 190, 0, 360, 20)],
    "9": [[(505, 350), (180, 330), (65, 470), (140, 660), (350, 700), (515, 510), (490, 170), (320, 0), (110, 45)]],
}
PUNCTUATION = {
    "period": (".", [[(210, 25), (225, 50)]], 310),
    "comma": (",", [[(215, 45), (185, -95)]], 310),
    "colon": (":", [[(210, 495), (220, 515)], [(210, 25), (220, 45)]], 320),
    "semicolon": (";", [[(210, 495), (220, 515)], [(215, 45), (185, -95)]], 320),
    "exclam": ("!", [[(230, 700), (210, 215)], [(205, 25), (215, 45)]], 360),
    "question": ("?", [[(80, 520), (160, 690), (385, 680), (500, 530), (370, 370), (270, 250)], [(260, 25), (275, 45)]], 590),
    "hyphen": ("-", [[(85, 300), (440, 315)]], 520),
    "slash": ("/", [[(70, -80), (510, 760)]], 560),
    "apostrophe": ("'", [[(215, 730), (170, 545)]], 300),
    "quote": ('"', [[(130, 735), (115, 550)], [(350, 735), (335, 550)]], 480),
    "ampersand": ("&", [[(490, 65), (300, 0), (95, 165), (385, 395), (435, 565), (335, 700), (155, 650), (160, 500), (510, 70)]], 650),
    "percent": ("%", [arc(155, 565, 85, 105, 0, 360, 14), arc(430, 145, 85, 105, 0, 360, 14), [(80, 0), (520, 700)]], 630),
    "plus": ("+", [[(300, 80), (300, 590)], [(80, 340), (520, 340)]], 610),
    "parenleft": ("(", [arc(420, 350, 210, 450, 110, 250, 18)], 460),
    "parenright": (")", [arc(90, 350, 210, 450, -70, 70, 18)], 460),
    "numbersign": ("#", [[(200, 0), (285, 700)], [(390, 0), (475, 700)], [(65, 225), (550, 225)], [(95, 475), (585, 475)]], 670),
    "dollar": ("$", [[(500, 610), (365, 680), (155, 625), (85, 495), (220, 365), (440, 300), (510, 170), (400, 40), (90, 80)], [(295, -75), (305, 770)]], 670),
    "at": ("@", [arc(300, 350, 245, 345, 40, 350, 25), arc(315, 350, 105, 145, 0, 360, 18), [(420, 495), (435, 285), (540, 300)]], 730),
    "underscore": ("_", [[(40, -55), (570, -55)]], 610),
    "asterisk": ("*", [[(290, 460), (290, 700)], [(185, 515), (395, 650)], [(185, 650), (395, 515)]], 590),
}
ACCENTS = {
    "Á": ("A", [[(220, 805), (370, 920)]]), "É": ("E", [[(220, 805), (370, 920)]]),
    "Í": ("I", [[(220, 805), (370, 920)]]), "Ó": ("O", [[(220, 805), (370, 920)]]),
    "Ú": ("U", [[(220, 805), (370, 920)]]), "Ý": ("Y", [[(220, 805), (370, 920)]]),
    "Ñ": ("N", [[(165, 840), (255, 895), (355, 840), (455, 895)]]),
    "Ü": ("U", [[(180, 850), (195, 870)], [(390, 850), (405, 870)]]),
}


def make_brush(strokes, seed):
    rng = random.Random(seed)
    shapes = []
    for stroke_index, coords in enumerate(strokes):
        if len(coords) > 10:
            # Closed and open round letters need one continuous outline. Buffering
            # every short arc segment separately creates a saw-toothed O/C/G.
            shapes.append(LineString(coords).buffer(69, cap_style=2, join_style=1, resolution=6))
            continue
        for i in range(len(coords) - 1):
            p1, p2 = coords[i], coords[i + 1]
            width = 70 + rng.randint(-10, 13)
            segment = LineString([p1, p2]).buffer(width, cap_style=2, join_style=2)
            shapes.append(segment)
            # A jagged bristle at some ends: each glyph remains a fresh drawing.
            if i == 0 or i == len(coords) - 2:
                dx, dy = p2[0] - p1[0], p2[1] - p1[1]
                length = math.hypot(dx, dy) or 1
                ux, uy = dx / length, dy / length
                nx, ny = -uy, ux
                x, y = p1 if i == 0 else p2
                sign = -1 if i == 0 else 1
                tip = rng.randint(12, 35)
                side = rng.choice([-1, 1])
                shapes.append(Polygon([
                    (x + nx * width * side, y + ny * width * side),
                    (x + nx * (width + 10) * side + ux * sign * tip, y + ny * (width + 10) * side + uy * sign * tip),
                    (x + nx * (width - 19) * side, y + ny * (width - 19) * side),
                ]))
    shape = unary_union(shapes).buffer(0)
    # Small cuts act like dry bristles without weakening the main letter shape.
    scratches = []
    for _ in range(5):
        stroke = rng.choice(strokes)
        if len(stroke) < 2:
            continue
        i = rng.randrange(len(stroke) - 1)
        x1, y1 = stroke[i]
        x2, y2 = stroke[i + 1]
        t = rng.uniform(.35, .75)
        cx, cy = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
        dx, dy = x2 - x1, y2 - y1
        length = math.hypot(dx, dy) or 1
        nx, ny = -dy / length, dx / length
        off = rng.choice([-1, 1]) * rng.uniform(32, 48)
        px, py = cx + nx * off, cy + ny * off
        scratch = LineString([(px - dx / length * 15, py - dy / length * 15), (px + dx / length * 30, py + dy / length * 30)]).buffer(rng.uniform(3, 6), cap_style=2)
        scratches.append(scratch)
    if scratches:
        shape = shape.difference(unary_union(scratches)).buffer(0)
    # Lean forward like the selected Varkuzo marker lettering.
    shape = skew(shape, xs=8, origin=(0, 0))
    return translate(shape, xoff=85)


def polygon_to_pen(polygon, pen):
    def contour(points):
        points = list(points)
        if len(points) < 4:
            return
        pen.moveTo((round(points[0][0]), round(points[0][1])))
        for x, y in points[1:-1]:
            pen.lineTo((round(x), round(y)))
        pen.closePath()
    contour(polygon.exterior.coords)
    for hole in polygon.interiors:
        contour(hole.coords)


glyph_order = ['.notdef', 'space'] + list(GLYPHS) + [f'num{digit}' for digit in FIGURES] + list(PUNCTUATION) + [f'uni{ord(char):04X}' for char in ACCENTS] + ['invertedExclam', 'invertedQuestion']
fb = FontBuilder(1000, isTTF=True)
fb.setupGlyphOrder(glyph_order)
cmap = {32: 'space'}
for char in GLYPHS:
    cmap[ord(char)] = char
    cmap[ord(char.lower())] = char
for digit in FIGURES:
    cmap[ord(digit)] = f'num{digit}'
for name, (char, _, _) in PUNCTUATION.items():
    cmap[ord(char)] = name
for char in ACCENTS:
    name = f'uni{ord(char):04X}'
    cmap[ord(char)] = name
    cmap[ord(char.lower())] = name
cmap.update({ord('¡'): 'invertedExclam', ord('¿'): 'invertedQuestion', ord('’'): 'apostrophe', ord('–'): 'hyphen', ord('—'): 'hyphen'})
fb.setupCharacterMap(cmap)
glyphs = {}
metrics = {'.notdef': (650, 0), 'space': (300, 0)}
for name in ['.notdef', 'space']:
    glyphs[name] = TTGlyphPen(None).glyph()
def add_glyph(name, strokes, seed, advance):
    shape = make_brush(strokes, seed)
    pen = TTGlyphPen(None)
    parts = list(shape.geoms) if hasattr(shape, 'geoms') else [shape]
    for part in parts:
        if isinstance(part, Polygon) and not part.is_empty:
            polygon_to_pen(part, pen)
    glyphs[name] = pen.glyph()
    metrics[name] = (advance, 0)


for char, strokes in GLYPHS.items():
    add_glyph(char, strokes, ord(char) * 47, 710 if char not in 'IMW' else (510 if char == 'I' else 800))
for digit, strokes in FIGURES.items():
    add_glyph(f'num{digit}', strokes, ord(digit) * 47, 700)
for name, (_, strokes, advance) in PUNCTUATION.items():
    add_glyph(name, strokes, sum(map(ord, name)) * 47, advance)
for char, (base, accent) in ACCENTS.items():
    add_glyph(f'uni{ord(char):04X}', GLYPHS[base] + accent, ord(char) * 47, metrics[base][0])
add_glyph('invertedExclam', [[(215, 700), (225, 680)], [(230, 495), (210, 10)]], 97, 360)
add_glyph('invertedQuestion', [[(270, 700), (275, 680)], [(280, 500), (140, 350), (80, 190), (190, 20), (420, 0), (510, 170)]], 99, 590)
fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=1030, descent=-180)
fb.setupNameTable({
    'familyName': 'Varkuzo Brocha',
    'styleName': 'Regular',
    'fullName': 'Varkuzo Brocha Regular',
    'psName': 'VarkuzoBrocha-Regular',
    'uniqueFontIdentifier': 'Varkuzo Brocha 1.0',
    'version': 'Version 1.0',
    'copyright': 'Copyright 2026 Varkuzo. Original brand display lettering.',
})
fb.setupOS2(sTypoAscender=1030, sTypoDescender=-180, usWinAscent=1080, usWinDescent=200)
fb.setupPost()
fb.setupMaxp()
ttf = OUT / 'VarkuzoBrocha-Regular.ttf'
fb.save(ttf)
font = TTFont(ttf)
font.flavor = 'woff2'
woff = OUT / 'VarkuzoBrocha-Regular.woff2'
font.save(woff)
print(ttf)
print(woff)
