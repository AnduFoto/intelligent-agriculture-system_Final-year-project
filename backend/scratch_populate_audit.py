import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from locations.models import Region, Zone, Woreda, SpecialWoreda, Kebele
from administration.models import AuditLog, ActionCategoryChoices, ActionTypeChoices
from administration.services import AuditService

def run():
    admin = User.objects.filter(role='ADMINISTRATOR').first() or User.objects.first()
    region = Region.objects.first()
    zone = Zone.objects.first()
    woreda = Woreda.objects.first()
    special_woreda = SpecialWoreda.objects.first()
    kebele = Kebele.objects.first()

    logs_data = [
        {
            'action': ActionTypeChoices.USER_CREATED,
            'category': ActionCategoryChoices.USER,
            'description': 'Created new Agriculture Officer user account (officer.test@example.com).',
            'target_type': 'User',
            'target_repr': 'Agriculture Officer (officer.test@example.com)',
            'region': region,
            'zone': zone,
            'woreda': woreda,
            'kebele': kebele,
        },
        {
            'action': ActionTypeChoices.OFFICER_ASSIGNED,
            'category': ActionCategoryChoices.ASSIGNMENT,
            'description': f'Assigned Officer to Kebele {kebele.name if kebele else "Default"}.',
            'target_type': 'OfficerKebeleAssignment',
            'target_repr': f'Officer -> Kebele ({kebele.name if kebele else "Default"})',
            'region': region,
            'zone': zone,
            'woreda': woreda,
            'kebele': kebele,
        },
        {
            'action': ActionTypeChoices.LOCATION_CREATED,
            'category': ActionCategoryChoices.LOCATION,
            'description': f'Created new location entry under Region {region.name if region else "Default"}.',
            'target_type': 'Location',
            'target_repr': f'Region: {region.name if region else "Default"}',
            'region': region,
        },
        {
            'action': ActionTypeChoices.RESOURCE_PUBLISHED,
            'category': ActionCategoryChoices.EDUCATION,
            'description': 'Published new educational guide "Best Practices for Wheat Rust Prevention".',
            'target_type': 'Resource',
            'target_repr': 'Guide: Wheat Rust Prevention',
            'region': region,
            'special_woreda': special_woreda,
        },
        {
            'action': ActionTypeChoices.CONSULTATION_REASSIGNED,
            'category': ActionCategoryChoices.CONSULTATION,
            'description': 'Reassigned agricultural consultation request #102 to Lead Officer.',
            'target_type': 'Consultation',
            'target_repr': 'Consultation #102',
            'region': region,
            'zone': zone,
            'woreda': woreda,
        },
        {
            'action': ActionTypeChoices.SYSTEM_SETTING_CHANGED,
            'category': ActionCategoryChoices.SYSTEM,
            'description': 'Updated platform security session timeout and governance rules.',
            'target_type': 'SystemSetting',
            'target_repr': 'Session Timeout Policy',
        }
    ]

    count = 0
    for item in logs_data:
        AuditService.log(
            actor=admin,
            action=item['action'],
            category=item['category'],
            description=item['description'],
            target_type=item['target_type'],
            target_repr=item['target_repr'],
            region=item.get('region'),
            zone=item.get('zone'),
            woreda=item.get('woreda'),
            special_woreda=item.get('special_woreda'),
            kebele=item.get('kebele'),
            metadata={'ip': '127.0.0.1', 'browser': 'Chrome/127.0'}
        )
        count += 1

    print(f"Successfully generated {count} initial audit logs across categories and location scopes.")

if __name__ == '__main__':
    run()
