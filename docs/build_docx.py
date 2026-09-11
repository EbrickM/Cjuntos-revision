from docx import Document
from docx.shared import Pt, RGBColor, Cm, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import re

OUT = "seccion4_plataforma_digital_operaciones.docx"

# --- Brand colors ---
RED    = RGBColor(0xE0, 0x20, 0x1C)   # Rojo Bonafide
ORANGE = RGBColor(0xEF, 0x7A, 0x2C)   # Naranja CTA
GRAY   = RGBColor(0x5B, 0x5B, 0x5F)   # Gris marca
INK    = RGBColor(0x26, 0x26, 0x2B)   # Tinta / texto principal
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)

def set_cell_bg(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)

def add_para(doc, text, style="Normal", bold=False, color=None,
             size=None, space_before=0, space_after=6, align=None):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after  = Pt(space_after)
    if align:
        p.alignment = align
    run = p.add_run(text)
    run.bold = bold
    if color:
        run.font.color.rgb = color
    if size:
        run.font.size = Pt(size)
    return p

def add_heading(doc, text, level=1):
    if level == 1:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after  = Pt(6)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(16)
        run.font.color.rgb = RED
    elif level == 2:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after  = Pt(4)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(13)
        run.font.color.rgb = ORANGE
    elif level == 3:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after  = Pt(3)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(11)
        run.font.color.rgb = INK
    return p

def style_table(table, header_bg="E0201C", header_text_color=WHITE):
    table.style = "Table Grid"
    # Header row
    for cell in table.rows[0].cells:
        set_cell_bg(cell, header_bg)
        for para in cell.paragraphs:
            for run in para.runs:
                run.bold = True
                run.font.color.rgb = header_text_color
                run.font.size = Pt(9)
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    # Data rows
    for i, row in enumerate(table.rows[1:], 1):
        bg = "F6F5F3" if i % 2 == 0 else "FFFFFF"
        for cell in row.cells:
            set_cell_bg(cell, bg)
            for para in cell.paragraphs:
                for run in para.runs:
                    run.font.size = Pt(9)
                    run.font.color.rgb = INK

def add_code_block(doc, text):
    for line in text.split("\n"):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(0)
        p.paragraph_format.left_indent  = Cm(0.5)
        run = p.add_run(line if line else " ")
        run.font.name = "Courier New"
        run.font.size = Pt(8)
        run.font.color.rgb = RGBColor(0x26, 0x26, 0x2B)

# ─────────────────────────────────────────────
doc = Document()

# --- Page margins ---
for section in doc.sections:
    section.top_margin    = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin   = Cm(3)
    section.right_margin  = Cm(2.5)

# --- Default font ---
style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(10)
style.font.color.rgb = INK

# ─── COVER ────────────────────────────────────
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(40)
run = p.add_run("B-MORÏ / BONAFIDE ECOSISTEMA DIGITAL")
run.bold = True
run.font.size = Pt(18)
run.font.color.rgb = RED

add_para(doc, "4. Plataforma Digital y Operaciones", bold=True,
         size=14, color=ORANGE, align=WD_ALIGN_PARAGRAPH.CENTER,
         space_before=8, space_after=4)

add_para(doc, "Versión 1.0 — Julio 2026", size=9, color=GRAY,
         align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2)
add_para(doc, "Confidencial — uso interno", size=9, color=GRAY,
         align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=0)

doc.add_page_break()

# ─── 4.1 API GATEWAY ──────────────────────────
add_heading(doc, "4.1  Puerta de Enlace API (API Gateway) de B-Morï", level=1)

add_para(doc, (
    "La plataforma B-Morï se articula en torno a una API Gateway centralizada que actúa "
    "como punto único de entrada para todas las operaciones digitales entre los tres actores "
    "del ecosistema: Bonafide (administrador del programa), Contratantes (empresas grandes o "
    "entidades públicas) y PYMEs beneficiarias."
), space_after=8)

add_heading(doc, "Arquitectura general", level=3)

