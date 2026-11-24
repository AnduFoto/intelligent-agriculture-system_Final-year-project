import markdown

with open('docs/final_report/DBU_IS_Final_Year_Project_Report_Massaye.md', 'r', encoding='utf-8') as f:
    text = f.read()

html_content = markdown.markdown(text, extensions=['tables', 'fenced_code'])

template = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>DBU IS Final Year Project Report - Massaye</title>
<style>
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #111;
    max-width: 900px;
    margin: 40px auto;
    padding: 30px 50px;
    background: #fff;
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
  }
  h1 {
    text-align: center;
    font-size: 16pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 40px;
    margin-bottom: 20px;
    padding-bottom: 6px;
    page-break-before: always;
  }
  h2 {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin-top: 26px;
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
    text-indent: 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 10pt;
  }
  th, td {
    border: 1px solid #333;
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background-color: #f0f0f0;
    font-weight: bold;
    text-align: center;
  }
  pre, code {
    background: #f8f8f8;
    border-radius: 4px;
    font-family: Consolas, monospace;
    font-size: 9.5pt;
  }
  pre {
    padding: 14px;
    overflow-x: auto;
    border: 1px solid #ddd;
  }
  ul, ol {
    margin-bottom: 14px;
    padding-left: 28px;
  }
  li {
    margin-bottom: 6px;
    text-align: justify;
  }
  hr {
    border: 0;
    height: 1px;
    background: #bbb;
    margin: 32px 0;
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
<body>
""" + html_content + """
</body>
</html>"""

with open('docs/final_report/DBU_IS_Final_Year_Project_Report_Massaye.html', 'w', encoding='utf-8') as f:
    f.write(template)

print("HTML report successfully generated at: docs/final_report/DBU_IS_Final_Year_Project_Report_Massaye.html")
