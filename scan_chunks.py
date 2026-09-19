# -*- coding: utf-8 -*-
import os
DIST = r"D:\work\b-mori-frontend\dist\assets"
REPORT = r"D:\work\b-mori-frontend\src\enc_scan_report.txt"  # overwrite previous

MOJI = ["mÃ¡xi", "máximo", "Vencimiento", "monto mÃ¡ximo", "Monto mÃ¡ximo", "Ã©", "Ã±", "Ã³", "Ã¡", "Ãº"]
rows = []
n = 0
for fn in os.listdir(DIST):
    if not fn.endswith(".js"):
        continue
    try:
        txt = open(os.path.join(DIST, fn), "rb").read().decode("utf-8", "strict")
    except UnicodeDecodeError as e:
        rows.append("INVALID_UTF8 chunk: %s -> %s" % (fn, e))
        continue
    n += 1
    hits = {m: txt.count(m) for m in MOJI}
    interesting = {k: v for k, v in hits.items() if v}
    if interesting:
        rows.append("%s  [%s]" % (fn, ", ".join("%s=%d" % (k, v) for k, v in interesting.items())))
rows.insert(0, "chunks decodificados OK: %d" % n)
open(REPORT, "w", encoding="utf-8").write("\n".join(rows))
print("wrote", REPORT)
