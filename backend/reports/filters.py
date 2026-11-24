from django.utils import timezone
from dateutil.relativedelta import relativedelta
from datetime import datetime

def parse_date(date_str):
    """Safely parse YYYY-MM-DD to a date object."""
    try:
        if date_str:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        pass
    return None

def apply_date_filters(queryset, date_field, request_query_params):
    """
    Applies preset and custom date filters to a queryset.
    date_field: the name of the datetime field to filter on, e.g. 'created_at'
    """
    start_date = parse_date(request_query_params.get('start_date'))
    end_date = parse_date(request_query_params.get('end_date'))
    preset = request_query_params.get('date_preset')

    now = timezone.now()
    today = now.date()

    if preset:
        if preset == 'today':
            start = today
            end = today
        elif preset == 'yesterday':
            start = today - relativedelta(days=1)
            end = start
        elif preset == 'last_7_days':
            start = today - relativedelta(days=7)
            end = today
        elif preset == 'last_30_days':
            start = today - relativedelta(days=30)
            end = today
        elif preset == 'this_month':
            start = today.replace(day=1)
            end = today
        elif preset == 'last_month':
            start = (today.replace(day=1) - relativedelta(months=1))
            end = start + relativedelta(months=1, days=-1)
        elif preset == 'this_year':
            start = today.replace(month=1, day=1)
            end = today
        else:
            start = end = None

        if start and end:
            queryset = queryset.filter(**{f"{date_field}__date__gte": start, f"{date_field}__date__lte": end})
    else:
        if start_date:
            queryset = queryset.filter(**{f"{date_field}__date__gte": start_date})
        if end_date:
            queryset = queryset.filter(**{f"{date_field}__date__lte": end_date})

    return queryset

def apply_location_filters(queryset, location_prefixes, request_query_params):
    """
    Applies XOR-aware geographic filters to a queryset.
    location_prefixes: string or list of strings. The path to the kebele/woreda etc. 
                       For Consultations it is 'kebele__'. 
                       For Users it could be ['kebele__', 'assigned_kebeles__']
    """
    from django.db.models import Q
    if isinstance(location_prefixes, str):
        location_prefixes = [location_prefixes]

    region = request_query_params.get('region')
    zone = request_query_params.get('zone')
    special_woreda = request_query_params.get('special_woreda')
    woreda = request_query_params.get('woreda')
    kebele = request_query_params.get('kebele')

    if not any([region, zone, special_woreda, woreda, kebele]):
        return queryset

    combined_q = Q()
    
    for prefix in location_prefixes:
        # Ensure prefix ends with '__' if it exists
        if prefix and not prefix.endswith('__'):
            prefix += '__'

        if kebele:
            combined_q |= Q(**{f"{prefix}id": kebele})
        elif woreda:
            combined_q |= Q(**{f"{prefix}woreda_id": woreda})
        elif special_woreda:
            combined_q |= Q(**{f"{prefix}special_woreda_id": special_woreda})
        elif zone:
            # Filter all kebeles that belong to woredas in this zone
            combined_q |= Q(**{f"{prefix}woreda__zone_id": zone})
        elif region:
            # Filter all kebeles in the region (via normal woreda OR special woreda)
            combined_q |= (
                Q(**{f"{prefix}woreda__zone__region_id": region}) |
                Q(**{f"{prefix}special_woreda__region_id": region})
            )

    return queryset.filter(combined_q).distinct()
