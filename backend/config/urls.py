from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/locations/', include('locations.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/consultations/', include('consultations.urls')),
    path('api/education/', include('education.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/administration/', include('administration.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/community/', include('community.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)