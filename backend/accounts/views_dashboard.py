from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from accounts.models import User, OfficerKebeleAssignment, RoleChoices
from locations.models import Kebele
from consultations.models import Consultation
from predictions.models import PredictionHistory
from education.models import Resource, Bookmark
from notifications.models import Notification

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        role = user.role

        stats = {}
        recent_activity = []

        if role == RoleChoices.ADMINISTRATOR:
            stats['total_users'] = User.objects.count()
            stats['active_kebeles'] = Kebele.objects.count()
            stats['total_consultations'] = Consultation.objects.count()
            stats['system_alerts'] = Notification.objects.filter(priority__in=['HIGH', 'CRITICAL']).count()

            # Recent Activity for Admin: Recent Users
            recent_users = User.objects.order_by('-date_joined')[:3]
            recent_activity = [
                {
                    'title': 'New User Registered',
                    'desc': f"{u.first_name} {u.last_name} joined as {u.get_role_display()}",
                    'time': u.date_joined.strftime("%b %d, %Y %I:%M %p"),
                    'type': 'success'
                } for u in recent_users
            ]

        elif role == RoleChoices.OFFICER:
            stats['pending_consultations'] = Consultation.objects.filter(assigned_officer=user, status='ASSIGNED').count()
            stats['assigned_kebeles'] = OfficerKebeleAssignment.objects.filter(officer=user).count()
            stats['articles_published'] = Resource.objects.filter(created_by=user, status='PUBLISHED').count()
            stats['scans_reviewed'] = Consultation.objects.filter(assigned_officer=user, status__in=['RESOLVED', 'CLOSED']).count()

            # Recent Activity for Officer: Notifications
            recent_notifs = Notification.objects.filter(recipient=user).order_by('-created_at')[:3]
            recent_activity = [
                {
                    'title': n.title,
                    'desc': n.message[:50] + ('...' if len(n.message) > 50 else ''),
                    'time': n.created_at.strftime("%b %d, %Y %I:%M %p"),
                    'type': 'info' if n.priority in ['NORMAL', 'LOW'] else 'danger'
                } for n in recent_notifs
            ]

        elif role == RoleChoices.FARMER:
            current_month = timezone.now().month
            current_year = timezone.now().year
            stats['scans_this_month'] = PredictionHistory.objects.filter(user=user, created_at__month=current_month, created_at__year=current_year).count()
            stats['active_consultations'] = Consultation.objects.filter(farmer=user, status__in=['NEW', 'ASSIGNED']).count()
            stats['saved_articles'] = Bookmark.objects.filter(user=user).count()
            stats['unread_alerts'] = Notification.objects.filter(recipient=user, is_read=False).count()

            # Recent Activity for Farmer: Notifications
            recent_notifs = Notification.objects.filter(recipient=user).order_by('-created_at')[:3]
            recent_activity = [
                {
                    'title': n.title,
                    'desc': n.message[:50] + ('...' if len(n.message) > 50 else ''),
                    'time': n.created_at.strftime("%b %d, %Y %I:%M %p"),
                    'type': 'info' if n.priority in ['NORMAL', 'LOW'] else 'danger'
                } for n in recent_notifs
            ]

        return Response({
            'stats': stats,
            'recent_activity': recent_activity
        })
