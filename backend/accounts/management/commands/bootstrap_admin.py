from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from accounts.models import User
from locations.models import Region, SpecialWoreda


class Command(BaseCommand):
    help = (
        "Creates the very first Administrator account for the system, "
        "along with a default Region and Special Woreda if none exist yet. "
        "Intended to be run exactly once, on a fresh database."
    )

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True, help="Administrator's email address")
        parser.add_argument('--password', required=True, help="Administrator's password")
        parser.add_argument('--first-name', required=True, dest='first_name')
        parser.add_argument('--last-name', required=True, dest='last_name')
        parser.add_argument(
            '--region-name',
            default='National',
            help="Name of the bootstrap Region to create if none exists (default: 'National')"
        )
        parser.add_argument(
            '--special-woreda-name',
            default='Headquarters',
            help="Name of the bootstrap Special Woreda to create if none exists (default: 'Headquarters')"
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        region_name = options['region_name']
        special_woreda_name = options['special_woreda_name']

        if User.objects.filter(role='ADMINISTRATOR').exists():
            raise CommandError(
                "An Administrator account already exists. "
                "This command is only for initial bootstrap and will not create another."
            )

        with transaction.atomic():
            region, region_created = Region.objects.get_or_create(name=region_name)
            if region_created:
                self.stdout.write(self.style.SUCCESS(f"Created bootstrap Region: '{region_name}'"))
            else:
                self.stdout.write(f"Using existing Region: '{region_name}'")

            special_woreda, sw_created = SpecialWoreda.objects.get_or_create(
                region=region,
                name=special_woreda_name
            )
            if sw_created:
                self.stdout.write(self.style.SUCCESS(f"Created bootstrap Special Woreda: '{special_woreda_name}'"))
            else:
                self.stdout.write(f"Using existing Special Woreda: '{special_woreda_name}'")

            admin_user = User.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                phone_number='+000000000',
                region=region,
                special_woreda=special_woreda,
            )

        self.stdout.write(self.style.SUCCESS(
            f"First Administrator created successfully: {admin_user.email}"
        ))