arch_text = (
    "[PYME / App Móvil-Web]\n"
    "        │\n"
    "        ▼\n"
    "┌──────────────────────────────┐\n"
    "│      API Gateway B-Morï      │  ← Autenticación, enrutamiento,\n"
    "│  (punto único de entrada)    │    limitación de tasa, trazabilidad\n"
    "└────────────┬─────────────────┘\n"
    "             │\n"
    "     ┌───────┴────────┐\n"
    "     ▼                ▼\n"
    "[Servicio de       [Servicio de\n"
    " Facturación]       Créditos]\n"
    "     │                │\n"
    "     ▼                ▼\n"
    "[Servicio de       [Servicio de\n"
    " Contratos]         Pagos / IPI]\n"
    "             │\n"
    "             ▼\n"
    "   [Integraciones externas]\n"
    "   SAP · ERP · Banca · KYC"
)
add_code_block(doc, arch_text)

doc.add_paragraph()
add_heading(doc, "Funciones principales del Gateway", level=3)

gw_data = [
    ("Función", "Descripción"),
    ("Autenticación", "OTP + JWT por sesión. Cada actor (Admin, Contratante, PYME) recibe un token de rol con permisos granulares."),
    ("Enrutamiento", "Dirige cada petición al microservicio correspondiente (facturas, créditos, contratos, pagos)."),
    ("Control de tasa", "Limitación de solicitudes por actor para proteger la plataforma ante usos abusivos."),
    ("Trazabilidad", "Registro de auditoría de todas las operaciones: quién, qué, cuándo, desde qué IP."),
    ("Validación de esquema", "Verifica la integridad de los datos antes de que lleguen a los servicios internos."),
    ("Cifrado en tránsito", "TLS 1.3 en todas las comunicaciones externas e internas."),
]
t = doc.add_table(rows=len(gw_data), cols=2)
t.alignment = WD_TABLE_ALIGNMENT.CENTER
t.columns[0].width = Cm(5)
t.columns[1].width = Cm(11)
for i, (a, b) in enumerate(gw_data):
    t.rows[i].cells[0].text = a
    t.rows[i].cells[1].text = b
style_table(t)

doc.add_paragraph()
add_heading(doc, "Entornos", level=3)
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(4)
p.add_run("Desarrollo / Staging: ").bold = True
p.runs[-1].font.color.rgb = INK
p.add_run("Prototipo funcional de interfaz web desplegado en contenedor Docker + Nginx.")

p2 = doc.add_paragraph()
p2.paragraph_format.space_after = Pt(8)
p2.add_run("Producción (roadmap): ").bold = True
p2.runs[-1].font.color.rgb = INK
p2.add_run("API Gateway sobre infraestructura cloud con alta disponibilidad, logs centralizados y monitoreo en tiempo real.")

# ─── 4.2 FLUJO FACTURAS ───────────────────────
doc.add_paragraph()
add_heading(doc, "4.2  Flujo de Trabajo de Procesamiento de Facturas", level=1)

add_para(doc, "B-Morï soporta dos modalidades de facturación:", space_after=6)

add_heading(doc, "A) Facturación Inversa (principal)", level=2)
add_para(doc, (
    "Es el flujo estándar del programa: el Contratante genera u origina la factura en nombre "
    "de la PYME, que luego la valida y recibe el pago anticipado sobre ella."
), space_after=6)

flujo_text = (
    " PYME / Contratante          Bonafide Admin            Sistema de Pago\n"
    "       │                           │                         │\n"
    "       │  1. Creación de factura   │                         │\n"
    "       │  (FAC-2026-XXXX)          │                         │\n"
    "       │──────────────────────────►│                         │\n"
    "       │                           │                         │\n"
    "       │  2. Envío formal          │                         │\n"
    "       │  (estado: Enviada)        │                         │\n"
    "       │──────────────────────────►│                         │\n"
    "       │                           │ 3. Validación documental│\n"
    "       │                           │    y de contrato        │\n"
    "       │                           │─────────────────────────┤\n"
    "       │                           │ 4. Aprobación           │\n"
    "       │◄──────────────────────────│    (estado: Validada)   │\n"
    "       │                           │                         │\n"
    "       │  5. Emisión de IPI        │                         │\n"
    "       │  (Instrucción de Pago     │────────────────────────►│\n"
    "       │   Irrevocable)            │                         │\n"
    "       │                           │                         │\n"
    "       │  6. Liquidación           │                         │\n"
    "       │◄──────────────────────────│◄────────────────────────│\n"
    "       │  (estado: Pagada)         │                         │"
)
add_code_block(doc, flujo_text)

