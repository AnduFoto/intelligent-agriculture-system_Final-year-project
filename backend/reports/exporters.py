import csv
from io import BytesIO
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from django.utils import timezone

class CSVExporter:
    @staticmethod
    def export(data, filename="report.csv"):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response.write('\ufeff'.encode('utf8')) # BOM for Excel to open UTF-8 properly (useful for Amharic)
        
        writer = csv.writer(response)
        
        if isinstance(data, dict):
            # Flatten dict for overview/simple stats
            writer.writerow(['Metric', 'Value'])
            for key, value in data.items():
                if isinstance(value, dict):
                    writer.writerow([f"--- {key.upper()} ---", ""])
                    for k, v in value.items():
                        writer.writerow([k, v])
                elif isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict):
                    writer.writerow([f"--- {key.upper()} ---", ""])
                    # Write headers
                    headers = value[0].keys()
                    writer.writerow(headers)
                    # Write rows
                    for item in value:
                        writer.writerow(item.values())
                else:
                    writer.writerow([key, value])
        elif isinstance(data, list) and len(data) > 0:
            # Standard list of dicts (e.g. trends)
            headers = data[0].keys()
            writer.writerow(headers)
            for row in data:
                writer.writerow(row.values())
                
        return response

class PDFExporter:
    @staticmethod
    def export(data, title="Report", filename="report.pdf"):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        styles = getSampleStyleSheet()
        elements = []

        # Title
        elements.append(Paragraph(f"Intelligent Agriculture System - {title}", styles['Title']))
        elements.append(Paragraph(f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        elements.append(Spacer(1, 20))

        if isinstance(data, dict):
            for section, content in data.items():
                elements.append(Paragraph(section.replace('_', ' ').title(), styles['Heading2']))
                
                if isinstance(content, dict):
                    table_data = [['Metric', 'Value']]
                    for k, v in content.items():
                        table_data.append([str(k).replace('_', ' ').title(), str(v)])
                    
                    t = Table(table_data)
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    elements.append(t)
                    elements.append(Spacer(1, 15))
                elif isinstance(content, list) and len(content) > 0:
                    headers = list(content[0].keys())
                    table_data = [[Paragraph(h.replace('_', ' ').title(), styles['Normal']) for h in headers]]
                    for item in content:
                        table_data.append([Paragraph(str(v), styles['Normal']) for v in item.values()])
                    
                    t = Table(table_data)
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP')
                    ]))
                    elements.append(t)
                    elements.append(Spacer(1, 15))
                else:
                    elements.append(Paragraph(str(content), styles['Normal']))
                    elements.append(Spacer(1, 15))
        elif isinstance(data, list) and len(data) > 0:
            headers = list(data[0].keys())
            table_data = [[Paragraph(h.replace('_', ' ').title(), styles['Normal']) for h in headers]]
            for item in data:
                table_data.append([Paragraph(str(v), styles['Normal']) for v in item.values()])
            
            t = Table(table_data)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'TOP')
            ]))
            elements.append(t)
            elements.append(Spacer(1, 15))

        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)
        return response
