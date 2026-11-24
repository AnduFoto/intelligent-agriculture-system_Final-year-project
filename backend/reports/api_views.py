from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reports.services import ReportService
from reports.permissions import IsAuthorizedForReports
from reports.exporters import CSVExporter, PDFExporter

class OverviewReportAPIView(APIView):
    permission_classes = [IsAuthorizedForReports]

    def get(self, request):
        stats = ReportService.get_overview_statistics(request.user, request.query_params)
        return Response(stats, status=status.HTTP_200_OK)

class ConsultationReportAPIView(APIView):
    permission_classes = [IsAuthorizedForReports]

    def get(self, request):
        stats = ReportService.get_consultation_statistics(request.user, request.query_params)
        return Response(stats, status=status.HTTP_200_OK)

class AIReportAPIView(APIView):
    permission_classes = [IsAuthorizedForReports]

    def get(self, request):
        stats = ReportService.get_ai_statistics(request.user, request.query_params)
        return Response(stats, status=status.HTTP_200_OK)

class EducationReportAPIView(APIView):
    permission_classes = [IsAuthorizedForReports]

    def get(self, request):
        stats = ReportService.get_education_statistics(request.user, request.query_params)
        return Response(stats, status=status.HTTP_200_OK)

class UsersReportAPIView(APIView):
    permission_classes = [IsAuthorizedForReports]

    def get(self, request):
        stats = ReportService.get_users_statistics(request.user, request.query_params)
        return Response(stats, status=status.HTTP_200_OK)

class FarmersReportAPIView(APIView):
    permission_classes = [IsAuthorizedForReports]

    def get(self, request):
        stats = ReportService.get_farmers_statistics(request.user, request.query_params)
        return Response(stats, status=status.HTTP_200_OK)

class CropsReportAPIView(APIView):
    permission_classes = [IsAuthorizedForReports]

    def get(self, request):
        stats = ReportService.get_crops_statistics(request.user, request.query_params)
        return Response(stats, status=status.HTTP_200_OK)

class SpecializationsReportAPIView(APIView):
    permission_classes = [IsAuthorizedForReports]

    def get(self, request):
        stats = ReportService.get_specializations_statistics(request.user, request.query_params)
        return Response(stats, status=status.HTTP_200_OK)

class ExportReportAPIView(APIView):
    permission_classes = [IsAuthorizedForReports]

    def get(self, request):
        report_type = request.query_params.get('type', 'overview')
        export_format = request.query_params.get('export_format', 'csv').lower()

        if report_type == 'consultations':
                data = ReportService.get_consultation_statistics(request.user, request.query_params)
                title = "Consultation Analytics"
        elif report_type == 'ai':
                data = ReportService.get_ai_statistics(request.user, request.query_params)
                title = "AI Analytics"
        elif report_type == 'education':
                data = ReportService.get_education_statistics(request.user, request.query_params)
                title = "Education Analytics"
        elif report_type == 'users':
                data = ReportService.get_users_statistics(request.user, request.query_params)['users']
                title = "Users Analytics"
        elif report_type == 'farmers':
                data = ReportService.get_farmers_statistics(request.user, request.query_params)['farmers']
                title = "Farmers List"
        elif report_type == 'crops':
                data = ReportService.get_crops_statistics(request.user, request.query_params)['crops']
                title = "Crop Types"
        elif report_type == 'specializations':
                data = ReportService.get_specializations_statistics(request.user, request.query_params)['specializations']
                title = "Specializations"
        else:
            data = ReportService.get_overview_statistics(request.user, request.query_params)
            title = "Overview Analytics"

        filename = f"{title.lower().replace(' ', '_')}.{export_format}"

        if export_format == 'pdf':
                return PDFExporter.export(data, title=title, filename=filename)
        else:
                return CSVExporter.export(data, filename=filename)
