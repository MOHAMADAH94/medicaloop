import re

from django.db import migrations, models


def populate_usernames(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    taken = set(User.objects.exclude(username__isnull=True).exclude(username="").values_list("username", flat=True))

    for user in User.objects.filter(username__isnull=True):
        base = ""
        if user.email:
            base = user.email.split("@")[0].lower()
            base = re.sub(r"[^a-zA-Z0-9_\u0600-\u06FF]", "_", base).strip("_") or "user"
        else:
            base = "user"

        username = base
        counter = 1
        while username in taken:
            username = f"{base}{counter}"
            counter += 1

        taken.add(username)
        user.username = username
        user.save(update_fields=["username"])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="username",
            field=models.CharField(max_length=150, null=True, unique=False),
        ),
        migrations.RunPython(populate_usernames, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user",
            name="username",
            field=models.CharField(max_length=150, unique=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
        migrations.RemoveIndex(
            model_name="user",
            name="accounts_us_email_74c8d6_idx",
        ),
        migrations.AddIndex(
            model_name="user",
            index=models.Index(fields=["username"], name="accounts_us_usernam_idx"),
        ),
    ]
