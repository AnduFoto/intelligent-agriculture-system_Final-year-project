import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def get_base_document():
    doc = docx.Document()
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(0.75)
        section.header.is_linked_to_previous = False
        section.footer.is_linked_to_previous = False
    return doc

def set_font(run, font_name="Times New Roman", size_pt=12, bold=False, italic=False, color_rgb=(0,0,0)):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

def add_para(doc, text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=6, line_spacing=1.5, bold=False, italic=False, font_size=12):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    if text:
        run = p.add_run(text)
        set_font(run, font_name="Times New Roman", size_pt=font_size, bold=bold, italic=italic)
    return p

def add_h1(doc, title):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.line_spacing = 1.5
    run = p.add_run(title.upper())
    set_font(run, font_name="Times New Roman", size_pt=16, bold=True)
    return p

def add_h2(doc, title):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.5
    run = p.add_run(title)
    set_font(run, font_name="Times New Roman", size_pt=14, bold=True)
    return p

def add_h3(doc, title):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.5
    run = p.add_run(title)
    set_font(run, font_name="Times New Roman", size_pt=12, bold=True)
    return p

def add_bullet(doc, text):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.5
    run = p.add_run(text)
    set_font(run, font_name="Times New Roman", size_pt=12)
    return p

def add_styled_table(doc, headers, data, caption=""):
    if caption:
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cp.paragraph_format.space_before = Pt(8)
        cp.paragraph_format.space_after = Pt(4)
        c_run = cp.add_run(caption)
        set_font(c_run, font_name="Times New Roman", size_pt=11, bold=True)

    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    
    # Header Row
    hdr_cells = table.rows[0].cells
    for i, header_text in enumerate(headers):
        hdr_cells[i].text = header_text
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        for r in p.runs:
            set_font(r, font_name="Times New Roman", size_pt=10, bold=True)
        shading = parse_xml(r'<w:shd {} w:fill="E0E0E0"/>'.format(nsdecls('w')))
        hdr_cells[i]._tc.get_or_add_tcPr().append(shading)

    # Data Rows
    for row_idx, row_data in enumerate(data):
        row_cells = table.rows[row_idx + 1].cells
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = str(cell_value)
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            for r in p.runs:
                set_font(r, font_name="Times New Roman", size_pt=9.5)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def add_screenshot_placeholder(doc, figure_num, figure_title, description):
    # Professional Box Placeholder for screenshots
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.rows[0].cells[0]
    cell.width = Inches(6.0)
    
    # Border & background styling
    shd = parse_xml(r'<w:shd {} w:fill="F8F9FA"/>'.format(nsdecls('w')))
    cell._tc.get_or_add_tcPr().append(shd)
    
    borders = parse_xml(r'''
        <w:tcBorders {} >
            <w:top w:val="dashed" w:sz="8" w:space="0" w:color="A0A0A0"/>
            <w:left w:val="dashed" w:sz="8" w:space="0" w:color="A0A0A0"/>
            <w:bottom w:val="dashed" w:sz="8" w:space="0" w:color="A0A0A0"/>
            <w:right w:val="dashed" w:sz="8" w:space="0" w:color="A0A0A0"/>
        </w:tcBorders>'''.format(nsdecls('w')))
    cell._tc.get_or_add_tcPr().append(borders)
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(28)
    p.paragraph_format.space_after = Pt(4)
    r1 = p.add_run(f"[ PLACEHOLDER: INSERT {figure_title.upper()} HERE ]\n")
    set_font(r1, font_name="Times New Roman", size_pt=11, bold=True, color_rgb=(70,70,70))
    
    r2 = p.add_run("Recommended Size: Width 5.5 to 6.0 inches | Resolution: 300 DPI\n(Paste or Insert Screenshot Image inside this container)")
    set_font(r2, font_name="Times New Roman", size_pt=9.5, italic=True, color_rgb=(120,120,120))
    p.paragraph_format.space_after = Pt(28)

    # Figure Caption
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_before = Pt(6)
    cap.paragraph_format.space_after = Pt(4)
    r_cap = cap.add_run(f"Figure {figure_num}: {figure_title}")
    set_font(r_cap, font_name="Times New Roman", size_pt=10.5, bold=True)
    
    desc_p = doc.add_paragraph()
    desc_p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    desc_p.paragraph_format.space_before = Pt(0)
    desc_p.paragraph_format.space_after = Pt(12)
    desc_r = desc_p.add_run(f"Description: {description}")
    set_font(desc_r, font_name="Times New Roman", size_pt=10, italic=True)
