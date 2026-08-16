#!/usr/bin/env python3
"""
CROP THE LOGO TO ITS INK — a one-time bake, kept so it is repeatable.

Paul, 2026-08-16: *"actually use the correct logo everywhere."*

WHY THIS EXISTS. `client/public/logo-green-x.png` is 1584x396 and carries
**13.26% transparent padding on the left and 13.32% on the right** (measured
here, not assumed — the scan is below and it runs every time). At a 38px nav
height that is 20px of nothing before the ink starts, which is why the practice
site carries `[data-nav-logo] { margin-left: -20px }` — a correction COUPLED to
both the asset and the render height, and one that had to be found by scanning
the alpha channel after Paul raised the same misalignment twice.

Rather than teach every new consumer that magic number, this bakes a TIGHT
asset. A tight logo drops into any layout with no correction at all, and the
next person to place it cannot get it wrong.

WHAT IT DOES NOT DO: it does not overwrite the originals. `logo-green-x.png`
and `logo-green-x-dark.png` stay exactly as they are, because the practice site
is built around their padding and re-cropping underneath it would shift every
placement on the public site. New assets, new names.

    python3 scripts/studio/crop-logo.py

Pure stdlib — no PIL, no ImageMagick, no sharp. The repo has none of them, and
a logo crop is not worth a dependency.
"""
import zlib
import struct
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUBLIC = os.path.join(ROOT, "client", "public")

# source -> destination. Both are the 4:1 lockup; the dark one is for dark bands.
JOBS = [
    ("logo-green-x.png", "logo-lockup.png"),
    ("logo-green-x-dark.png", "logo-lockup-dark.png"),
]

# Alpha at or below this is transparent for bbox purposes. Not 0: these PNGs
# have anti-aliased edges whose outermost pixels are a whisper above zero, and
# treating those as ink would make the "tight" crop not tight.
ALPHA_FLOOR = 16


def read_png(path):
    d = open(path, "rb").read()
    assert d[:8] == b"\x89PNG\r\n\x1a\n", f"{path}: not a PNG"
    pos, w, h, bd, ct, idat = 8, None, None, None, None, b""
    while pos < len(d):
        (ln,) = struct.unpack(">I", d[pos : pos + 4])
        typ = d[pos + 4 : pos + 8]
        data = d[pos + 8 : pos + 8 + ln]
        if typ == b"IHDR":
            w, h, bd, ct, comp, filt, inter = struct.unpack(">IIBBBBB", data)
            assert bd == 8, f"{path}: expected 8-bit, got {bd}"
            assert ct in (4, 6), f"{path}: expected an alpha channel, colour type {ct}"
            assert inter == 0, f"{path}: interlaced PNGs are not handled"
        elif typ == b"IDAT":
            idat += data
        elif typ == b"IEND":
            break
        pos += 12 + ln
    return w, h, ct, zlib.decompress(idat)


def unfilter(raw, w, h, ch):
    """PNG scanline defiltering. The five filter types, by the book."""
    stride = w * ch
    out = bytearray(stride * h)
    prev = bytearray(stride)
    i = 0
    for y in range(h):
        f = raw[i]
        i += 1
        line = bytearray(raw[i : i + stride])
        i += stride
        for x in range(stride):
            a = line[x - ch] if x >= ch else 0
            b = prev[x]
            c = prev[x - ch] if x >= ch else 0
            if f == 1:
                line[x] = (line[x] + a) & 255
            elif f == 2:
                line[x] = (line[x] + b) & 255
            elif f == 3:
                line[x] = (line[x] + ((a + b) >> 1)) & 255
            elif f == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        out[y * stride : (y + 1) * stride] = line
        prev = line
    return out


def ink_bbox(px, w, h, ch):
    ai = ch - 1
    stride = w * ch
    minx, maxx, miny, maxy = w, -1, h, -1
    for y in range(h):
        base = y * stride
        for x in range(w):
            if px[base + x * ch + ai] > ALPHA_FLOOR:
                if x < minx: minx = x
                if x > maxx: maxx = x
                if y < miny: miny = y
                if y > maxy: maxy = y
    assert maxx >= 0, "the image is entirely transparent"
    return minx, miny, maxx, maxy


def write_png(path, px, w, h, ch):
    """Re-encode as RGBA (colour type 6) with filter 0 on every scanline.
    Filter 0 is larger than an optimal filter choice and it is also the only
    one that cannot introduce a rounding difference — for a 70KB logo that
    trade is free."""
    ct = 6
    if ch == 2:  # grey+alpha in, RGBA out
        rgba = bytearray(w * h * 4)
        for i in range(w * h):
            g, a = px[i * 2], px[i * 2 + 1]
            rgba[i * 4 : i * 4 + 4] = bytes((g, g, g, a))
        px, ch = rgba, 4
    stride = w * ch
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw += px[y * stride : (y + 1) * stride]

    def chunk(typ, data):
        return (
            struct.pack(">I", len(data))
            + typ
            + data
            + struct.pack(">I", zlib.crc32(typ + data) & 0xFFFFFFFF)
        )

    out = b"\x89PNG\r\n\x1a\n"
    out += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, ct, 0, 0, 0))
    out += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    out += chunk(b"IEND", b"")
    open(path, "wb").write(out)


def main():
    for src_name, dst_name in JOBS:
        src = os.path.join(PUBLIC, src_name)
        dst = os.path.join(PUBLIC, dst_name)
        if not os.path.exists(src):
            print(f"  SKIP {src_name} — not on disk")
            continue
        w, h, ct, raw = read_png(src)
        ch = 4 if ct == 6 else 2
        px = unfilter(raw, w, h, ch)
        minx, miny, maxx, maxy = ink_bbox(px, w, h, ch)
        nw, nh = maxx - minx + 1, maxy - miny + 1
        stride = w * ch
        crop = bytearray()
        for y in range(miny, maxy + 1):
            crop += px[y * stride + minx * ch : y * stride + (maxx + 1) * ch]
        write_png(dst, crop, nw, nh, ch)
        pl = minx / w * 100
        pr = (w - 1 - maxx) / w * 100
        print(
            f"  {src_name} {w}x{h} (pad L {pl:.2f}% R {pr:.2f}%)"
            f"  ->  {dst_name} {nw}x{nh}  ratio {nw/nh:.3f}"
        )


if __name__ == "__main__":
    main()