doc.add_paragraph()
add_heading(doc, "Estados del ciclo de vida", level=3)

estados_data = [
    ("Estado", "Descripción"),
    ("Creada",      "La factura ha sido registrada en el sistema con sus datos básicos."),
    ("Enviada",     "La PYME o el Contratante ha enviado formalmente la factura para revisión."),
    ("Validada",    "Bonafide ha verificado que la factura corresponde a un contrato activo y los datos son correctos."),
    ("IPI Emitido", "Se ha generado la Instrucción de Pago Irrevocable. El pago está comprometido."),
    ("Pagada",      "El monto ha sido liquidado a la PYME. El ciclo está completo."),
]
t2 = doc.add_table(rows=len(estados_data), cols=2)
t2.alignment = WD_TABLE_ALIGNMENT.CENTER
t2.columns[0].width = Cm(4)
t2.columns[1].width = Cm(12)
for i, (a, b) in enumerate(estados_data):
    t2.rows[i].cells[0].text = a
    t2.rows[i].cells[1].text = b
style_table(t2)

doc.add_paragraph()
add_heading(doc, "B) Facturación Directa", level=2)
add_para(doc, (
    "La PYME emite directamente la factura al Contratante. El flujo es más corto y "
    "no genera IPI, ya que el pago sigue los términos contractuales ordinarios sin anticipo de liquidez."
), space_after=4)
add_code_block(doc, "Creada → Enviada → Validada → Pagada")

doc.add_paragraph()
add_heading(doc, "Tiempos de proceso estimados", level=3)

tiempos_data = [
    ("Etapa", "Tiempo objetivo"),
    ("Creación → Envío",          "Inmediato (autoservicio digital)"),
    ("Envío → Validación",        "24–48 horas hábiles"),
    ("Validación → IPI Emitido",  "Mismo día hábil"),
    ("IPI Emitido → Pago liquidado", "24–72 horas (según banco corresponsal)"),
]
t3 = doc.add_table(rows=len(tiempos_data), cols=2)
t3.alignment = WD_TABLE_ALIGNMENT.CENTER
t3.columns[0].width = Cm(8)
t3.columns[1].width = Cm(8)
for i, (a, b) in enumerate(tiempos_data):
    t3.rows[i].cells[0].text = a
    t3.rows[i].cells[1].text = b
style_table(t3)

# ─── 4.3 FACTURAS CERTIFICADAS E IPI ──────────
doc.add_paragraph()
add_heading(doc, "4.3  Facturas Certificadas e Instrucciones de Pago Irrevocables (IPI)", level=1)

add_heading(doc, "¿Qué es una Factura Certificada en B-Morï?", level=2)
add_para(doc, (
    "Una factura certificada es aquella que ha superado el proceso de validación de Bonafide "
    "y cumple los siguientes requisitos:"
), space_after=4)

requisitos = [
    ("1. Vinculada a un contrato activo",
     "Existe un contrato registrado en el sistema (CTR-2026-XXXX) entre la PYME y el Contratante."),
    ("2. Datos consistentes",
     "El monto, concepto y fechas coinciden con las condiciones del contrato."),
    ("3. Documentación KYC vigente",
     "Tanto la PYME como el Contratante tienen su perfil KYC aprobado y sin alertas."),
    ("4. Dentro del límite de crédito",
     "El monto no excede el techo de crédito asignado al contrato."),
]
for title, desc in requisitos:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.space_after = Pt(3)
    run = p.add_run(title + ": ")
    run.bold = True
    run.font.color.rgb = ORANGE
    p.add_run(desc)

