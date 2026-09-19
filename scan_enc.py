# -*- coding: utf-8 -*-
import os
ROOT = r"D:\work\b-mori-frontend\src"
EXT = {".js", ".jsx", ".json", ".ts", ".tsx", ".css", ".html"}
REPORT = r"D:\work\b-mori-frontend\src\enc_scan_report.txt"

bad = []
total = 0
for dp, dn, fns in os.walk(ROOT):
    for fn in fns:
        if os.path.splitext(fn)[1] not in EXT:
            continue
        total += 1
        p = os.path.join(dp, fn)
        raw = open(p, "rb").read()
        try:
            raw.decode("utf-8", "strict")
        except UnicodeDecodeError:
            bad.append(p)

lines = ["scan_total=%d" % total, "bad_utf8=%d" % len(bad), ""]
for p in bad:
    lines.append("BAD " + p)
lines.append("")
lines.append("mojibake sample check (Facturacion.jsx has literal 'Monto máximo'?):")
f = os.path.join(ROOT, "pages", "empresa-pequena", "Facturacion.jsx")
t = open(f, encoding="utf-8").read()
for probe in ["máximo", "Monto máximo", "Fecha de vencimiento", "ã©", "Ã©"]:
    lines.append("  %-24s -> %s" % (probe, probe in t))
open(REPORT, "w", encoding="utf-8").write("\n".join(lines))
print("written", REPORT)
