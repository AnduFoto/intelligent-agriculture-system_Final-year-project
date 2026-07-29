from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from accounts.models import User, EmailVerificationToken, PasswordResetToken
from accounts.models import User, EmailVerificationToken, PasswordResetToken, OfficerKebeleAssignment

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    ordering = ['-date_joined']
    list_display = ('email', 'get_full_name', 'role', 'status', 'is_active', 'date_joined')
    list_filter = ('role', 'status', 'is_active', 'language_preference')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {
            'fields': ('first_name', 'middle_name', 'last_name', 'phone_number', 'language_preference')
        }),
        ('Role & Status', {'fields': ('role', 'status')}),
        ('Location', {'fields': ('region', 'zone', 'woreda', 'special_woreda', 'kebele')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'updated_at')}),
      )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'password1', 'password2',
                'first_name', 'last_name', 'phone_number',
                'role', 'status', 'region', 'zone', 'woreda', 'special_woreda', 'kebele',
            ),
        }),
    )

    readonly_fields = ('date_joined', 'updated_at', 'last_login')


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'used', 'created_at', 'expires_at')
    list_filter = ('used',)
    search_fields = ('user__email',)
    readonly_fields = ('token', 'created_at')


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'used', 'created_at', 'expires_at')
    list_filter = ('used',)
    search_fields = ('user__email',)
    readonly_fields = ('token', 'created_at')

@admin.register(OfficerKebeleAssignment)
class OfficerKebeleAssignmentAdmin(admin.ModelAdmin):
    list_display = ('officer', 'kebele', 'assigned_at', 'assigned_by')
    list_filter = ('assigned_at',)
    search_fields = ('officer__email', 'kebele__name')
    readonly_fields = ('assigned_at',)