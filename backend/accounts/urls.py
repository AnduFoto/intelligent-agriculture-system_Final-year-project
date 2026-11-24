from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    RegisterView,
    VerifyEmailView,
    ResendVerificationEmailView,
    LoginView,
    LogoutView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    ProfileView,
    AdminCreateUserView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserStatusUpdateView,
    OfficerKebeleListView,
    OfficerKebeleAssignView,
    OfficerKebeleRemoveView,
    KebeleOfficersView,
    MyAssignedKebelesView,
    KebeleLeadOfficerView,
    MyLeadKebeleView,
)
from accounts.views_dashboard import DashboardStatsView

app_name = 'accounts'

urlpatterns = [
    # ---------- Public Registration & Verification ----------
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationEmailView.as_view(), name='resend-verification'),

    # ---------- Authentication ----------
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # ---------- Password Management ----------
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # ---------- Profile ----------
    path('profile/', ProfileView.as_view(), name='profile'),

    # ---------- Administrator: User Management ----------
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/create/', AdminCreateUserView.as_view(), name='admin-user-create'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:pk>/status/', AdminUserStatusUpdateView.as_view(), name='admin-user-status'),

    # ---------- Administrator: Officer-Kebele Assignment ----------
    path('admin/users/<int:pk>/kebeles/', OfficerKebeleListView.as_view(), name='officer-kebele-list'),
    path('admin/users/<int:pk>/kebeles/assign/', OfficerKebeleAssignView.as_view(), name='officer-kebele-assign'),
    path('admin/users/<int:pk>/kebeles/<int:kebele_id>/', OfficerKebeleRemoveView.as_view(), name='officer-kebele-remove'),
    path('admin/kebeles/<int:kebele_id>/officers/', KebeleOfficersView.as_view(), name='kebele-officers'),
    path('my-kebeles/', MyAssignedKebelesView.as_view(), name='my-kebeles'),
    path('admin/kebeles/<int:kebele_id>/lead-officer/', KebeleLeadOfficerView.as_view(), name='kebele-lead-officer'),
    path('my-lead-kebele/', MyLeadKebeleView.as_view(), name='my-lead-kebele'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]