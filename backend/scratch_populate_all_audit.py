import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from locations.models import Region, Zone, Woreda, SpecialWoreda, Kebele
from administration.models import AuditLog, ActionCategoryChoices, ActionTypeChoices
from administration.services import AuditService

def run():
    # Target the active administrator: Andualem System Developer (linkedinwork0001@gmail.com)
    admin = User.objects.filter(email='linkedinwork0001@gmail.com').first() or User.objects.filter(role='ADMINISTRATOR', status='ACTIVE').first() or User.objects.first()
    
    # Clear old test logs for a fresh start
    AuditLog.objects.all().delete()
    print(f"Cleared previous audit log entries. Assigning new logs to actor: {admin.get_full_name()} ({admin.email})")

    all_kebeles = Kebele.objects.select_related('woreda', 'special_woreda', 'woreda__zone', 'woreda__zone__region', 'special_woreda__region').all()

    categories_and_actions = [
        (ActionCategoryChoices.USER, ActionTypeChoices.USER_CREATED, "Created new Agriculture Officer profile in system."),
        (ActionCategoryChoices.USER, ActionTypeChoices.USER_UPDATED, "Updated user account contact information and language preferences."),
        (ActionCategoryChoices.ASSIGNMENT, ActionTypeChoices.OFFICER_ASSIGNED, "Assigned Lead Agriculture Officer to assigned administrative unit."),
        (ActionCategoryChoices.ASSIGNMENT, ActionTypeChoices.LEAD_OFFICER_ASSIGNED, "Designated Lead Agriculture Officer for regional oversight."),
        (ActionCategoryChoices.LOCATION, ActionTypeChoices.LOCATION_UPDATED, "Updated Kebele boundary demarcation metadata."),
        (ActionCategoryChoices.EDUCATION, ActionTypeChoices.RESOURCE_PUBLISHED, "Published new educational extension manual: Integrated Pest Management."),
        (ActionCategoryChoices.CONSULTATION, ActionTypeChoices.CONSULTATION_REASSIGNED, "Reassigned urgent crop disease consultation request to specialized officer."),
        (ActionCategoryChoices.CONSULTATION, ActionTypeChoices.CONSULTATION_STATUS_CHANGED, "Marked consultation request as RESOLVED following field visit."),
        (ActionCategoryChoices.SYSTEM, ActionTypeChoices.SYSTEM_SETTING_CHANGED, "Updated platform audit logging configuration and governance security rules.")
    ]

    count = 0
    for k in all_kebeles:
        reg = k.special_woreda.region if k.special_woreda else (k.woreda.zone.region if k.woreda and k.woreda.zone else None)
        zn = k.woreda.zone if k.woreda else None
        wor = k.woreda
        sp_wor = k.special_woreda

        for cat, act, desc in categories_and_actions:
            AuditService.log(
                actor=admin,
                action=act,
                category=cat,
                description=f"{desc} (Location: {k.name})",
                target_type="GovernanceEntity",
                target_repr=f"Target: {k.name}",
                region=reg,
                zone=zn,
                woreda=wor,
                special_woreda=sp_wor,
                kebele=k,
                metadata={'ip': '127.0.0.1', 'device': 'Web Portal'}
            )
            count += 1

    # Add global system logs
    AuditService.log(
        actor=admin,
        action=ActionTypeChoices.SYSTEM_SETTING_CHANGED,
        category=ActionCategoryChoices.SYSTEM,
        description="Global platform audit settings and governance policy update.",
        target_type="SystemSetting",
        target_repr="Global Policy",
        metadata={'ip': '127.0.0.1'}
    )
    count += 1

    print(f"Successfully generated {count} audit logs for actor {admin.get_full_name()} ({admin.email})!")

if __name__ == '__main__':
    run()
