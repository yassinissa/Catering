from django import forms
from django.conf import settings
from django.contrib import admin, messages
from django.db import models
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html

from .models import (
    Branch, Brand, Cuisine, Dish, EventType, RamadanPackage, Reel, Service, SiteSettings, SiteText, SocialLink, admin_url,
)

THUMB = 'height:{h}px;width:auto;max-width:{w}px;border-radius:8px;object-fit:cover;background:#ddd;display:block'


def thumb(url, h=56, w=110):
    if not url:
        return '—'
    return format_html('<img src="{}" style="{}" loading="lazy">', url, THUMB.format(h=h, w=w))


def video_thumb(url, poster, h=56):
    if not url:
        return '—'
    return format_html(
        '<video src="{}" poster="{}" muted loop playsinline preload="metadata" style="{}" '
        'onmouseenter="this.play()" onmouseleave="this.pause()"></video>',
        url, poster or '', THUMB.format(h=h, w=h),
    )


class UploadsAdmin(admin.ModelAdmin):
    """Warns when photos/videos would be saved on Render's temporary disk instead of Cloudinary."""

    def changeform_view(self, request, *args, **kwargs):
        if request.method == 'GET' and settings.ON_RENDER and not settings.CLOUDINARY_ENABLED:
            messages.warning(
                request,
                'Uploads are not set up yet: new photos and videos would disappear at the next deploy. '
                'Add CLOUDINARY_URL in Render → Environment first (see README).',
            )
        return super().changeform_view(request, *args, **kwargs)


class FixedSetAdmin(UploadsAdmin):
    """Rows whose ids are saved with bookings: they can be edited, hidden and reordered, not added or deleted."""

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


# ─── Contact, logo & photos ──────────────────────────────────────────────

