from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "first_name", "last_name", "user_type", "is_active")
    list_filter = ("user_type", "is_active", "is_staff")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)
