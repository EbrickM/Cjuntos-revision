# -*- coding: utf-8 -*-
import io

f = r"D:\work\b-mori-frontend\src\pages\empresa-pequena\Facturacion.jsx"
txt = io.open(f, "r", encoding="utf-8").read()

out = []
out.append("== Pronósticos / hebras clave en Facturacion.jsx ==")
probes = [
    "Monto máximo del contrato",
    "máximo",
    "Fecha de vencimiento",
    "Análisis crediticio",
    "límite",
    "\u00c9xito",          # éxfito? no: "Éxito" con E mayúscula
    "Correcci\u00f3n",
    "Evaluación",
    "mÃ¡ximo",             # mojibake: si True -> el archivo SÍ tiene bytes dobles
    "lÃnea",               # mojibake lía->lÃnea
    "con Correcci\u00f3n",
    "Tambi\u00e9n",
    "An\u00e1lisis",
]
for p in probes:
    out.append("%-30s -> %s" % (p, p in txt))

# Conteo de caracteres latinos extendidos que si estuvieran presentes y bien
# codificados deberían existir en un archivo en español.
counts = {}
for ch in "\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00d1":
    counts[ch] = txt.count(ch)
out.append("")
out.append("== conteo latin-1 (correcto, una codificación) ==")
for ch, n in counts.items():
    out.append("  '%s' -> %d" % (ch, n))

out.append("")
out.append("== byte-head de 3 muestras de monto tipográfico ==")
for probe in ["Monto m", "l\u00edmite", "Fech"]:
    i = txt.find(probe)
    if i == -1:
        out.append("  %s: NO encontrado" % probe)
        continue
    out.append("  %s -> %s" % (probe, txt[i:i+30].replace("\n", " ")))

open(r"D:\work\b-mori-frontend\src\enc_scan_report2.txt", "w", encoding="utf-8").write("\n".join(out))
print("OK report2 written")