@admin.register(SiteSettings)
class SiteSettingsAdmin(UploadsAdmin):
    readonly_fields = ('logo_now', 'about_image_now', 'about_image_small_now')
    fieldsets = (
        ('Contact (footer)', {'fields': ('phone', 'whatsapp', 'email')}),
        ('Logo', {'fields': ('logo_now', 'logo')}),
        ('"Who we are" photos', {'fields': (
            'about_image_now', 'about_image', 'about_image_alt_en', 'about_image_alt_ar',
            'about_image_small_now', 'about_image_small', 'about_image_small_alt_en', 'about_image_small_alt_ar',
        )}),
    )

    @admin.display(description='Current logo')
    def logo_now(self, obj):
        url = admin_url(obj.logo, obj.LOGO_BUILTIN)
        return format_html('<div style="background:#14261a;padding:14px 18px;border-radius:10px;display:inline-block">{}</div>', thumb(url, 44, 220))

    @admin.display(description='Current large photo')
    def about_image_now(self, obj):
        return thumb(admin_url(obj.about_image, obj.ABOUT_BUILTIN), 160, 200)

    @admin.display(description='Current small photo')
    def about_image_small_now(self, obj):
        return thumb(admin_url(obj.about_image_small, obj.ABOUT_SMALL_BUILTIN), 110, 160)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        # a single page, so skip the list
        return redirect(reverse('admin:content_sitesettings_change', args=[SiteSettings.load().pk]))


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ('platform', 'handle', 'url', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_display_links = ('platform',)
    fields = ('platform', 'url', 'handle', 'order', 'is_active')


# ─── Page texts ──────────────────────────────────────────────────────────

TEXT_NAMES = {
    'eyebrow': 'Small label above the title', 'title': 'Title', 'title1': 'Title, line 1', 'title2': 'Title, line 2 (green)',
    'lead': 'Intro paragraph', 'p1': 'Paragraph 1', 'p2': 'Paragraph 2', 'cta': 'Button', 'cta2': 'Second button',
    'note': 'Note', 'sample': 'Menu card heading', 'ask': 'Link under the menu', 'tag': 'Tagline', 'rights': 'Copyright line',
    'top': '"Back to top" link', 'scroll': '"Scroll" hint', 'coverage': 'Coverage line', 'play': 'Play button (screen readers)',
    'closeVideo': 'Close video button (screen readers)', 'directions': 'Directions link', 'call': 'Call link',
    'hotline': 'Hotline label', 'follow': 'Instagram link', 'badgeNum': 'Round badge, number', 'badgeText': 'Round badge, word',
    'menu': 'Menu button', 'close': 'Close button', 'book': '"Book" button',
}
LIST_NAMES = {'pillars': 'Highlight', 'steps': 'Step'}


def text_name(key):
    parts = key.split('.')
    if key == 'marquee':
        return 'Words (one per line)'
    if parts[0] == 'nav' and parts[1] not in ('menu', 'close', 'book'):
        return f'Menu link: {parts[1]}'
    if len(parts) == 4:  # e.g. about.pillars.0.t
        return f"{LIST_NAMES.get(parts[1], parts[1])} {int(parts[2]) + 1} · {'title' if parts[3] == 't' else 'text'}"
    return TEXT_NAMES.get(parts[-1], parts[-1])


@admin.register(SiteText)
class SiteTextAdmin(admin.ModelAdmin):
    list_display = ('name', 'en', 'ar')
    list_editable = ('en', 'ar')
    list_display_links = ('name',)
    list_filter = ('section',)
    search_fields = ('en', 'ar', 'key')
    list_per_page = 100
    actions = ('restore_original',)
    readonly_fields = ('key', 'section', 'original')
    fields = ('section', 'key', 'en', 'ar', 'original')

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name in ('en', 'ar'):
            attrs = {'rows': 2, 'cols': 48, **({'dir': 'rtl'} if db_field.name == 'ar' else {})}
            kwargs['widget'] = forms.Textarea(attrs=attrs)
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    @admin.display(description='Text', ordering='position')
    def name(self, obj):
        return format_html('<b>{}</b><br><small style="color:#888">{}</small>', text_name(obj.key), obj.get_section_display())

    @admin.display(description='Original text')
    def original(self, obj):
        return format_html('<p>{}</p><p dir="rtl">{}</p>', obj.default_en, obj.default_ar)

    @admin.action(description='Restore the original text')
    def restore_original(self, request, queryset):
        n = queryset.update(en=models.F('default_en'), ar=models.F('default_ar'))
        self.message_user(request, f'{n} text(s) restored.', messages.SUCCESS)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        extra_context = {**(extra_context or {}), 'title': 'Page texts: edit and press Save at the bottom'}
        if request.method == 'GET':
            messages.info(
                request,
                'Tip: in titles, put *stars around words* to show them in the green italic style. '
                'An empty box shows the original text.',
            )
        return super().changelist_view(request, extra_context)


# ─── Lists ───────────────────────────────────────────────────────────────

@admin.register(Reel)
class ReelAdmin(UploadsAdmin):
    list_display = ('preview', 'label_en', 'label_ar', 'hero_slot', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_display_links = ('preview', 'label_en')
    readonly_fields = ('preview_large',)
    fields = ('preview_large', 'video', 'poster', 'label_en', 'label_ar', 'hero_slot', 'order', 'is_active')

    @admin.display(description='Video')
    def preview(self, obj):
        return video_thumb(admin_url(obj.video, obj.video_builtin), self._poster(obj))

    @admin.display(description='Current video')
    def preview_large(self, obj):
        if not obj.pk:
            return '—'
        return video_thumb(admin_url(obj.video, obj.video_builtin), self._poster(obj), 220)

    def _poster(self, obj):
        if obj.poster or obj.video:
            return obj.poster_url
        return admin_url(None, obj.poster_builtin)


class DishInline(admin.TabularInline):
    model = Dish
    extra = 1
    fields = ('name_en', 'name_ar', 'order')


@admin.register(Cuisine)
class CuisineAdmin(UploadsAdmin):
    list_display = ('preview', 'name_en', 'name_ar', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_display_links = ('preview', 'name_en')
    readonly_fields = ('preview_large',)
    fields = ('name_en', 'name_ar', 'slug', 'tagline_en', 'tagline_ar', 'preview_large', 'image', 'order', 'is_active')
    inlines = (DishInline,)

    @admin.display(description='Photo')
    def preview(self, obj):
        return thumb(admin_url(obj.image, obj.image_builtin))

    @admin.display(description='Current photo')
    def preview_large(self, obj):
        return thumb(admin_url(obj.image, obj.image_builtin), 160, 280) if obj.pk else '—'

    def get_readonly_fields(self, request, obj=None):
        # the id is saved with bookings, so it is fixed once created
        return self.readonly_fields + (('slug',) if obj else ())

    def get_prepopulated_fields(self, request, obj=None):
        return {} if obj else {'slug': ('name_en',)}


@admin.register(Service)
class ServiceAdmin(FixedSetAdmin):
    list_display = ('preview', 'name_en', 'name_ar', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_display_links = ('preview', 'name_en')
    readonly_fields = ('preview_large',)
    fields = ('name_en', 'name_ar', 'text_en', 'text_ar', 'preview_large', 'image', 'order', 'is_active')

    @admin.display(description='Photo')
    def preview(self, obj):
        return thumb(admin_url(obj.image, obj.image_builtin))

    @admin.display(description='Current photo')
    def preview_large(self, obj):
        return thumb(admin_url(obj.image, obj.image_builtin), 160, 280)


@admin.register(EventType)
class EventTypeAdmin(FixedSetAdmin):
    list_display = ('name_en', 'name_ar', 'text_en', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    fields = ('name_en', 'name_ar', 'text_en', 'text_ar', 'order', 'is_active')


@admin.register(RamadanPackage)
class RamadanPackageAdmin(UploadsAdmin):
    list_display = ('preview', 'name_en', 'name_ar', 'time_en', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_display_links = ('preview', 'name_en')
    readonly_fields = ('preview_large',)
    fields = ('name_en', 'name_ar', 'time_en', 'time_ar', 'text_en', 'text_ar', 'preview_large', 'image', 'order', 'is_active')

    @admin.display(description='Photo')
    def preview(self, obj):
        return thumb(admin_url(obj.image, obj.image_builtin))

    @admin.display(description='Current photo')
    def preview_large(self, obj):
        return thumb(admin_url(obj.image, obj.image_builtin), 160, 280) if obj.pk else '—'


class BranchInline(admin.StackedInline):
    model = Branch
    extra = 0
    fields = (('name_en', 'name_ar'), ('hours_en', 'hours_ar'), ('phone', 'order'), 'maps_url')


@admin.register(Brand)
class BrandAdmin(UploadsAdmin):
    list_display = ('preview', 'name', 'handle', 'branch_count', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_display_links = ('preview', 'name')
    readonly_fields = ('preview_large',)
    fields = ('name', 'preview_large', 'logo', 'instagram', 'handle', 'hotline', 'order', 'is_active')
    inlines = (BranchInline,)

    @admin.display(description='Logo')
    def preview(self, obj):
        return thumb(admin_url(obj.logo, obj.logo_builtin), 48, 48)

    @admin.display(description='Current logo')
    def preview_large(self, obj):
        return thumb(admin_url(obj.logo, obj.logo_builtin), 96, 96) if obj.pk else '—'

    @admin.display(description='Branches')
    def branch_count(self, obj):
        return obj.branches.count()
