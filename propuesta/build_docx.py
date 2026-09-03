#!/usr/bin/env python3
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn, nsmap
from docx.shared import Cm, Inches, Pt, RGBColor

NAVY = RGBColor(0x16, 0x32, 0x4F)
NAVY2 = RGBColor(0x1E, 0x4A, 0x6E)
GOLD = RGBColor(0x9A, 0x7B, 0x3C)
INK = RGBColor(0x1A, 0x23, 0x32)
MUTED = RGBColor(0x5C, 0x6B, 0x7A)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
OK = RGBColor(0x1F, 0x6B, 0x4A)
OK_BG = "E7F4EE"
NO = RGBColor(0x6B, 0x72, 0x80)
NO_BG = "EEF0F2"
ASK = RGBColor(0x8A, 0x5A, 0x12)
ASK_BG = "F8EFD8"
PAPER = "F6F3EC"
LINE = "D5DCE3"
ROW = "F7F9FB"
IN = "Incluido"
OUT = "No incluido"
ASK_L = "Requiere aclaración"

OUT_PATH = Path("/home/user/Pictures/E-learning/propuesta/Propuesta_MVP_Legal_English_5.docx")
SENT_PATH = Path("/home/user/Pictures/E-learning/Propuesta_MVP_Legal_English_5.docx")
CONTRACTOR_NAME = "Carlos Andrés Angola Berrio"
CONTRACTOR_ID = "C.C. 1.118.201.113 expedida en Villanueva, Casanare"


def shade(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag == qn("w:shd"):
            tcPr.remove(child)
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def set_cell_borders(cell, color="D5DCE3"):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "4")
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), color)
        tcBorders.append(el)
    tcPr.append(tcBorders)


def set_run_font(run, name="Calibri", size=10, bold=False, color=INK, italic=False):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color


def p_style(p, after=6, before=0, size=10.5, space=1.15):
    pf = p.paragraph_format
    pf.space_after = Pt(after)
    pf.space_before = Pt(before)
    pf.line_spacing = space


def add_text(p, text, **kw):
    run = p.add_run(text)
    set_run_font(run, **kw)
    return run


def heading(doc, text, level=1):
    p = doc.add_paragraph()
    p_style(p, after=8, before=14 if level == 1 else 10)
    add_text(p, text, name="Calibri", size=14 if level == 1 else 12, bold=True, color=NAVY if level == 1 else NAVY2)
    if level == 1:
        pPr = p._p.get_or_add_pPr()
        pBdr = OxmlElement("w:pBdr")
        bottom = OxmlElement("w:bottom")
        bottom.set(qn("w:val"), "single")
        bottom.set(qn("w:sz"), "12")
        bottom.set(qn("w:space"), "4")
        bottom.set(qn("w:color"), "16324F")
        pBdr.append(bottom)
        pPr.append(pBdr)
    return p


def para(doc, text, size=10.5, after=7, bold=False, color=INK, italic=False):
    p = doc.add_paragraph()
    p_style(p, after=after)
    add_text(p, text, size=size, bold=bold, color=color, italic=italic)
    return p


def rich_para(doc, parts, after=7, size=10.5):
    p = doc.add_paragraph()
    p_style(p, after=after)
    for text, kw in parts:
        add_text(p, text, size=size, **kw)
    return p


def bullets(doc, items, ordered=False):
    for i, item in enumerate(items, 1):
        p = doc.add_paragraph(style="List Number" if ordered else "List Bullet")
        p_style(p, after=3, before=0, space=1.1)
        if isinstance(item, str):
            for run in p.runs:
                run.text = ""
            add_text(p, item, size=10.5)
        else:
            for run in p.runs:
                run.text = ""
            for text, kw in item:
                add_text(p, text, size=10.5, **kw)


def pill_run(p, label):
    if label == IN:
        add_text(p, label.upper(), size=8, bold=True, color=OK)
    elif label == OUT:
        add_text(p, label.upper(), size=8, bold=True, color=NO)
    else:
        add_text(p, label.upper(), size=8, bold=True, color=ASK)


def set_narrow_cell(cell):
    for p in cell.paragraphs:
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.08


def fill_cell(cell, text, header=False, center=False, status=None, bold=False, size=9):
    cell.text = ""
    p = cell.paragraphs[0]
    set_narrow_cell(cell)
    if center:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if status:
        pill_run(p, status)
    else:
        add_text(p, text, size=9 if header else size, bold=header or bold, color=WHITE if header else INK)
    set_cell_borders(cell, "1E4A6E" if header else LINE)
    if header:
        shade(cell, "16324F")