add_para(doc, (
    "Una vez certificada, la factura queda sellada digitalmente y no puede modificarse. "
    "Cualquier corrección requiere anulación y emisión de una nueva factura."
), space_before=6, space_after=8)

add_heading(doc, "Ejemplo de Factura Certificada", level=3)
fac_text = (
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    "  B-MORÏ · BONAFIDE ECOSISTEMA DIGITAL\n"
    "  FACTURA CERTIFICADA\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    "  N.º Factura    : FAC-2026-1031\n"
    "  Contrato ref.  : CTR-2026-002\n"
    "  Estado         : Pagada ✓ Certificada\n"
    "\n"
    "  EMISOR (PYME)\n"
    "  Empresa        : Constructora Local GE, S.L.\n"
    "  NIF/RUC        : GE-2020-00445\n"
    "  Dirección      : Malabo, Bioko Norte, GE\n"
    "\n"
    "  RECEPTOR (CONTRATANTE)\n"
    "  Empresa        : Evans Construction & Engineering\n"
    "  Concepto       : Construcción Fase 1 — Cimentación\n"
    "  Período        : Abril 2026\n"
    "\n"
    "  IMPORTE\n"
    "  Monto neto     : XAF 18.000.000\n"
    "  IVA (0% GE)    : XAF 0\n"
    "  TOTAL FACTURA  : XAF 18.000.000\n"
    "\n"
    "  Fecha emisión  : 15/04/2026\n"
    "  Fecha vencim.  : 15/05/2026\n"
    "  Fecha pago     : 22/04/2026 (anticipado vía IPI)\n"
    "\n"
    "  Hash de integridad : a3f9c2...b74d1e\n"
    "  Sello Bonafide     : VALIDADA Y CERTIFICADA\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
)
add_code_block(doc, fac_text)

doc.add_paragraph()
add_heading(doc, "¿Qué es una IPI (Instrucción de Pago Irrevocable)?", level=2)
add_para(doc, (
    "La IPI es el instrumento clave del modelo de financiamiento de B-Morï. Es una orden de pago "
    "emitida por el Contratante, dirigida al banco corresponsal, instruyendo el pago irrevocable "
    "de una factura validada a favor de la PYME, con independencia de cualquier disputa comercial posterior."
), space_after=6)

caracteristicas = [
    ("Irrevocable", "Una vez emitida y aceptada por el banco, el Contratante no puede cancelarla unilateralmente."),
    ("Vinculada a factura", "Cada IPI referencia exactamente una factura certificada."),
    ("Garante de liquidez", "Permite a Bonafide anticipar el pago a la PYME antes del vencimiento de la factura."),
    ("Trazable", "Registrada en la plataforma con número de serie único."),
]
for title, desc in caracteristicas:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.space_after = Pt(3)
    run = p.add_run(title + ": ")
    run.bold = True
    run.font.color.rgb = ORANGE
    p.add_run(desc)

doc.add_paragraph()
add_heading(doc, "Ejemplo de IPI", level=3)
ipi_text = (
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    "  INSTRUCCIÓN DE PAGO IRREVOCABLE (IPI)\n"
    "  B-MORÏ · BONAFIDE ECOSISTEMA DIGITAL\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    "  N.º IPI        : IPI-2026-0089\n"
    "  Factura ref.   : FAC-2026-1031\n"
    "  Contrato ref.  : CTR-2026-002\n"
    "  Fecha emisión  : 18/04/2026\n"
    "  Estado         : EJECUTADA\n"
    "\n"
    "  ORDENANTE (CONTRATANTE)\n"
    "  Razón social   : Evans Construction & Engineering\n"
    "  Banco          : BGFI Bank Guinea Ecuatorial\n"
    "  Cuenta IBAN    : GQ XX XXXX XXXX XXXX XXXX\n"
    "\n"
    "  BENEFICIARIO (PYME)\n"
    "  Razón social   : Constructora Local GE, S.L.\n"
    "  Banco destino  : CCEI Bank GE\n"
    "  Cuenta IBAN    : GQ XX XXXX XXXX XXXX XXXX\n"
    "\n"
    "  INSTRUCCIÓN\n"
    "  El Ordenante instruye irrevocablemente al banco\n"
    "  indicado que transfiera al Beneficiario el importe\n"
    "  de XAF 18.000.000 con fecha valor 22/04/2026,\n"
    "  en concepto de liquidación de la factura\n"
    "  FAC-2026-1031, correspondiente al contrato\n"
    "  CTR-2026-002 activo en la plataforma B-Morï.\n"
    "\n"
    "  Esta instrucción no podrá ser revocada ni\n"
    "  modificada por el Ordenante una vez aceptada\n"
    "  por la entidad bancaria.\n"
    "\n"
    "  Firma digital Bonafide: [SELLO ELECTRÓNICO]\n"
    "  Hash de trazabilidad  : c7a1b3...f92e44\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
)
add_code_block(doc, ipi_text)

