from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdministrator
from accounts.models import User, RoleChoices, StatusChoices, OfficerKebeleAssignment, LeadOfficerAssignment
from locations.models import Region, Zone, Woreda, SpecialWoreda, Kebele
from education.models import WoredaEducationalManagerAssignment, KebeleEducationalManagerAssignment, Resource
from consultations.models import Consultation
from administration.models import AuditLog
from administration.serializers import AuditLogSerializer
from administration.filters import AuditLogFilter


class AuditLogListView(generics.ListAPIView):
    """
    Returns paginated audit logs for administrators with support for filtering
    by category, action, actor, location hierarchy, date ranges, and search keywords.
    """
    permission_classes = [IsAuthenticated, IsAdministrator]
    serializer_class = AuditLogSerializer
    filterset_class = AuditLogFilter
    queryset = AuditLog.objects.select_related(
        'actor', 'region', 'zone', 'woreda', 'special_woreda', 'kebele'
    ).all()


class AuditLogDetailView(generics.RetrieveAPIView):
    """
    Retrieves detailed audit log entry.
    """
    permission_classes = [IsAuthenticated, IsAdministrator]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.select_related(
        'actor', 'region', 'zone', 'woreda', 'special_woreda', 'kebele'
    ).all()


class SystemAdminDashboardStatsView(APIView):
    """
    Centralized administrative metrics endpoint providing high-level system overview.
    """
    permission_classes = [IsAuthenticated, IsAdministrator]

    def get(self, request, *args, **kwargs):
        total_users = User.objects.count()
        farmers_count = User.objects.filter(role=RoleChoices.FARMER).count()
        officers_count = User.objects.filter(role=RoleChoices.OFFICER).count()
        admins_count = User.objects.filter(role=RoleChoices.ADMINISTRATOR).count()

        total_regions = Region.objects.count()
        total_zones = Zone.objects.count()
        total_woredas = Woreda.objects.count()
        total_special_woredas = SpecialWoreda.objects.count()
        total_kebeles = Kebele.objects.count()

        officer_assignments_count = OfficerKebeleAssignment.objects.count()
        lead_officers_count = LeadOfficerAssignment.objects.count()
        woreda_education_managers_count = WoredaEducationalManagerAssignment.objects.count()
        kebele_education_managers_count = KebeleEducationalManagerAssignment.objects.count()

        total_consultations = Consultation.objects.count()
        total_resources = Resource.objects.count()
        total_audit_logs = AuditLog.objects.count()

        # Recent activities (last 5)
        recent_activities = AuditLogSerializer(
            AuditLog.objects.select_related(
                'actor', 'region', 'zone', 'woreda', 'special_woreda', 'kebele'
            ).all()[:5],
            many=True
        ).data

        return Response({
            'users': {
                'total': total_users,
                'farmers': farmers_count,
                'officers': officers_count,
                'admins': admins_count,
            },
            'locations': {
                'regions': total_regions,
                'zones': total_zones,
                'woredas': total_woredas,
                'special_woredas': total_special_woredas,
                'kebeles': total_kebeles,
            },
            'governance': {
                'officer_assignments': officer_assignments_count,
                'lead_officers': lead_officers_count,
                'woreda_education_managers': woreda_education_managers_count,
                'kebele_education_managers': kebele_education_managers_count,
            },
            'operations': {
                'consultations': total_consultations,
                'educational_resources': total_resources,
                'audit_logs': total_audit_logs,
            },
            'recent_activities': recent_activities,
        }, status=status.HTTP_200_OK)


import io
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from django.utils import timezone