def add_table(doc, headers, rows, col_widths=None, status_col=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    for i, h in enumerate(headers):
        fill_cell(table.rows[0].cells[i], h, header=True)
    for r_i, row in enumerate(rows):
        for c_i, val in enumerate(row):
            is_status = status_col is not None and c_i == status_col
            fill_cell(
                table.rows[r_i + 1].cells[c_i],
                "" if is_status else (val or ""),
                status=val if is_status else None,
                bold=bool(
                    r_i == len(rows) - 1
                    and (
                        str(val).startswith("Honorarios")
                        or str(val).startswith("Suma")
                        or str(val) == "9.750.000"
                    )
                ),
            )
            if r_i % 2 == 1:
                shade(table.rows[r_i + 1].cells[c_i], ROW)
            if is_status:
                shade(table.rows[r_i + 1].cells[c_i], OK_BG if val == IN else (NO_BG if val == OUT else ASK_BG))
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Cm(w)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return table


def shade_paragraph(p, hex_color):
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    pPr.append(shd)


def box_para(doc, parts, fill=PAPER):
    p = doc.add_paragraph()
    p_style(p, after=10, before=4)
    p.paragraph_format.left_indent = Cm(0.2)
    p.paragraph_format.right_indent = Cm(0.2)
    shade_paragraph(p, fill)
    for text, kw in parts:
        add_text(p, text, size=10.5, **kw)
    return p


def build():
    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.left_margin = Cm(1.7)
    section.right_margin = Cm(1.7)
    section.top_margin = Cm(1.6)
    section.bottom_margin = Cm(1.8)

    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(10.5)
    style.font.color.rgb = INK

    cover = doc.add_paragraph()
    p_style(cover, after=2, before=0)
    shade_paragraph(cover, "16324F")
    add_text(cover, "PROPUESTA TÉCNICA Y ECONÓMICA  ·  ALCANCE CERRADO", size=9, bold=True, color=GOLD)

    title = doc.add_paragraph()
    p_style(title, after=2, before=0)
    shade_paragraph(title, "16324F")
    add_text(title, "Implementación del MVP funcional Legal English 5", size=20, bold=True, color=WHITE)

    sub = doc.add_paragraph()
    p_style(sub, after=12, before=0)
    shade_paragraph(sub, "16324F")
    add_text(sub, "Preparado para MPC LAW STUDIO — Legal English Training  ·  Revisión del 3 de septiembre de 2026", size=10.5, color=RGBColor(0xD7, 0xE2, 0xEC))

    meta = doc.add_table(rows=2, cols=3)
    meta_data = [
        ("SOLICITANTE", "Pilar Cruz · pilarcruz640@gmail.com"),
        ("MODALIDAD", "Proyecto por entregables e hitos verificables"),
        ("VIGENCIA DE ESTA REVISIÓN", "15 días calendario desde el 3 de septiembre de 2026"),
    ]
    for i, (k, v) in enumerate(meta_data):
        c0 = meta.rows[0].cells[i]
        c1 = meta.rows[1].cells[i]
        fill_cell(c0, k, header=True, size=8)
        fill_cell(c1, v, size=9)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    heading(doc, "Contratista", 2)
    para(
        doc,
        "Nombre completo e identificación se consignan aquí y se repiten en el contrato. El RUT se anexa a la firma.",
        size=10,
        color=MUTED,
    )
    add_table(
        doc,
        ["Campo", "Dato"],
        [
            ["Nombre completo", CONTRACTOR_NAME],
            ["Identificación", CONTRACTOR_ID],
            ["Calidad tributaria", "No responsable de IVA. Esta oferta no adiciona IVA. Total a pagar: COP $9.750.000."],
            ["Disponibilidad", "Confirmada. Kickoff el día hábil siguiente a la aceptación escrita. Plan intensivo de 15 días hábiles."],
        ],
        col_widths=[5, 12],
    )

    heading(doc, "1. Resumen ejecutivo")
    para(
        doc,
        "Esta propuesta convierte el prototipo de referencia en un MVP de producción, independiente de ChatGPT, apto para usuarios reales y para validar el modelo de suscripción. Conserva la identidad visual y los flujos ya demostrados (Learn, Progress, Admin). Reemplaza autenticación, datos, pagos y seguridad simulados por una implementación administrada, con controles en el servidor y en la base de datos.",
    )
    box_para(
        doc,
        [
            ("Decisión de pasarela. ", {"bold": True}),
            ("Integro ", {}),
            ("Mercado Pago Suscripciones", {"bold": True}),
            (", a nombre de la propietaria como persona natural. Habrá un plan mensual y un plan anual. Activación, renovación, reintento / pendiente, cancelación, pago fallido y vencimiento actualizarán el derecho de acceso de forma real. Un webhook aislado no bloquea a quien ya pagó. Bold no se usa como motor de recurrencia.", {}),
        ],
    )

    heading(doc, "Qué recibe", 2)
    bullets(
        doc,
        [
            "Aplicación web 100 % responsive, desplegada en su dominio.",
            "Cuentas propias: correo, contraseña, verificación, recuperación, perfil y baja.",
            "Roles Owner/Admin y Learner, invisibles e inaccesibles para el usuario ordinario, incluso por URL.",
            "Biblioteca, buscador y filtros por Contracts, Corporate Law y Employment Law.",
            "Quizzes y progreso individual New / Learning / Mastered.",
            "Importación masiva desde Excel, alineada al MCD, operable por usted.",
            "Carga y almacenamiento de audio (usted produce el archivo; el panel lo guarda en su Storage).",
            "Trial real de 7 días y suscripción Mercado Pago con entitlement seguro.",
            "Panel no-code, exportación, respaldo, documentación, capacitación y garantía.",
        ],
    )

    heading(doc, "Stack y por qué puede operarlo usted", 2)
    rich_para(
        doc,
        [
            ("Next.js + TypeScript", {"bold": True}),
            (" · ", {}),
            ("PostgreSQL con RLS (Supabase)", {"bold": True}),
            (" · autenticación de Supabase con su marca · ", {}),
            ("Mercado Pago Suscripciones", {"bold": True}),
            (" · Resend · Vercel · repositorio GitHub a su nombre.", {}),
        ],
    )
    para(
        doc,
        "Usted opera contenido, usuarios, acceso y exportaciones desde el panel o desde Excel. No escribe SQL, webhooks ni reglas de seguridad. Los secretos viven en cada servicio, no en el código. Ninguna cuenta de producción queda a nombre del proveedor.",
    )

    heading(doc, "Honorarios y plazo", 2)
    add_table(
        doc,
        ["Concepto", "Valor"],
        [
            ["Honorarios del proyecto", "COP $9.750.000"],
            ["IVA", "No se factura. El contratista no es responsable de IVA."],
            ["Total a pagar", "COP $9.750.000"],
            ["Tiempo estimado", "3 semanas (15 días hábiles)"],
        ],
        col_widths=[11, 6],
    )
    para(
        doc,
        "Si esa calidad tributaria cambiara antes de la firma, se avisará por escrito. Plan intensivo: Hitos A y B en las semanas 1–2; cobro, QA, acceptance y cierre en la semana 3. El reloj se pausa si faltan cuentas, MCD o habilitación de Mercado Pago.",
        size=10,
        color=MUTED,
    )

    heading(doc, "Composición del precio (transparente)", 2)
    add_table(
        doc,
        ["Línea", "Qué cubre", "COP"],
        [
            ["Núcleo del MVP", "Cuentas, roles, experiencia Learner, panel, trial, despliegue, QA, documentación, capacitación y garantía de 45 días", "6.450.000"],
            ["MCD e importador", "Esquema trazable, categorías canónicas, CivilLawEquivalent, importación Excel con validación por fila, plantilla, carga inicial y flujo de audio", "1.850.000"],
            ["Mercado Pago y entitlement", "Planes mensual y anual, webhooks con reconciliación, estados reales de acceso, ambiente de pruebas y de producción", "1.450.000"],
            ["Honorarios (suma)", "6.450.000 + 1.850.000 + 1.450.000", "9.750.000"],
        ],
        col_widths=[4.2, 10.3, 2.5],
    )

    heading(doc, "Plan de pagos por hitos (sin anticipo desproporcionado)", 2)
    add_table(
        doc,
        ["Hito", "Demostración para liberar el pago", "%", "COP"],
        [
            ["Contrato y kickoff", "Firma + sesión en la que usted crea las cuentas a su nombre", "20 %", "1.950.000"],
            ["A · Cuentas y seguridad", "Registro, verificación, recuperación y RLS: un Learner no accede a Admin ni al progreso ajeno", "25 %", "2.437.500"],
            ["B · Contenido y aprendizaje", "Importador MCD; Contracts, Corporate Law y Employment Law como categorías canónicas (SQL, panel, filtros e importador); quiz; progreso entre dos Learners; carga de audio", "25 %", "2.437.500"],
            ["C · Cobro y acceso", "Trial de 7 días; pago, reintento, pendiente, fallo, cancelación y vencimiento con efecto real; un webhook aislado no bloquea a quien ya pagó", "20 %", "1.950.000"],
            ["Cierre", "Acceptance test escrito (la demostración no es aceptación), docs, capacitación y entrega de accesos", "10 %", "975.000"],
            ["Suma de hitos", "1.950.000 + 2.437.500 + 2.437.500 + 1.950.000 + 975.000", "100 %", "9.750.000"],
        ],
        col_widths=[4.0, 9.0, 1.5, 2.5],
    )
    para(
        doc,
        "Los porcentajes se aplican sobre los honorarios. El IVA, si aplica, se factura en la misma proporción. El saldo final se paga después del acceptance test, la documentación, la capacitación y la entrega de accesos, conforme al numeral 9 de su solicitud.",
        size=10,
        color=MUTED,
    )

    heading(doc, "Costos de terceros (usted los paga a cada proveedor; no forman parte de los honorarios)", 2)
    add_table(
        doc,
        ["Servicio", "Uso", "Estimación"],
        [
            ["Dominio", "Su marca, a su nombre", "COP 60.000–180.000 / año"],
            ["Vercel", "Alojamiento de la aplicación", "USD 0–20 / mes (Hobby o Pro)"],
            ["Supabase Pro", "Base de datos, auth, respaldos diarios", "USD 25 / mes aprox."],
            ["Resend", "Correo de verificación y recuperación", "USD 0–20 / mes"],
            [
                "Mercado Pago",
                "Comisión por cada cobro (referencia 2026)",
                "3,29 % + COP 800 (inmediato) o 2,79 % + COP 800 (14 días), más IVA sobre la comisión. Verificar tarifa vigente en su cuenta.",
            ],
        ],
        col_widths=[3.5, 5.5, 8.0],
    )
    rich_para(
        doc,
        [
            ("Garantía (45 días desde el acta de aceptación): ", {"bold": True}),
            (
                "cubre todos los defectos respecto del alcance contratado, no solo los críticos. “Responder” no es “corregir”. Ver tabla de severidad en el numeral 8. Cambios de alcance se cotizan aparte.",
                {},
            ),
        ],
    )
    rich_para(
        doc,
        [
            ("Cómo se reporta una falla: ", {"bold": True}),
            (
                "el Owner envía un correo a la dirección de garantía del contratista (la misma del contrato) o abre un ticket en el panel Admin → “Reportar incidencia”, con pasos, resultado esperado, captura y severidad propuesta. El contratista acusa recibo en el plazo de respuesta y asigna la severidad.",
                {},
            ),
        ],
    )
    rich_para(
        doc,
        [
            ("Soporte opcional posterior: ", {"bold": True}),
            (
                "COP 950.000 / mes, 8 horas, con los mismos plazos de respuesta/diagnóstico/solución. No es obligatorio para operar el panel.",
                {},
            ),
        ],
    )

    doc.add_page_break()
    heading(doc, "2. Respuesta punto por punto a la Solicitud de Cotización")
    rich_para(
        doc,
        [
            ("Marcas: ", {"color": MUTED}),
            (IN.upper() + "  ", {"bold": True, "color": OK}),
            (OUT.upper() + "  ", {"bold": True, "color": NO}),
            (ASK_L.upper() + ". ", {"bold": True, "color": ASK}),
            ("Donde había ambigüedad, queda resuelta con un supuesto explícito para que el precio sea cerrado.", {"color": MUTED}),
        ],
        size=10,
    )

    heading(doc, "Numeral 1 — Descripción del proyecto", 2)
    add_table(
        doc,
        ["Requisito", "Estado", "Respuesta"],
        [
            [
                "MVP web funcional, seguro y administrable, independiente de ChatGPT",
                IN,
                "Aplicación de producción propia. El prototipo es referencia visual y funcional, no arquitectura vigente.",
            ],
            [
                "Conservar identidad visual y flujos útiles del prototipo",
                IN,
                "Se preservan Learn, Progress, Subscription y Admin. Se reemplazan auth, datos en navegador y pagos ficticios.",
            ],
            [
                "Lanzamiento de 30 Terms: 10 Contracts, 10 Corporate Law, 10 Employment Law",
                IN,
                "Carga inicial = LC-001 de MCD v1.3.81: 10/10/10 Approved, 30 quizzes (18 de 4 opciones, 12 de 3). Approved no es Published. Ver supuesto A.",
            ],
        ],
        col_widths=[5.8, 2.4, 8.8],
        status_col=1,
    )

    heading(doc, "Numeral 2 — Restricción arquitectónica del MCD", 2)
    add_table(
        doc,
        ["Requisito", "Estado", "Respuesta"],
        [
            [
                "MCD como fuente canónica; no modificar, aplanar ni declarar obsoleta su arquitectura de 19 entidades",
                IN,
                "El MCD no se altera. La aplicación usa el Delivery Model: Users, Terms, QuizItems, UserTermProgress y la capa de suscripción/entitlement.",
            ],
            [
                "Transformación MCD → Delivery Model trazable y validable",
                IN,
                "Entrego mapa de campos, reglas de publicación e importador que conserva TermID y relaciones. Learning Collections, Achievements y XP no entran al MVP (numeral 7).",
            ],
        ],
        col_widths=[5.8, 2.4, 8.8],
        status_col=1,
    )

    heading(doc, "Numeral 3 — Alcance funcional mínimo", 2)
    add_table(
        doc,
        ["N.º", "Área", "Estado", "Respuesta"],
        [
            ["1", "Cuentas externas", IN, "Registro e inicio de sesión con correo y contraseña, con su marca. Sin ChatGPT ni otro producto cerrado para autenticar."],
            ["2", "Ciclo de cuenta", IN, "Verificación de correo, recuperación y cambio de contraseña, cierre de sesión, actualización de perfil, desactivación y eliminación de cuenta (habeas data)."],
            ["3", "Roles y permisos", IN, "Owner/Admin y Learner. Admin no es visible ni resoluble para un Learner, incluida la URL directa."],
            ["4", "Aislamiento de datos", IN, "RLS en PostgreSQL: cada usuario solo lee y escribe su progreso. El contenido canónico no es escribible por Learners. Ocultar botones no se considera control de seguridad."],
            ["5", "Contenido", IN, "Cada Term admite definición, pronunciación, categoría canónica, Spanish Equivalent, Civil Law Equivalent condicional, Spanish-Speaker Alert condicional, Use It With, In Context, quiz y carga de AudioUS/AudioUK (usted produce el archivo; el sistema lo almacena). Vacío condicional ≠ error."],
            ["6", "Navegación", IN, "Buscador y filtros por las tres categorías canónicas Contracts, Corporate Law y Employment Law (mismo identificador en SQL, panel, importador y Learner). Una categoría distinta se rechaza. Responsive computador y teléfono."],
            ["7", "Progreso", IN, "New, Learning y Mastered persistentes por usuario. Supuesto B."],
            ["8", "Administración", IN, "Crear, editar, previsualizar, publicar, retirar y eliminar Terms; administrar QuizItems; cargar AudioUS/AudioUK a su Storage; consultar usuarios y estados de acceso; importar Excel; exportar."],
            ["9", "Prueba gratuita", IN, "7 días reales al crear la cuenta, con fechas persistidas. Actualizar el navegador no reinicia el trial."],
            ["10", "Suscripción", IN, "Plan mensual y plan anual en Mercado Pago. Sin suscripción activa tras el trial, el contenido protegido se bloquea."],
            ["11", "Entitlement", IN, "Activación, renovación, pendiente de reintento, cancelación, pago fallido y vencimiento. El acceso no se corta por un webhook aislado si el cobro ya está acreditado. El panel puede otorgar acceso excepcional con fecha de cierre."],
            ["12", "Operabilidad", IN, "Contenido, usuarios, acceso, suscripciones, exportación y recuperación se hacen desde interfaces. Usted no escribe código, SQL, reglas RLS, webhooks ni funciones backend."],
        ],
        col_widths=[1.2, 3.4, 2.4, 10.0],
        status_col=2,
    )

    heading(doc, "Importación masiva desde Excel (alcance confirmado por usted)", 2)
    add_table(
        doc,
        ["Regla", "Estado", "Respuesta"],
        [
            ["Hojas Terms, UseItWithItems, InContextItems, QuizItems y fuentes asociadas", IN, "También Categories y Topics, necesarios para las tres categorías del numeral 6."],
            ["Validar encabezados, obligatorios e identificadores; errores por fila antes de confirmar", IN, "La carga no se confirma si hay errores. Se listan fila, hoja y motivo."],
            ["Conservar relaciones por TermID; crear y actualizar sin duplicar", IN, "Alta y actualización por identificador canónico. No se duplican Terms ni ítems relacionados."],
            ["Campos condicionales vacíos aceptados; plantilla descargable compatible con el MCD", IN, "SpanishSpeakerAlert o CivilLawEquivalent vacíos no bloquean el borrador."],
            ["Términos incompletos como borrador; no publicar si falta quiz obligatorio", IN, "Hoy 6 de 30 Approved tienen quiz. El resto puede importarse y no publicarse hasta que usted complete la editorial."],
            ["Redacción editorial de Terms y quizzes", OUT, "Usted entrega el MCD y hace el trabajo editorial, como acordamos."],
        ],
        col_widths=[5.8, 2.4, 8.8],
        status_col=1,
    )

    heading(doc, "Numeral 4 — Seguridad, privacidad y continuidad", 2)
    add_table(
        doc,
        ["Requisito", "Estado", "Respuesta"],
        [
            ["Controles en servidor o base de datos; no solo interfaz", IN, "RLS, roles en servidor y mutaciones de suscripción solo con service role."],
            ["Bloqueo de rutas admin y de datos ajenos", IN, "Probado con dos Learners y un Owner/Admin, más intento de URL directa."],
            ["Secretos fuera del código y de la interfaz", IN, "Variables de entorno en Vercel/Supabase/Mercado Pago, a su nombre."],
            ["Respaldo, exportación y recuperación documentados", IN, "Se documenta qué recupera cada mecanismo y su RPO. Restaurar un export de prueba no se presenta como restauración completa del sistema. Ver sección 6."],
            [
                "Datos personales y normativa colombiana",
                IN,
                "Consentimiento en el registro, aviso de tratamiento (Ley 1581 de 2012 y Decreto 1377 de 2013), eliminación de cuenta. La revisión jurídica final del texto del aviso es suya. No incluyo concepto de abogado externo.",
            ],
            ["Pentest certificado por un tercero", OUT, "Entrego reporte propio de pruebas de seguridad y de aceptación. Una auditoría externa se cotiza aparte si la desea."],
        ],
        col_widths=[5.8, 2.4, 8.8],
        status_col=1,
    )

    heading(doc, "Numeral 5 — Entregables", 2)
    add_table(
        doc,
        ["Entregable", "Estado", "Respuesta"],
        [
            ["Arquitectura breve y mapa MCD → Delivery Model", IN, "Documento de 4–8 páginas + matriz de campos."],
            [
                "MVP desplegado en dominio y cuentas de la propietaria",
                IN,
                "Sesión inicial de 1–2 h: usted crea dominio, Vercel, Supabase, Resend, Mercado Pago y GitHub; yo recibo acceso delegado, revocable al cierre.",
            ],
            ["Autenticación externa, base de datos, roles e aislamiento", IN, ""],
            ["Panel completo, trial, pasarela y entitlement en prueba y producción", IN, "Mercado Pago."],
            ["Migración inicial de 30 Terms y validación de integridad", IN, "Se carga el MCD entregado. Integridad = identificadores, relaciones y reglas de publicación, no autoría del texto."],
            ["QA funcional, responsive, seguridad y recuperación", IN, "Plan + resultados escritos."],
            ["Documentación operativa y capacitación", IN, "Manual breve + sesión en vivo de 90 minutos, grabada."],
            ["Código, configuraciones y propiedad de cuentas", IN, "Repositorio a su nombre. Ninguna cuenta de producción a nombre del proveedor."],
            ["Periodo de garantía", IN, "45 días para todos los defectos del alcance, con plazos por severidad."],
        ],
        col_widths=[5.8, 2.4, 8.8],
        status_col=1,
    )

    heading(doc, "Numeral 6 — Criterios mínimos de aceptación", 2)
    add_table(
        doc,
        ["Criterio", "Estado", "Cómo se demuestra"],
        [
            ["La demostración de un hito no es aceptación automática", IN, "Cada hito se demuestra; usted tiene 5 días hábiles para firmar el acta o listar defectos por escrito. Sin acta no se entiende aceptado. El 10 % de cierre exige acta de acceptance, no solo la sesión de demo."],
            ["Registro, verificación, login y recuperación", IN, "Cuenta nueva real, no demo."],
            ["Learner no ve ni abre Admin, ni por URL", IN, "Prueba diferencial Owner vs Learner."],
            ["Dos usuarios, progresos independientes", IN, "Dos cuentas Learner sobre el mismo Term."],
            ["Usted crea, edita, publica y retira un Term y su quiz sin apoyo técnico", IN, "Se demuestra en la capacitación."],
            ["Trial persistente; refresh no lo reinicia", IN, "Fechas en base de datos."],
            ["Al vencer el trial, bloqueo salvo suscripción activa", IN, ""],
            [
                "Cancelación y pago fallido con el resultado de acceso documentado",
                IN,
                "Cancelación: acceso hasta el fin del periodo ya pagado. Pago fallido: ver estados de cobro (reintento / pendiente / fallido). Un evento suelto no bloquea a quien ya pagó.",
            ],
            ["Tres categorías canónicas en Hito B", IN, "Se crea un Term de prueba en Contracts, Corporate Law y Employment Law; el filtro las distingue; el importador rechaza cualquier otro valor."],
            ["Carga y reproducción de audio", IN, "Usted produce el archivo; el panel lo sube a su Storage y el Learner lo reproduce."],
            ["Teléfono y computador, sin desborde ni controles cortados", IN, ""],
            ["Exportación y recuperación demostradas", IN, "Se restaura un export en un entorno de prueba y se entrega la lista de qué volvió y qué no (RPO del respaldo diario ≤ 24 h; PITR no incluido)."],
        ],
        col_widths=[5.8, 2.4, 8.8],
        status_col=1,
    )

    heading(doc, "Numeral 7 — Fuera del alcance inicial", 2)
    add_table(
        doc,
        ["Ítem", "Estado", "Respuesta"],
        [
            [
                "Apps nativas iOS/Android; chatbot o IA; pronunciación automática; redacción jurídica automática; traducción automática; investigación jurídica",
                OUT,
                "Confirmado.",
            ],
            [
                "Gamificación, achievements, XP, spaced repetition, Learning Collections",
                OUT,
                "Existen hojas en el MCD; se preservan en el archivo canónico y no se implementan en el Delivery Model del MVP.",
            ],
            ["Creación editorial de los 30 Terms", OUT, "Usted suministra o aprueba el contenido."],
            [
                "Conservar el prototipo de ChatGPT Sites como producto de producción",
                OUT,
                "Coincide con su Registro de Hallazgos: VALIDACIÓN PARCIAL — no aceptado como MVP comercial.",
            ],
        ],
        col_widths=[5.8, 2.4, 8.8],
        status_col=1,
    )

    heading(doc, "Hallazgos del acceptance test del prototipo (25 de agosto de 2026)", 2)
    add_table(
        doc,
        ["Hallazgo", "Estado", "Tratamiento en esta propuesta"],
        [
            ["AT-S03 Autenticación externa inexistente", IN, "Cierra el bloqueo 3.1."],
            ["AT-S10 / S11 / S12 Trial, pagos, entitlement FAIL (G7)", IN, "Cierra el bloqueo 3.2 con Mercado Pago."],
            ["3.3 Seguridad no auditada en backend", IN, "RLS + pruebas diferenciales + reporte. No es pentest de tercero."],
            [
                "Flujos PASS (admin, progreso, aislamiento observado, responsive)",
                IN,
                "Se preservan y se vuelven a probar sobre la implementación externa, como pide el numeral 6 del registro.",
            ],
        ],
        col_widths=[5.8, 2.4, 8.8],
        status_col=1,
    )

    heading(doc, "3. Cronograma (3 semanas calendario)")
    para(
        doc,
        "Disponibilidad confirmada. Kickoff el día hábil siguiente a su aceptación escrita de esta revisión y a la sesión de creación de cuentas. Plan intensivo de 15 días hábiles de dedicación continua. Si una dependencia suya no está lista, esos días no corren contra el plazo.",
    )
    add_table(
        doc,
        ["Semana", "Fase", "Entregable verificable"],
        [
            [
                "0 (día 1, 1–2 h)",
                "Kickoff y titularidad",
                "Usted crea, con su correo institucional, dominio, Vercel, Supabase, Resend, Mercado Pago y GitHub. Permisos delegados. Ninguna cuenta a nombre del proveedor. En esa misma sesión se fijan los precios mensual y anual.",
            ],
            [
                "1",
                "Cimientos y cuentas",
                "Arquitectura y mapa MCD → Delivery Model. Esquema SQL con Category, CivilLawEquivalent, RLS y capa de entitlement. Registro, verificación, recuperación, perfil, baja y roles en sus cuentas. Hito A demostrable al cierre de la semana.",
            ],
            [
                "2",
                "Contenido, aprendizaje y panel",
                "Importador Excel, plantilla, validación por fila y carga del MCD. Contracts, Corporate Law y Employment Law como categorías canónicas (SQL, panel, filtros e importador; se rechaza cualquier otro valor). Flujo de carga y almacenamiento de audio. Biblioteca, quiz, progreso New/Learning/Mastered y aislamiento entre dos Learners. Panel editorial, usuarios, acceso excepcional y exportación. Hito B (la demostración no es aceptación; ver numeral 6).",
            ],
            [
                "3",
                "Cobro, calidad y cierre",
                "Trial de 7 días. Mercado Pago mensual y anual (pruebas y producción). Webhooks con reconciliación: reintento, pendiente, fallo, cancelación y vencimiento. QA funcional, responsive, seguridad y recuperación (lista de qué se restaura y qué no). Acta de acceptance escrita, capacitación de 90 minutos, entrega de accesos y revocación de los míos. Hito C + cierre. La garantía inicia al firmar el acta, no al ver la demo.",
            ],
        ],
        col_widths=[3.4, 4.2, 9.4],
    )

    heading(doc, "Dependencias que pausan el reloj (no son demora del proveedor)", 2)
    bullets(
        doc,
        [
            "Creación y aprobación de las cuentas técnicas a su nombre el día 1, en especial la habilitación de Mercado Pago persona natural.",
            [
                ("Entrega del MCD con los Terms que desee publicar, a más tardar al inicio de la semana 2. El desarrollo no espera a que existan 30 quizzes; la ", {}),
                ("publicación", {"bold": True}),
                (" sí.", {}),
            ],
            "Definir el precio en COP del plan mensual y del plan anual en el kickoff, a más tardar el primer día de la semana 3.",
            "Disponibilidad suya para kickoff, una revisión al cierre de cada semana, pruebas de cobro y la sesión de capacitación.",
        ],
    )

    heading(doc, "4. Supuestos que cierran el precio")
    add_table(
        doc,
        ["ID", "Supuesto"],
        [
            [
                "A",
                "La carga inicial usa exclusivamente MCD v1.3.81 y la colección LC-001 (30 Terms Approved: 10 Corporate Law, 10 Contracts, 10 Employment Law). Approved no es Published: la importación entra a staging. El snapshot anterior (v1.3.37, 30 Corporate, 12 Future, 6 quizzes) queda sustituido.",
            ],
            [
                "B",
                "New = término no abierto. Learning = abierto o quiz intentado sin acierto. Mastered = quiz correcto. Si desea otra regla, se ajusta sin costo antes del Hito B.",
            ],
            ["C", "EKB-DEC-22 prevalece sobre el snapshot anterior: el quiz admite tres o cuatro opciones. OptionD es nullable. El baseline v1.3.81 trae 18 quizzes de cuatro opciones y 12 de tres. CorrectOption debe apuntar a una opción poblada. Acuso por escrito este punto (control C-02 del Delivery Mapping v1.0)."],
            ["D", "La interfaz de la aplicación permanece en inglés, como el prototipo. El panel y la documentación operativa para usted pueden incluir español."],
            ["E", "Usted produce los audios (AudioUS/AudioUK). El MVP incluye, de forma obligatoria, el flujo de carga (individual y masiva), reemplazo, retiro, almacenamiento en su Supabase Storage privado y reproducción en el Learner mediante URL firmada. Un Term puede quedar en borrador sin audio; el vacío no bloquea el borrador. Conforme al Delivery Mapping, la publicación queda bloqueada mientras falte AudioUS (y AudioUK en EMP-009); el sistema no fabrica pistas. Convención de nombres propuesta (control C-01, pendiente de su aprobación antes del Hito B): {TermID}_US.mp3 y {TermID}_UK.mp3 (también m4a, wav, ogg), p. ej. CON-001_US.mp3, EMP-009_UK.mp3. La carga masiva asocia cada archivo por nombre; un nombre que no coincida con un TermID existente se rechaza y se lista, nunca se adivina."],
            ["F", "Un plan mensual y un plan anual, un solo precio cada uno, en COP. Cupones, prorrateo complejo o planes por cohorte no están incluidos."],
            ["G", "Mercado Pago es la única pasarela de suscripción del MVP. Bold puede seguir usándose por usted para cobros puntuales ajenos a este producto; no se integra."],
            ["H", "Capacitación: una sesión de 90 minutos en vivo, grabada. No incluye formación continua ni operación delegada."],
        ],
        col_widths=[1.4, 15.6],
    )

    heading(doc, "5. Prototipo: conservación, refactorización y reemplazo")
    para(
        doc,
        "El ZIP se trató como referencia, no como especificación vigente. La Solicitud de Cotización y el Registro de Hallazgos prevalecen.",
    )
    add_table(
        doc,
        ["Decisión", "Componente", "Motivo"],
        [
            [
                "Conservar (punto de partida)",
                "Identidad visual, flujos Learn / Progress / Admin, idea de entitlement, migración SQL con RLS",
                "Ya demostraron valor en el prototipo y en las pruebas PASS.",
            ],
            [
                "Refactorizar",
                "Modelo de Term y de quiz",
                "Faltan Category, CivilLawEquivalent, In Context relacional, Use It With como entidades y quiz de 4 opciones. El progreso debe ser New / Learning / Mastered, no solo “quiz completed”.",
            ],
            [
                "Reemplazar",
                "Auth de ChatGPT, datos en el navegador, simulador de pagos, panel sin importador",
                "Impiden la aceptación comercial (AT-S03, AT-S10, AT-S11, AT-S12).",
            ],
        ],
        col_widths=[4.2, 6.4, 6.4],
    )
    rich_para(
        doc,
        [
            ("No cobro una línea aparte de “reescribir todo desde cero”. El reemplazo necesario ya está dentro de las tres líneas de honorarios. Conservar el prototipo como backend de producción ", {}),
            ("no", {"bold": True}),
            (" se cotiza porque no es viable.", {}),
        ],
    )

    heading(doc, "6. Seguridad, respaldo, despliegue y migración")
    bullets(
        doc,
        [
            [("Seguridad: ", {"bold": True}), ("RLS por tabla, admin por rol en servidor, suscripciones inmutables desde el cliente, secretos en el panel de cada servicio, HTTPS, verificación de correo, pruebas de IDOR entre dos Learners.", {})],
            [("Despliegue: ", {"bold": True}), ("Vercel + Supabase, ambos a su nombre. Ambiente de prueba y producción separados.", {})],
            [("Migración: ", {"bold": True}), ("importador contra el MCD. Primera carga la ejecuto yo; las siguientes las ejecuta usted.", {})],
            [("Audio: ", {"bold": True}), ("el Owner carga AudioUS/AudioUK desde el panel; el archivo queda en su bucket de Supabase Storage y el Learner lo reproduce. Usted produce el archivo; yo no grabo pistas.", {})],
        ],
    )
    heading(doc, "Qué se respalda, qué se recupera y qué no", 2)
    para(
        doc,
        "Restaurar un export de prueba no equivale a restaurar el sistema completo. En la entrega se demuestra cada mecanismo y se entrega por escrito la lista de qué volvió y qué no.",
    )
    add_table(
        doc,
        ["Mecanismo", "Qué recupera", "Qué no recupera", "RPO / límite"],
        [
            [
                "Exportación del panel",
                "Terms, quizzes, usuarios, progreso, estados de entitlement y metadatos de audio",
                "Objetos binarios de Storage (se respaldan aparte), variables de entorno de Vercel, tablero de Mercado Pago, plantillas de Resend, DNS",
                "Punto en el que usted exportó",
            ],
            [
                "Respaldo diario de Supabase (plan Pro)",
                "Base de datos (cuentas, contenido, progreso, entitlement) y, según el plan, objetos de Storage del proyecto",
                "Configuración fuera de Supabase (Vercel, Mercado Pago, Resend, dominio)",
                "Hasta 24 horas de información pueden perderse. Es el aviso estándar de respaldos diarios.",
            ],
            [
                "Recuperación punto a punto (PITR)",
                "Cualquier instante dentro de la ventana contratada",
                "—",
                "No incluido. Es un add-on de Supabase; si lo desea, se activa en su cuenta y se cotiza la operación aparte.",
            ],
        ],
        col_widths=[3.6, 4.6, 4.6, 4.2],
    )
    para(
        doc,
        "La demostración de cierre restaura un export en un entorno de prueba y, si el plan Pro lo permite, se documenta cómo solicitar un restore del respaldo diario al soporte de Supabase. No se afirma que eso reconstruya Vercel, Mercado Pago ni el DNS.",
        size=10,
        color=MUTED,
    )

    heading(doc, "7. Propiedad intelectual, titularidad y portabilidad")
    bullets(
        doc,
        [
            "El código del MVP, la configuración y la documentación se ceden a MPC LAW STUDIO / la propietaria al pago del cierre.",
            "El MCD y el contenido editorial son y siguen siendo de la propietaria.",
            "Dominio, repositorio, base de datos, autenticación, correo, alojamiento y Mercado Pago quedan a su nombre desde el día 0. El proveedor no crea cuentas de producción a su propio nombre ni retiene control exclusivo.",
            "Al cierre se revocan los accesos del proveedor. Usted puede cambiar de hosting, de repositorio o de desarrollador sin licencia cautiva.",
            "Librerías de terceros conservan su licencia original (MIT y equivalentes de uso habitual).",
        ],
    )

    heading(doc, "8. Condiciones de contratación")
    bullets(
        doc,
        [
            "Contrato de alcance cerrado con estos entregables, criterios de aceptación y precio.",
            "Pagos contra hitos aceptados por escrito. Demostrar un hito no es aceptarlo. Usted tiene 5 días hábiles desde la demo para firmar el acta o listar defectos. El 10 % final se paga después del acta de acceptance, la documentación, la capacitación y la entrega de accesos.",
            "Cambios de alcance (nuevo rol, nueva pasarela, IA, gamificación, más planes de cobro, apps nativas) requieren cotización y aprobación escrita antes de ejecutarse.",
            "No hay dependencia obligatoria del proveedor para operar el producto después de la capacitación.",
        ],
    )
    heading(doc, "Aceptación: una demostración no es aceptación", 2)
    para(
        doc,
        "Cada hito se demuestra en sesión. La aceptación solo ocurre con acta escrita (correo o documento firmado). Una demostración, sola o acompañada de silencio, no equivale a aceptación. Usted dispone de 5 días hábiles para firmar el acta o listar defectos por escrito. El pago del hito se libera al acta, no a la demo. El 10 % de cierre exige acta expresa de acceptance.",
    )
    heading(doc, "Garantía — todos los defectos del alcance, por severidad", 2)
    para(
        doc,
        "45 días calendario desde el acta de aceptación. Cubre todos los defectos respecto del alcance contratado. No cubre cambios de alcance ni fallas de terceros (Mercado Pago, Supabase, Vercel, Resend) ajenas al código entregado. “Responder” es acusar recibo y clasificar; “diagnosticar” es identificar causa; “solucionar” es corregir o entregar un workaround operativo.",
    )
    add_table(
        doc,
        ["Severidad", "Ejemplos", "Respuesta", "Diagnóstico", "Solución objetivo"],
        [
            ["Crítica", "Sin acceso general, cobro que bloquea a quien ya pagó, fuga o pérdida de datos", "4 horas hábiles", "1 día hábil", "2 días hábiles o workaround que restablezca el servicio"],
            ["Alta", "Importador inutilizable, quiz o audio que no persiste, filtro de categoría roto", "1 día hábil", "2 días hábiles", "5 días hábiles"],
            ["Media", "Error no bloqueante de panel, texto o layout en un flujo secundario", "2 días hábiles", "3 días hábiles", "10 días hábiles"],
            ["Baja", "Mejora cosmética, copy, ajuste menor de UI dentro del alcance", "3 días hábiles", "5 días hábiles", "15 días hábiles o el siguiente drop acordado"],
        ],
        col_widths=[2.4, 5.4, 2.6, 2.6, 4.0],
    )
    rich_para(
        doc,
        [
            ("Cómo comunica una falla el usuario (Owner): ", {"bold": True}),
            (
                "(1) correo a la dirección de garantía del contrato, o (2) Admin → “Reportar incidencia”, con pasos, resultado esperado, captura y severidad propuesta. El Learner no abre tickets; reporta al Owner. El contratista acusa recibo en el plazo de Respuesta y confirma o reclasifica la severidad.",
                {},
            ),
        ],
    )
    heading(doc, "Estados de cobro y acceso (Mercado Pago)", 2)
    para(
        doc,
        "Mercado Pago reintenta un cobro fallido de suscripción según su propia política (varios intentos a lo largo de varios días). El sistema no suspende al primer webhook de rechazo. Un evento aislado o fuera de orden no bloquea a quien ya tiene un pago acreditado: se concilia por identificador de pago + marca de tiempo, se ignoran eventos viejos y se sincroniza periódicamente contra la API de Mercado Pago.",
    )
    add_table(
        doc,
        ["Estado interno", "Qué ocurrió", "Acceso del Learner"],
        [
            ["active", "Pago acreditado o trial vigente", "Abierto"],
            ["past_due", "Cobro rechazado; Mercado Pago aún reintenta (gracia de 5 días desde el primer rechazo, alineada a los reintentos; rechazos repetidos del mismo ciclo no la extienden)", "Se mantiene. El usuario ve aviso de pago pendiente con la fecha de fin de gracia, no un bloqueo."],
            ["payment_failed", "Reintentos agotados o rechazo definitivo confirmado por API, no por un solo webhook", "Contenido protegido bloqueado hasta regularizar"],
            ["cancelled", "El usuario canceló", "Abierto hasta el fin del periodo ya pagado; luego bloqueo"],
            ["expired", "Venció trial o periodo pagado sin renovación", "Bloqueado"],
        ],
        col_widths=[3.4, 7.4, 6.2],
    )

    heading(doc, "9. Qué necesito de usted para empezar")
    bullets(
        doc,
        [
            "Aceptación escrita de esta propuesta o contrato equivalente.",
            "Sesión de 1–2 horas para crear las cuentas a su nombre.",
            "El MCD vigente (v1.3.81 / LC-001). Cualquier versión posterior se valida contra el mismo mapping antes de reemplazar la carga.",
            "Precio en COP del plan mensual y del plan anual.",
            "Logo, color de marca y dominio deseado, si ya los tiene; si no, los definimos en el kickoff.",
        ],
        ordered=True,
    )

    box_para(
        doc,
        [
            ("Cierre. ", {"bold": True}),
            (
                "Esta propuesta responde a la Solicitud de Cotización del 24 de agosto de 2026 y al Registro de Hallazgos del 25 de agosto de 2026. No ofrece una demostración visual. No incluye pagos ficticios ni seguridad solo de interfaz. El entregable es un MVP operable por usted, con Mercado Pago, en tres semanas. Quedo atento para agendar el kickoff.",
                {},
            ),
        ],
    )

    sign = doc.add_paragraph()
    p_style(sign, after=2, before=12)
    add_text(sign, "Carlos Andrés Angola Berrio", size=12, bold=True, color=NAVY)
    sign2 = doc.add_paragraph()
    p_style(sign2, after=2)
    add_text(sign2, "Implementación de producto · seguridad aplicada y cobro recurrente", size=10, color=MUTED)
    sign3 = doc.add_paragraph()
    p_style(sign3, after=10)
    add_text(sign3, "Revisión del 3 de septiembre de 2026 · Vigencia: 15 días calendario desde esta fecha", size=10, color=MUTED)

    para(
        doc,
        "Documento único solicitado por la propietaria. Las cifras de comisión de Mercado Pago son referenciales (2026) y las confirma su cuenta de vendedor. Los costos de Vercel, Supabase y Resend se pagan en USD al proveedor correspondiente y pueden variar por tipo de cambio y plan.",
        size=9,
        color=MUTED,
    )

    doc.save(OUT_PATH)
    SENT_PATH.write_bytes(OUT_PATH.read_bytes())
    print(OUT_PATH, OUT_PATH.stat().st_size)
    print(SENT_PATH, SENT_PATH.stat().st_size)


if __name__ == "__main__":
    build()
