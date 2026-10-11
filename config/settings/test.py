"""Test settings using SQLite."""
from .base import *  # noqa: F403

DEBUG = False
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
USE_S3 = False
CELERY_TASK_ALWAYS_EAGER = True
