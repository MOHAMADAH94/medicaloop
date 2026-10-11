from django.db import migrations, models


def grant_doctor_settings_manage(apps, schema_editor):
    Role = apps.get_model("rbac", "Role")
    Permission = apps.get_model("rbac", "Permission")
    perm = Permission.objects.filter(codename="settings.manage").first()
    if not perm:
        return
    for role in Role.objects.filter(slug="doctor"):
        role.permissions.add(perm)


class Migration(migrations.Migration):

    dependencies = [
        ("rbac", "0001_initial"),
        ("tenancy", "0005_clinic_specialty_choices"),
    ]

    operations = [
        migrations.AddField(
            model_name="clinicsettings",
            name="theme_color",
            field=models.CharField(
                blank=True,
                default="",
                help_text="لون أساسي مخصص بهيئة #RRGGBB. اتركه فارغاً لاستخدام لون التخصص.",
                max_length=7,
                verbose_name="لون الواجهة",
            ),
        ),
        migrations.RunPython(grant_doctor_settings_manage, migrations.RunPython.noop),
    ]