# ─── 4.4 INTEGRACIÓN ERP ──────────────────────
doc.add_paragraph()
add_heading(doc, "4.4  Capacidades de Integración con Sistemas ERP Corporativos", level=1)

add_heading(doc, "Principio de integración", level=2)
add_para(doc, (
    "La arquitectura de B-Morï está diseñada para ser agnóstica al ERP del Contratante. "
    "La plataforma expone una API REST documentada (OpenAPI 3.0) que permite a cualquier "
    "sistema externo consultar, enviar y recibir datos de facturas, contratos y pagos."
), space_after=8)

add_heading(doc, "Integración con SAP", level=2)

sap_data = [
    ("Módulo SAP", "Punto de integración B-Morï", "Método"),
    ("FI (Finanzas)",               "Sincronización de facturas de proveedores (PYMEs)", "API REST → iDoc / BAPI"),
    ("MM (Gestión de materiales)",  "Verificación de órdenes de compra vinculadas a contratos", "Webhook saliente desde SAP"),
    ("AP (Cuentas a pagar)",        "Confirmación de pagos / IPI emitidos", "Notificación automática vía webhook"),
    ("CO (Controlling)",            "Datos de contratos activos para imputación de costes", "Consulta periódica (batch)"),
]
t4 = doc.add_table(rows=len(sap_data), cols=3)
t4.alignment = WD_TABLE_ALIGNMENT.CENTER
t4.columns[0].width = Cm(4)
t4.columns[1].width = Cm(8)
t4.columns[2].width = Cm(4.5)
for i, row in enumerate(sap_data):
    for j, val in enumerate(row):
        t4.rows[i].cells[j].text = val
style_table(t4)

doc.add_paragraph()
add_heading(doc, "Flujo de integración SAP ↔ B-Morï", level=3)
sap_flow = (
    "SAP (Contratante)                 B-Morï API Gateway\n"
    "      │                                  │\n"
    "      │  1. Orden de compra aprobada     │\n"
    "      │─────────────────────────────────►│\n"
    "      │                                  │  2. Crea/actualiza contrato\n"
    "      │                                  │     en la plataforma\n"
    "      │  3. PYME emite factura en B-Morï │\n"
    "      │◄─────────────────────────────────│  (webhook a SAP)\n"
    "      │                                  │\n"
    "      │  4. SAP registra factura         │\n"
    "      │     en módulo FI (cta. pagar)    │\n"
    "      │─────────────────────────────────►│  Confirma validación\n"
    "      │                                  │\n"
    "      │  5. B-Morï emite IPI             │\n"
    "      │◄─────────────────────────────────│  (webhook a SAP)\n"
    "      │                                  │\n"
    "      │  6. SAP registra pago            │\n"
    "      │     y cierra posición FI         │"
)
add_code_block(doc, sap_flow)

doc.add_paragraph()
add_heading(doc, "Integración con otros ERPs", level=2)

