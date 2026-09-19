# -*- coding: utf-8 -*-
# Semantic mojibake detector: searches JSX/JS for DOUBLE-ENCODED characters.
# Mojibake ('m\u00c3\u00a1ximo') is VALID utf-8, so byte scans miss it.
# We search for the mojibake character PAIRS themselves as 2-char literals.
# Written with write tool -> guaranteed clean UTF-8 + escapes, codepage-proof.
import os, sys

ROOT = r"D:\work\b-mori-frontend\src"
REPORT = r"D:\work\b-mori-frontend\src\mojibake_report.txt"
EXTS = {".jsx", ".js", ".json", ".ts", ".tsx", ".css", ".html"}

# Mojibake pairs: U+00C3 ("\u00c3", i.e. 'Ã') followed by the cp1252 re-encode of a latin-1 char.
# e.g. '\u00c3\u00a9' == "Ã©" twice-encoded form of 'é'.
MOJI_SIGS = [
    "Monto m\u00c3\u00a1ximo",   # mÃ¡ximo (mojibake of 'máximo')
    "m\u00c3\u00a1ximo",
    "l\u00c3\u00admite",          # límite -> lÃmite
    "l\u00c3\u00adnea",           # línea -> lÃnea
    "d\u00c3\u00ads",             # días -> dÃas
    "e\u00c3\u00ad",              # eí -> eÃ?
    "Fecha de vencimiento",       # correct string (control)
    "Monto m\u00c3\u00a1ximo" ,
]

GOOD = [
    "Monto m\u00e1ximo",          # correct 'Monto máximo'
    "l\u00edmite",
    "l\u00ednea",
    "d\u00edas",
    "Fecha de vencimiento",
    "Tambi\u00e9n",
]

flat = []
for dp, dn, fn in os.walk(ROOT):
    for name in fn:
        if os.path.splitext(name)[1].lower() in EXTS:
            flat.append(os.path.join(dp, name))

bad_utf8 = []
moji_files = {}
good_hits = {}
for p in sorted(flat):
    raw = open(p, "rb").read()
    try:
        txt = raw.decode("utf-8")
    except UnicodeDecodeError as e:
        bad_utf8.append((p, str(e)))
        continue
    found = [s for s in MOJI_SIGS if s in txt]
    good = [s for s in GOOD if s in txt]
    if found:
        moji_files[p] = found
    if good:
        good_hits[p] = good

out = []
out.append("archivos: %d" % len(flat))
out.append("no-utf8: %d" % len(bad_utf8))
for p, e in bad_utf8:
    out.append("  BAD: %s :: %s" % (p, e))
out.append("")
out.append("ARCHIVOS CON MOJIBAKE SEMANTICO (doblemente codificado): %d" % len(moji_files))
for p, sigs in moji_files.items():
    out.append("  " + p)
    for s in sigs:
        out.append("      sig: " + s)
out.append("")
out.append("ARCHIVOS CON TEXTO CORRECTO (control): %d" % len(good_hits))
for p, s in good_hits.items():
    out.append("  " + p + " :: " + " | ".join(s))

open(REPORT, "w", encoding="utf-8").write("\n".join(out))
print("escrito: " + REPORT)
