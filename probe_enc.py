# -*- coding: utf-8 -*-
# Probe: semantic mojibake detection on /pyme/facturas data sources.
# Writes findings to a UTF-8 report file. Pure ASCII source except literals below.
import os

ROOT = r"D:\work\b-mori-frontend\src"
REPORT = os.path.join(ROOT, "enc_sem_report.txt")

TARGETS = [
    os.path.join(ROOT, "pages", "empresa-pequena", "Facturacion.jsx"),
    os.path.join(ROOT, "lib", "invoiceSeeds.js"),
    os.path.join(ROOT, "lib", "localDb.js"),
]

# Correct UTF-8 literals that SHOULD exist if data is clean.
GOOD = [
    "máximo", "Monto máximo", "límite", "Fecha de vencimiento",
    "Corrección", "diseño", "análisis", "aplicación", "También",
    "número", "país", "crédito", "Éxito",
]

# Mojibake signatures (valid UTF-8 but wrong characters).
MOJI = ["Ã©", "Ã¡", "Ã\xad", "Ã³", "Ãº", "Ã±", "Ã\xb1", "â€", "â\x80", "Ã\xbc"]

out = []
out.append("== Scan semantico (mojibake) ==")
for p in TARGETS:
    if not os.path.exists(p):
        out.append("  (no existe) %s" % os.path.relpath(p, ROOT))
        continue
    txt = open(p, "r", encoding="utf-8").read()
    missing = [g for g in GOOD if g not in txt]
    moji_hits = {m: txt.count(m) for m in MOJI if m in txt}
    out.append("")
    out.append("-- %s" % os.path.relpath(p, ROOT))
    out.append("   bytes: %d  chars: %d" % (os.path.getsize(p), len(txt)))
    out.append("   literales correctos FALTANTES: %s" % (missing if missing else "ninguno"))
    out.append("   firma mojibake presente: %s" % (moji_hits if moji_hits else "ninguna"))

# Semantic check on Facturacion.jsx around key labels even if probe file mangled
f = open(os.path.join(ROOT, "pages", "empresa-pequena", "Facturacion.jsx"), "r", encoding="utf-8").read()
out.append("")
out.append("== Vertical: muestra real de lineas con 'Monto' y adyacentes ==")
lines = f.splitlines()
for i, ln in enumerate(lines):
    if "Monto" in ln or "montoMax" in ln or "m\u00e1ximo" in ln or "m\u00e1x" in ln:
        out.append("%5d | %s" % (i + 1, ln))

open(REPORT, "w", encoding="utf-8", newline="\n").write("\n".join(out))
print("wrote report")
