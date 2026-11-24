import os

with open('docs/final_report/DBU_IS_Final_Year_Project_Report_Massaye.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
html_parts = []
html_header = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>DBU IS Final Year Project Report - Massaye (55-60 Pages)</title>
<style>
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #111;
    max-width: 900px;
    margin: 40px auto;
    padding: 30px 60px;
    background: #fff;
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
  }
  h1 {
    text-align: center;
    font-size: 16pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 50px;
    margin-bottom: 20px;
    border-bottom: 2px solid #333;
    padding-bottom: 8px;
    page-break-before: always;
  }
  h2 {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin-top: 28px;
    margin-bottom: 14px;
  }
  h3 {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  p {
    text-align: justify;
    margin-bottom: 14px;
  }
  .placeholder-box {
    border: 2px dashed #888;
    background: #fbfbfb;
    padding: 35px 20px;
    text-align: center;
    margin: 24px 0 10px 0;
    font-weight: bold;
    color: #444;
  }
  .placeholder-box small {
    display: block;
    font-weight: normal;
    color: #777;
    margin-top: 8px;
  }
  .caption {
    text-align: center;
    font-weight: bold;
    font-size: 10.5pt;
    margin-bottom: 4px;
  }
  .desc {
    text-align: justify;
    font-style: italic;
    font-size: 10pt;
    margin-bottom: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 10pt;
  }
  th, td {
    border: 1px solid #444;
    padding: 8px 10px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
    font-weight: bold;
    text-align: center;
  }
  pre {
    background: #f4f4f4;
    padding: 12px;
    font-family: Consolas, monospace;
    font-size: 9.5pt;
    border: 1px solid #ddd;
    overflow-x: auto;
  }
  @media print {
    body {
      box-shadow: none;
      margin: 0;
      padding: 0;
      max-width: 100%;
    }
  }
</style>
</head>
<body>"""

html_parts.append(html_header)

for line in lines:
    line_s = line.strip()
    if not line_s:
        continue
    if line_s.startswith('CHAPTER ') or line_s in ['DECLARATION', 'APPROVAL SHEET', 'DEDICATION', 'ACKNOWLEDGMENTS', 'ABSTRACT', 'TABLE OF CONTENTS', 'LIST OF ACRONYMS AND ABBREVIATIONS', 'REFERENCES / BIBLIOGRAPHY', 'APPENDIX']:
        html_parts.append(f'<h1>{line_s}</h1>')
    elif line_s.startswith('1.') or line_s.startswith('2.') or line_s.startswith('3.') or line_s.startswith('4.') or line_s.startswith('5.') or line_s.startswith('6.') or line_s in ['Conclusion', 'Recommendation']:
        if len(line_s) < 80 and not line_s.startswith('1. ') and not line_s.startswith('2. '):
            html_parts.append(f'<h2>{line_s}</h2>')
        else:
            html_parts.append(f'<p>{line_s}</p>')
    elif line_s.startswith('1.3.') or line_s.startswith('1.4.') or line_s.startswith('1.5.') or line_s.startswith('1.6.') or line_s.startswith('2.1.') or line_s.startswith('2.2.') or line_s.startswith('3.3.') or line_s.startswith('3.5.') or line_s.startswith('4.3.') or line_s.startswith('5.1.') or line_s.startswith('5.3.') or line_s in ['General Objective', 'Specific Objectives', 'Requirement Gathering Methods', 'Requirement Modelling Approach', 'Tools and Technologies Used']:
        html_parts.append(f'<h3>{line_s}</h3>')
    elif '[ PLACEHOLDER:' in line_s:
        html_parts.append(f'<div class="placeholder-box">{line_s}<small>Recommended Size: Width 5.5 to 6.0 inches | Resolution: 300 DPI</small></div>')
    elif line_s.startswith('Figure '):
        html_parts.append(f'<p class="caption">{line_s}</p>')
    elif line_s.startswith('Description: '):
        html_parts.append(f'<p class="desc">{line_s}</p>')
    elif '|' in line_s:
        cells = [c.strip() for c in line_s.split('|')]
        row_html = ''.join(f'<td>{c}</td>' for c in cells)
        html_parts.append(f'<table><tr>{row_html}</tr></table>')
    else:
        html_parts.append(f'<p>{line_s}</p>')

html_parts.append('</body></html>')

with open('docs/final_report/DBU_IS_Final_Year_Project_Report_Massaye.html', 'w', encoding='utf-8') as f:
    f.write('\n'.join(html_parts))

print('Master HTML report updated successfully!')
