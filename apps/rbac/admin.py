from django.contrib import admin

from .models import Permission, Role


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("codename", "name", "module")
    search_fields = ("codename", "name")
    list_filter = ("module",)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "clinic", "is_system")
    list_filter = ("is_system",)
    filter_horizontal = ("permissions",)
