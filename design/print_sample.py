"""Print one Varkuzo preparation-slip sample to the attached ESC/POS USB printer.

This is a visual/hardware prototype, not an electronic invoice or order service.
"""
from pathlib import Path
import ctypes
import winreg
from PIL import Image

VID_PID = "vid_0471&pid_0055"
BASE = Path(__file__).resolve().parent


def printer_path():
    key_path = r"SYSTEM\CurrentControlSet\Control\Print\Monitors\USB Monitor\Ports"
    matches = []
    with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path) as ports:
        for index in range(winreg.QueryInfoKey(ports)[0]):
            with winreg.OpenKey(ports, winreg.EnumKey(ports, index)) as port:
                try:
                    path, _ = winreg.QueryValueEx(port, "Device Path")
                except FileNotFoundError:
                    continue
                if VID_PID in path.lower():
                    matches.append(path)
    if len(matches) != 1:
        raise RuntimeError(f"Se esperaba una impresora {VID_PID}; encontradas: {len(matches)}")
    return matches[0]


def raster(path):
    image = Image.open(path).convert("L")
    image.thumbnail((384, 120))
    image = image.point(lambda value: 255 if value > 145 else 0).convert("1")
    width_bytes = (image.width + 7) // 8
    height = image.height
    data = bytearray()
    for y in range(height):
        for xb in range(width_bytes):
            value = 0
            for bit in range(8):
                x = xb * 8 + bit
                if x < image.width and image.getpixel((x, y)) == 0:
                    value |= 0x80 >> bit
            data.append(value)
    return bytes((29, 118, 48, 0, width_bytes & 255, width_bytes >> 8,
                  height & 255, height >> 8)) + data


def sample_bytes():
    esc = b"\x1b"
    out = bytearray(esc + b"@")
    out += esc + b"a\x01"  # Center logo and heading.
    out += raster(BASE / "varkuzo-wordmark-print.png")
    out += b"\nDE MEDELLIN PA' CUALQUIER LADO\n"
    out += b"==========================================\n"
    out += b"ORDEN DE PREPARACION\n"
    out += b"\x1d!\x11#1048\x1d!\x00\n"
    out += b"PAGO CONFIRMADO\n"
    out += b"------------------------------------------\n"
    out += esc + b"a\x00"  # Left align operational details.
    lines = [
        "28 OCT 2026                 10:42 A. M.",
        "ENTREGA: MEDELLIN / DOMICILIO",
        "------------------------------------------",
        "PRENDAS / 3 UNIDADES",
        "1x BUZO TRAZO",
        "   Negro lavado / talla M",
        "2x CAMISETA VKZ",
        "   Crudo / talla L",
        "------------------------------------------",
        "NOTA PARA PREPARACION",
        "Empacar por separado. Entregar en",
        "porteria.",
        "==========================================",
        "TOTAL                       $ 280.000",
        "------------------------------------------",
        "PRUEBA / NO ES FACTURA ELECTRONICA",
        "NI DOCUMENTO FISCAL",
    ]
    out += ("\n".join(lines) + "\n\n\n").encode("cp437")
    out += b"\x1dVB\x00"  # Feed and cut.
    return bytes(out)


def print_direct(path, payload):
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.CreateFileW.argtypes = [ctypes.c_wchar_p, ctypes.c_uint32, ctypes.c_uint32,
                                   ctypes.c_void_p, ctypes.c_uint32, ctypes.c_uint32,
                                   ctypes.c_void_p]
    kernel.CreateFileW.restype = ctypes.c_void_p
    kernel.WriteFile.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint32,
                                 ctypes.POINTER(ctypes.c_uint32), ctypes.c_void_p]
    kernel.WriteFile.restype = ctypes.c_int
    handle = kernel.CreateFileW(path, 0x40000000, 3, None, 3, 0, None)
    if handle == ctypes.c_void_p(-1).value:
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        buffer = ctypes.create_string_buffer(payload)
        written = ctypes.c_uint32()
        if not kernel.WriteFile(handle, buffer, len(payload), ctypes.byref(written), None):
            raise ctypes.WinError(ctypes.get_last_error())
        if written.value != len(payload):
            raise IOError(f"Envío incompleto: {written.value}/{len(payload)} bytes")
        return written.value
    finally:
        kernel.CloseHandle(ctypes.c_void_p(handle))


if __name__ == "__main__":
    payload = sample_bytes()
    sent = print_direct(printer_path(), payload)
    print(f"Muestra ESC/POS enviada: {sent} bytes")
