from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0001_initial'),  # adjust to your actual latest locations migration
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0001_initial'),  # adjust to your actual latest accounts migration
    ]

    operations = [
        migrations.CreateModel(
            name='LeadOfficerAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('assigned_at', models.DateTimeField(auto_now_add=True)),
                ('assigned_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('kebele', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lead_officer_assignment', to='locations.kebele', unique=True)),
                ('officer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lead_officer_assignment', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-assigned_at'],
            },
        ),
    ]