class AuditLogExportPDFView(generics.ListAPIView):
    """
    Generates a downloadable PDF report for filtered audit logs.
    Applies all active filters (category, location hierarchy, date ranges, search).
    """
    permission_classes = [IsAuthenticated, IsAdministrator]
    filterset_class = AuditLogFilter
    queryset = AuditLog.objects.select_related(
        'actor', 'region', 'zone', 'woreda', 'special_woreda', 'kebele'
    ).all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        logs = list(queryset[:500])  # Cap at 500 records for PDF layout safety

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),
            rightMargin=0.4 * inch,
            leftMargin=0.4 * inch,
            topMargin=0.4 * inch,
            bottomMargin=0.4 * inch
        )

        styles = getSampleStyleSheet()
        
        # Custom Paragraph Styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#047857')
        )
        subtitle_style = ParagraphStyle(
            'ReportSubTitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#475569')
        )
        meta_label_style = ParagraphStyle(
            'MetaLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#1E293B')
        )
        meta_val_style = ParagraphStyle(
            'MetaVal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#334155')
        )
        th_style = ParagraphStyle(
            'TH',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.white
        )
        td_style = ParagraphStyle(
            'TD',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=7.5,
            leading=9.5,
            textColor=colors.HexColor('#1E293B')
        )
        td_code_style = ParagraphStyle(
            'TDCode',
            parent=styles['Normal'],
            fontName='Courier',
            fontSize=7,
            leading=8.5,
            textColor=colors.HexColor('#475569')
        )

        elements = []

        # Title Block
        elements.append(Paragraph("INTELLIGENT AGRICULTURE SYSTEM", title_style))
        elements.append(Paragraph("System Administration & Governance Audit Activity Report", subtitle_style))
        elements.append(Spacer(1, 8))

        # Metadata Header Box
        admin_name = request.user.get_full_name() or request.user.email
        now_str = timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')
        cat_filter = request.query_params.get('category', 'All Categories')
        search_filter = request.query_params.get('search', 'None')

        meta_data = [
            [
                Paragraph("<b>Generated By:</b>", meta_label_style),
                Paragraph(f"{admin_name} ({request.user.email})", meta_val_style),
                Paragraph("<b>Generated At:</b>", meta_label_style),
                Paragraph(now_str, meta_val_style)
            ],
            [
                Paragraph("<b>Category Filter:</b>", meta_label_style),
                Paragraph(cat_filter, meta_val_style),
                Paragraph("<b>Search Query:</b>", meta_label_style),
                Paragraph(search_filter, meta_val_style)
            ],
            [
                Paragraph("<b>Total Matching Logs:</b>", meta_label_style),
                Paragraph(str(len(logs)), meta_val_style),
                Paragraph("<b>Location Scope:</b>", meta_label_style),
                Paragraph(getattr(request.user, 'region_name', None) or "System Wide", meta_val_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[1.3*inch, 2.7*inch, 1.3*inch, 2.7*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 10))

        # Table Headers
        table_data = [[
            Paragraph("#", th_style),
            Paragraph("Timestamp", th_style),
            Paragraph("Actor / Administrator", th_style),
            Paragraph("Category", th_style),
            Paragraph("Action", th_style),
            Paragraph("Description", th_style),
            Paragraph("Location Scope", th_style)
        ]]

        # Rows
        for idx, log in enumerate(logs, start=1):
            actor_display = f"{log.actor_name or 'System'}<br/>({log.actor_email or 'N/A'})"
            loc_parts = []
            if log.region: loc_parts.append(log.region.name)
            if log.special_woreda: loc_parts.append(log.special_woreda.name)
            elif log.woreda: loc_parts.append(log.woreda.name)
            if log.kebele: loc_parts.append(log.kebele.name)
            loc_str = " › ".join(loc_parts) if loc_parts else "Global"

            table_data.append([
                Paragraph(str(idx), td_style),
                Paragraph(log.created_at.strftime('%Y-%m-%d %H:%M'), td_style),
                Paragraph(actor_display, td_style),
                Paragraph(log.get_category_display() or log.category, td_style),
                Paragraph(log.get_action_display() or log.action, td_style),
                Paragraph(log.description or '', td_style),
                Paragraph(loc_str, td_code_style)
            ])

        log_table = Table(table_data, colWidths=[0.4*inch, 1.1*inch, 1.6*inch, 1.0*inch, 1.5*inch, 2.8*inch, 1.8*inch])
        
        t_style = [
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#047857')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ]
        for i in range(1, len(table_data)):
            if i % 2 == 0:
                t_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F8FAFC')))
        
        log_table.setStyle(TableStyle(t_style))
        elements.append(log_table)

        doc.build(elements)

        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        filename = f"audit_logs_report_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

