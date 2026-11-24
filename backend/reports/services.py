from django.db.models import Count, Q, Avg, F
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from accounts.models import User, RoleChoices
from locations.models import Region, Zone, Woreda, SpecialWoreda, Kebele
from consultations.models import Consultation, ConsultationStatus, CropType, ProfessionalSpecialization
from predictions.models import PredictionHistory
from education.models import Resource
from reports.filters import apply_date_filters, apply_location_filters

class ReportService:
    @staticmethod
    def _get_authorized_users_queryset(user):
        """Returns the secure base queryset for users based on the requester's role."""
        if user.role == RoleChoices.ADMINISTRATOR:
            qs = User.objects.all()
            if user.woreda_id:
                qs = qs.filter(Q(woreda_id=user.woreda_id) | Q(kebele__woreda_id=user.woreda_id) | Q(kebele_assignments__kebele__woreda_id=user.woreda_id)).distinct()
            elif user.special_woreda_id:
                qs = qs.filter(Q(special_woreda_id=user.special_woreda_id) | Q(kebele__special_woreda_id=user.special_woreda_id) | Q(kebele_assignments__kebele__special_woreda_id=user.special_woreda_id)).distinct()
            return qs
        elif user.role == RoleChoices.OFFICER and hasattr(user, 'lead_officer_assignment') and user.lead_officer_assignment.exists():
            # Lead officer sees farmers in their kebele, plus officers assigned to their kebele
            kebele = user.lead_officer_assignment.first().kebele
            return User.objects.filter(
                Q(kebele=kebele, role=RoleChoices.FARMER) |
                Q(kebele_assignments__kebele=kebele)
            ).distinct()
        else:
            return User.objects.none()

    @staticmethod
    def _get_authorized_consultation_queryset(user):
        """Returns the secure base queryset for consultations based on the requester's role."""
        if user.role == RoleChoices.ADMINISTRATOR:
            qs = Consultation.objects.all()
            if user.woreda_id:
                qs = qs.filter(kebele__woreda_id=user.woreda_id)
            elif user.special_woreda_id:
                qs = qs.filter(kebele__special_woreda_id=user.special_woreda_id)
            return qs
        elif user.role == RoleChoices.OFFICER and hasattr(user, 'lead_officer_assignment') and user.lead_officer_assignment.exists():
            return Consultation.objects.filter(kebele=user.lead_officer_assignment.first().kebele)
        elif user.role == RoleChoices.OFFICER:
            return Consultation.objects.filter(assigned_officer=user)
        elif user.role == RoleChoices.FARMER:
            return Consultation.objects.filter(farmer=user)
        return Consultation.objects.none()

    @staticmethod
    def _get_authorized_prediction_queryset(user):
        if user.role == RoleChoices.ADMINISTRATOR:
            qs = PredictionHistory.objects.all()
            if user.woreda_id:
                qs = qs.filter(user__woreda_id=user.woreda_id)
            elif user.special_woreda_id:
                qs = qs.filter(user__special_woreda_id=user.special_woreda_id)
            return qs
        elif user.role == RoleChoices.OFFICER and hasattr(user, 'lead_officer_assignment') and user.lead_officer_assignment.exists():
            return PredictionHistory.objects.filter(user__kebele=user.lead_officer_assignment.first().kebele)
        elif user.role == RoleChoices.OFFICER:
            return PredictionHistory.objects.none() # Officers typically don't have scoped standalone AI predictions unless they did them themselves
        elif user.role == RoleChoices.FARMER:
            return PredictionHistory.objects.filter(user=user)
        return PredictionHistory.objects.none()

    @staticmethod
    def _get_authorized_resource_queryset(user):
        """Returns the secure base queryset for education resources based on the requester's role."""
        if user.role == RoleChoices.ADMINISTRATOR:
            return Resource.objects.all()
        elif user.role == RoleChoices.OFFICER and hasattr(user, 'lead_officer_assignment') and user.lead_officer_assignment.exists():
            kebele = user.lead_officer_assignment.first().kebele
            # Lead officer can see resources from their kebele, or the parent woreda/special_woreda
            return Resource.objects.filter(
                Q(publisher__kebele=kebele) |
                Q(publisher__woreda=kebele.woreda) |
                Q(publisher__special_woreda=kebele.special_woreda)
            )
        elif user.role == RoleChoices.OFFICER:
            # Regular officer sees resources relevant to their assigned kebeles
            kebeles = user.kebele_assignments.values_list('kebele_id', flat=True)
            if kebeles:
                # To avoid complex joins, just return published resources if they have assignments
                # Or we can do an IN query
                return Resource.objects.filter(
                    Q(publisher__kebele__in=kebeles) |
                    Q(publisher__woreda__kebeles__in=kebeles) |
                    Q(publisher__special_woreda__kebeles__in=kebeles)
                ).distinct()
            return Resource.objects.none()
        elif user.role == RoleChoices.FARMER:
            # Farmers see published resources in their location
            if user.kebele:
                kebele = user.kebele
                return Resource.objects.filter(
                    status='PUBLISHED'
                ).filter(
                    Q(publisher__kebele=kebele) |
                    Q(publisher__woreda=kebele.woreda) |
                    Q(publisher__special_woreda=kebele.special_woreda)
                )
            return Resource.objects.none()
        return Resource.objects.none()
    
    @staticmethod
    def get_overview_statistics(user, query_params):
        """Generates the high-level metrics for the dashboard."""
        stats = {}
        
        # Consultations
        qs_consultations = ReportService._get_authorized_consultation_queryset(user)
        qs_consultations = apply_date_filters(qs_consultations, 'created_at', query_params)
        
        # Only Admins and Lead Officers can apply location filters to consultations
        if user.role in (RoleChoices.ADMINISTRATOR,):
            qs_consultations = apply_location_filters(qs_consultations, 'kebele', query_params)

        consultation_counts = qs_consultations.aggregate(
            total=Count('id'),
            new=Count('id', filter=Q(status=ConsultationStatus.NEW)),
            assigned=Count('id', filter=Q(status=ConsultationStatus.ASSIGNED)),
            resolved=Count('id', filter=Q(status=ConsultationStatus.RESOLVED)),
            closed=Count('id', filter=Q(status=ConsultationStatus.CLOSED)),
        )
        stats['consultations'] = consultation_counts
        
        # AI Predictions
        qs_ai = ReportService._get_authorized_prediction_queryset(user)
        qs_ai = apply_date_filters(qs_ai, 'created_at', query_params)
        if user.role in (RoleChoices.ADMINISTRATOR,):
            qs_ai = apply_location_filters(qs_ai, 'user__kebele', query_params)
            
        stats['ai_predictions'] = {
            'total': qs_ai.count()
        }

        # User stats (Admin and Lead Officer only)
        if user.role in (RoleChoices.ADMINISTRATOR, RoleChoices.OFFICER):
            qs_users = ReportService._get_authorized_users_queryset(user)
            if user.role == RoleChoices.ADMINISTRATOR:
                qs_users = apply_location_filters(qs_users, ['kebele', 'assigned_kebeles'], query_params)
            
            user_counts = qs_users.aggregate(
                total_farmers=Count('id', filter=Q(role=RoleChoices.FARMER)),
                total_officers=Count('id', filter=Q(role=RoleChoices.OFFICER)),
            )
            stats['users'] = user_counts

        # Location counts (Admin only)
        if user.role == RoleChoices.ADMINISTRATOR:
            woreda_count = 1 if user.woreda_id else 0
            special_woreda_count = 1 if user.special_woreda_id else 0
            
            # Count kebeles inside the admin's woreda
            kebele_count = Kebele.objects.count()
            if user.woreda_id:
                kebele_count = Kebele.objects.filter(woreda_id=user.woreda_id).count()
            elif user.special_woreda_id:
                kebele_count = Kebele.objects.filter(special_woreda_id=user.special_woreda_id).count()

            stats['locations'] = {
                'regions': 1 if user.woreda_id or user.special_woreda_id else Region.objects.count(),
                'zones': 1 if user.woreda_id else Zone.objects.count(),
                'woredas': woreda_count if (woreda_count or special_woreda_count) else Woreda.objects.count(),
                'special_woredas': special_woreda_count if (woreda_count or special_woreda_count) else SpecialWoreda.objects.count(),
                'kebeles': kebele_count,
            }
            
        return stats

    @staticmethod
    def get_consultation_statistics(user, query_params):
        """Generates consultation-specific analytics."""
        qs = ReportService._get_authorized_consultation_queryset(user)
        qs = apply_date_filters(qs, 'created_at', query_params)
        
        if user.role in (RoleChoices.ADMINISTRATOR,):
            qs = apply_location_filters(qs, 'kebele', query_params)

        # Basic counts
        counts = qs.aggregate(
            total=Count('id'),
            new=Count('id', filter=Q(status=ConsultationStatus.NEW)),
            assigned=Count('id', filter=Q(status=ConsultationStatus.ASSIGNED)),
            waiting_for_officer=Count('id', filter=Q(status=ConsultationStatus.WAITING_FOR_OFFICER)),
            waiting_for_farmer=Count('id', filter=Q(status=ConsultationStatus.WAITING_FOR_FARMER)),
            resolved=Count('id', filter=Q(status=ConsultationStatus.RESOLVED)),
            closed=Count('id', filter=Q(status=ConsultationStatus.CLOSED)),
        )

        # Trends (group by day)
        trend = list(qs.annotate(date=TruncDate('created_at')).values('date').annotate(count=Count('id')).order_by('date'))
        
        # Crop distribution
        crops = list(qs.values('crop_type__name').annotate(count=Count('id')).order_by('-count'))
        
        # Resolution Time
        # Only calculate for closed consultations where resolved_at is not null
        qs_resolved = qs.filter(resolved_at__isnull=False)
        avg_resolution_time = None
        if qs_resolved.exists():
            # In PostgreSQL, F('resolved_at') - F('created_at') yields an Interval which Django maps to timedelta
            avg_res = qs_resolved.aggregate(avg_time=Avg(F('resolved_at') - F('created_at')))
            # Convert timedelta to total seconds or something useful, if possible.
            # We'll just return the string representation for now, or total_seconds() if it's a timedelta
            val = avg_res['avg_time']
            if val:
                avg_resolution_time = val.total_seconds() / 3600 # in hours

        return {
            'counts': counts,
            'trend': trend,
            'crops': crops,
            'avg_resolution_hours': avg_resolution_time,
        }

    @staticmethod
    def get_ai_statistics(user, query_params):
        """Generates AI-specific analytics."""
        qs = ReportService._get_authorized_prediction_queryset(user)
        qs = apply_date_filters(qs, 'created_at', query_params)

        if user.role in (RoleChoices.ADMINISTRATOR,):
            qs = apply_location_filters(qs, 'user__kebele', query_params)

        # Basic counts
        total = qs.count()

        # Trends (group by day)
        trend = list(qs.annotate(date=TruncDate('created_at')).values('date').annotate(count=Count('id')).order_by('date'))
        
        # Most detected diseases
        diseases = list(qs.values('disease_class').annotate(count=Count('id')).order_by('-count'))
        
        # Most analyzed crops
        crops = list(qs.values('crop').annotate(count=Count('id')).order_by('-count'))

        # Disease by crop matrix
        disease_by_crop = list(qs.values('crop', 'disease_class').annotate(count=Count('id')).order_by('crop', '-count'))
        
        # Average confidence
        avg_confidence = qs.aggregate(avg=Avg('confidence'))['avg']
        
        return {
            'total': total,
            'trend': trend,
            'diseases': diseases,
            'crops': crops,
            'disease_by_crop': disease_by_crop,
            'avg_confidence': avg_confidence,
        }

    @staticmethod
    def get_education_statistics(user, query_params):
        """Generates education-specific analytics."""
        qs = ReportService._get_authorized_resource_queryset(user)
        qs = apply_date_filters(qs, 'created_at', query_params)

        if user.role in (RoleChoices.ADMINISTRATOR,):
            # Location filter on publisher
            # Publisher has woreda, special_woreda, kebele.
            # We can use apply_location_filters but we need to pass a specific prefix
            qs = apply_location_filters(qs, 'publisher', query_params)

        total = qs.count()
        published = qs.filter(status='PUBLISHED').count()
        
        # Aggregations
        from django.db.models import Sum
        metrics = qs.aggregate(
            views=Sum('view_count'),
            downloads=Sum('download_count'),
            bookmarks=Sum('bookmark_count')
        )
        
        # Trends (group by day of publication if exists, or created_at)
        trend = list(qs.annotate(date=TruncDate('created_at')).values('date').annotate(count=Count('id')).order_by('date'))
        
        # Resources by category
        categories = list(qs.values('category__name').annotate(count=Count('id')).order_by('-count'))
        
        # Resources by publisher type
        publishers = list(qs.values('publisher__name', 'publisher__publisher_type').annotate(count=Count('id')).order_by('-count'))

        return {
            'total': total,
            'published': published,
            'views': metrics['views'] or 0,
            'downloads': metrics['downloads'] or 0,
            'bookmarks': metrics['bookmarks'] or 0,
            'trend': trend,
            'categories': categories,
            'publishers': publishers,
        }

    @staticmethod
    def get_users_statistics(user, query_params):
        """Generates the user list specifically for the officers report page."""
        # 1. Fetch the raw users based on role
        if user.role == RoleChoices.ADMINISTRATOR:
            qs = User.objects.filter(role=RoleChoices.OFFICER)
            if user.woreda_id:
                qs = qs.filter(kebele_assignments__kebele__woreda_id=user.woreda_id).distinct()
            elif user.special_woreda_id:
                qs = qs.filter(kebele_assignments__kebele__special_woreda_id=user.special_woreda_id).distinct()
            
            kebele_id = query_params.get('kebele')
            if kebele_id:
                qs = qs.filter(kebele_assignments__kebele_id=kebele_id).distinct()

        elif user.role == RoleChoices.OFFICER and hasattr(user, 'lead_officer_assignment') and user.lead_officer_assignment.exists():
            my_kebele = user.lead_officer_assignment.first().kebele
            qs = User.objects.filter(role=RoleChoices.OFFICER, kebele_assignments__kebele=my_kebele).distinct()
        else:
            qs = User.objects.none()
            
        qs = apply_date_filters(qs, 'date_joined', query_params)

        # 2. Build the chart data (Officers per Kebele)
        from django.db.models import F
        chart_qs = qs.annotate(kebele_name=F('kebele_assignments__kebele__name')).values('kebele_name').annotate(officer_count=Count('id', distinct=True)).order_by('-officer_count')
        chart_data = list(chart_qs)

        # 3. Build the raw user list for the table
        users = []
        qs = qs.prefetch_related('kebele_assignments__kebele', 'lead_officer_assignment')
        
        for u in qs:
            is_lead = hasattr(u, 'lead_officer_assignment') and u.lead_officer_assignment.exists()
            assigned_kebeles = [ka.kebele.name for ka in u.kebele_assignments.all()]
            users.append({
                'id': u.id,
                'name': f"{u.first_name} {u.last_name}".strip(),
                'email': u.email,
                'phone_number': u.phone_number,
                'role_display': 'Lead Officer' if is_lead else 'Agriculture Officer',
                'kebeles': ", ".join(assigned_kebeles),
                'date_joined': u.date_joined.strftime('%Y-%m-%d') if u.date_joined else None
            })

        return {
            'users': users,
            'chart_data': chart_data
        }

    @staticmethod
    def get_farmers_statistics(user, query_params):
        """Generates the farmers list."""
        if user.role == RoleChoices.ADMINISTRATOR:
            qs = User.objects.filter(role=RoleChoices.FARMER)
            kebele_id = query_params.get('kebele')
            if kebele_id:
                qs = qs.filter(kebele_id=kebele_id)
        elif user.role == RoleChoices.OFFICER and hasattr(user, 'lead_officer_assignment') and user.lead_officer_assignment.exists():
            my_kebele = user.lead_officer_assignment.first().kebele
            qs = User.objects.filter(role=RoleChoices.FARMER, kebele=my_kebele)
        else:
            qs = User.objects.none()

        qs = qs.select_related('kebele')
        qs = apply_date_filters(qs, 'date_joined', query_params)

        farmers = []
        for f in qs:
            farmers.append({
                'id': f.id,
                'name': f"{f.first_name} {f.last_name}".strip(),
                'email': f.email,
                'phone_number': f.phone_number,
                'kebele_name': f.kebele.name if f.kebele else 'N/A',
                'date_joined': f.date_joined.strftime('%Y-%m-%d') if f.date_joined else None
            })

        from django.db.models import Count, F
        chart_qs = qs.annotate(kebele_name_chart=F('kebele__name')).values('kebele_name_chart').annotate(count=Count('id', distinct=True)).order_by('-count')
        chart_data = [{'kebele_name': x['kebele_name_chart'] or 'N/A', 'count': x['count']} for x in chart_qs]

        return {'farmers': farmers, 'chart_data': chart_data}

    @staticmethod
    def get_crops_statistics(user, query_params):
        """Generates the crop types list."""
        qs = CropType.objects.all().order_by('name')
        
        # Optionally allow date filters if crops have created_at
        # qs = apply_date_filters(qs, 'created_at', query_params)
        
        crops = []
        for c in qs:
            crops.append({
                'id': c.id,
                'name': c.name,
                'is_active': c.is_active,
                'description': c.description or 'N/A'
            })
            
        from django.db.models import Count
        chart_qs = qs.values('is_active').annotate(count=Count('id')).order_by('-count')
        chart_data = [{'status': 'Active' if x['is_active'] else 'Inactive', 'count': x['count']} for x in chart_qs]

        return {'crops': crops, 'chart_data': chart_data}

    @staticmethod
    def get_specializations_statistics(user, query_params):
        """Generates the specializations list."""
        if user.role == RoleChoices.ADMINISTRATOR:
            qs = ProfessionalSpecialization.objects.all()
            kebele_id = query_params.get('kebele')
            if kebele_id:
                qs = qs.filter(kebele_id=kebele_id)
        elif user.role == RoleChoices.OFFICER and hasattr(user, 'lead_officer_assignment') and user.lead_officer_assignment.exists():
            my_kebele = user.lead_officer_assignment.first().kebele
            qs = ProfessionalSpecialization.objects.filter(kebele=my_kebele)
        else:
            qs = ProfessionalSpecialization.objects.none()

        qs = qs.select_related('kebele').order_by('name')

        specializations = []
        for s in qs:
            specializations.append({
                'id': s.id,
                'name': s.name,
                'is_active': s.is_active,
                'kebele_name': s.kebele.name if s.kebele else 'N/A'
            })
            
        from django.db.models import Count, F
        chart_qs = qs.annotate(kebele_name_chart=F('kebele__name')).values('kebele_name_chart').annotate(count=Count('id', distinct=True)).order_by('-count')
        chart_data = [{'kebele_name': x['kebele_name_chart'] or 'N/A', 'count': x['count']} for x in chart_qs]

        return {'specializations': specializations, 'chart_data': chart_data}
