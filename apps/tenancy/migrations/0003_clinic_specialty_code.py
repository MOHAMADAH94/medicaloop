from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tenancy", "0002_clinicmembership_roles_clinicservice_clinicsettings_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="clinic",
            name="specialty_code",
            field=models.CharField(db_index=True, default="general", max_length=50),
        ),
    ]