erps_data = [
    ("Sistema", "Estado de integración"),
    ("SAP S/4HANA / ECC",        "En desarrollo — conector en construcción"),
    ("Microsoft Dynamics 365",   "Compatible vía API REST estándar"),
    ("Oracle NetSuite",          "Compatible vía API REST estándar"),
    ("Odoo",                     "Compatible vía API REST estándar"),
    ("ERPs locales / a medida",  "Compatible mediante webhooks configurables"),
]
t5 = doc.add_table(rows=len(erps_data), cols=2)
t5.alignment = WD_TABLE_ALIGNMENT.CENTER
t5.columns[0].width = Cm(7)
t5.columns[1].width = Cm(9)
for i, (a, b) in enumerate(erps_data):
    t5.rows[i].cells[0].text = a
    t5.rows[i].cells[1].text = b
style_table(t5)

doc.add_paragraph()
add_heading(doc, "Modalidades de integración disponibles", level=2)

modalidades = [
    ("API REST (síncrona)",
     "Para consultas en tiempo real: estado de facturas, saldos de crédito disponible, contratos activos."),
    ("Webhooks (asíncrona)",
     "Notificaciones automáticas ante eventos clave: factura validada, IPI emitido, pago ejecutado."),
    ("Batch / Reconciliación (programada)",
     "Exportación periódica de datos en formato CSV / JSON / XML para carga masiva en ERP."),
    ("Portal manual",
     "Para Contratantes sin ERP propio, la plataforma web B-Morï ofrece las mismas operaciones a través de su interfaz."),
]
for title, desc in modalidades:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(title + ": ")
    run.bold = True
    run.font.color.rgb = ORANGE
    p.add_run(desc)

doc.add_paragraph()
add_heading(doc, "Seguridad en integraciones", level=2)

seg = [
    ("Autenticación", "OAuth 2.0 (Client Credentials) para integraciones máquina a máquina."),
    ("Firma de webhooks", "Cada evento incluye firma HMAC-SHA256 para verificar el origen."),
    ("IP Allowlisting", "Posibilidad de restringir conexiones a IPs corporativas del Contratante."),
    ("Entorno de sandbox", "Disponible para que los equipos IT de los Contratantes prueben la integración antes de producción."),
]
for title, desc in seg:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(title + ": ")
    run.bold = True
    run.font.color.rgb = INK
    p.add_run(desc)

# ─── RESUMEN EJECUTIVO ─────────────────────────
doc.add_paragraph()
add_heading(doc, "Resumen Ejecutivo — Sección 4", level=1)

resumen_data = [
    ("Tema", "Estado actual", "Roadmap"),
    ("Interfaz digital (web/móvil)", "✅ Prototipo funcional completo",  "Despliegue producción Q3 2026"),
    ("API Gateway",                  "✅ Arquitectura definida",          "Implementación backend Q3 2026"),
    ("Flujo de facturas (UI)",       "✅ Operativo en prototipo",         "Conexión backend Q3 2026"),
    ("IPI digital",                  "✅ Flujo diseñado e integrado en UI","Firma electrónica legal Q4 2026"),
    ("Integración SAP",              "🔄 Conector en desarrollo",         "Piloto con primer Contratante Q4 2026"),
    ("Integración otros ERPs",       "📋 Especificación lista",           "Según demanda de Contratantes"),
]
t6 = doc.add_table(rows=len(resumen_data), cols=3)
t6.alignment = WD_TABLE_ALIGNMENT.CENTER
t6.columns[0].width = Cm(5.5)
t6.columns[1].width = Cm(6.5)
t6.columns[2].width = Cm(5.5)
for i, row in enumerate(resumen_data):
    for j, val in enumerate(row):
        t6.rows[i].cells[j].text = val
style_table(t6)

# ─── FOOTER ───────────────────────────────────
doc.add_paragraph()
add_para(doc,
    "Documento preparado por el equipo técnico de Bonafide Ecosistema Digital — LiderShore.  "
    "Consultas técnicas: informatica@lidershore.com",
    size=8, color=GRAY, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=20)

doc.save(OUT)
print("Documento generado: " + OUT)
