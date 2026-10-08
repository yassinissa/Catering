import csv

from django.contrib import admin, messages
from django.http import HttpResponse
from django.utils.html import format_html

from . import choices as C
from .models import Booking

admin.site.site_header = 'Green Hills · Bookings'
admin.site.site_title = 'Green Hills admin'
admin.site.index_title = 'Event booking requests'


STATUS_COLORS = {
    'new': '#2e6b33',
    'contacted': '#1f6fb2',
    'quoted': '#8a5a00',
    'confirmed': '#0f7a5a',
    'completed': '#555',
    'cancelled': '#b23b2a',
}


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'reference', 'status_badge', 'full_name', 'phone_link', 'event_type', 'event_date', 'guests',
        'service_style', 'governorate', 'created_at',
    )
    list_display_links = ('reference', 'full_name')
    list_filter = ('status', 'event_type', 'service_style', 'governorate', 'venue_type', 'event_date', 'created_at')
    search_fields = ('reference', 'full_name', 'phone', 'email', 'company', 'area')
    date_hierarchy = 'event_date'
    list_per_page = 50
    readonly_fields = ('reference', 'created_at', 'updated_at', 'ip_address', 'language', 'cuisines_display', 'extras_display', 'whatsapp_link')
    actions = ('mark_contacted', 'mark_quoted', 'mark_confirmed', 'mark_completed', 'mark_cancelled', 'export_csv')
    fieldsets = (
        ('Status', {'fields': ('reference', 'status', 'internal_notes')}),
        ('Event', {'fields': ('event_type', 'event_date', 'start_time', 'guests', 'service_style', 'cuisines', 'cuisines_display', 'budget')}),
        ('Venue', {'fields': ('venue_type', 'governorate', 'area', 'address', 'extras', 'extras_display')}),
        ('Customer', {'fields': ('full_name', 'phone', 'whatsapp_link', 'email', 'company', 'contact_method', 'notes', 'language')}),
        ('System', {'classes': ('collapse',), 'fields': ('created_at', 'updated_at', 'ip_address')}),
    )

    @admin.display(description='Status', ordering='status')
    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, '#555')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:999px;font-weight:600;font-size:11px">{}</span>',
            color, obj.get_status_display(),
        )

    @admin.display(description='Phone', ordering='phone')
    def phone_link(self, obj):
        return format_html('<a href="tel:{}">{}</a>', obj.phone, obj.phone)

    @admin.display(description='WhatsApp')
    def whatsapp_link(self, obj):
        digits = ''.join(ch for ch in obj.phone if ch.isdigit())
        if not digits:
            return '—'
        return format_html('<a href="https://wa.me/{}" target="_blank" rel="noopener">Open chat with {}</a>', digits, obj.phone)

    @admin.display(description='Cuisines (readable)')
    def cuisines_display(self, obj):
        return obj.cuisines_display

    @admin.display(description='Also needed (readable)')
    def extras_display(self, obj):
        return obj.extras_display

    def _set_status(self, request, queryset, status):
        n = queryset.update(status=status)
        self.message_user(request, f'{n} booking(s) marked as {C.label(C.STATUSES, status)}.', messages.SUCCESS)

    @admin.action(description='Mark as contacted')
    def mark_contacted(self, request, qs): self._set_status(request, qs, 'contacted')

    @admin.action(description='Mark as quote sent')
    def mark_quoted(self, request, qs): self._set_status(request, qs, 'quoted')

    @admin.action(description='Mark as confirmed')
    def mark_confirmed(self, request, qs): self._set_status(request, qs, 'confirmed')

    @admin.action(description='Mark as completed')
    def mark_completed(self, request, qs): self._set_status(request, qs, 'completed')

    @admin.action(description='Mark as cancelled')
    def mark_cancelled(self, request, qs): self._set_status(request, qs, 'cancelled')

    @admin.action(description='Export selected to Excel (CSV)')
    def export_csv(self, request, queryset):
        resp = HttpResponse(content_type='text/csv; charset=utf-8')
        resp['Content-Disposition'] = 'attachment; filename="green-hills-bookings.csv"'
        resp.write('﻿')  # BOM so Excel opens Arabic text correctly
        w = csv.writer(resp)
        w.writerow([
            'Reference', 'Status', 'Created', 'Event type', 'Event date', 'Start time', 'Guests', 'Service', 'Cuisines',
            'Budget', 'Venue', 'Governorate', 'Area', 'Address', 'Also needed', 'Name', 'Phone', 'Email', 'Company',
            'Contact by', 'Notes', 'Team notes',
        ])
        for b in queryset:
            w.writerow([
                b.reference, b.get_status_display(), b.created_at.strftime('%Y-%m-%d %H:%M'), b.get_event_type_display(),
                b.event_date, b.start_time or '', b.guests, b.get_service_style_display(), b.cuisines_display,
                b.get_budget_display(), b.get_venue_type_display(), b.get_governorate_display(), b.area, b.address,
                b.extras_display, b.full_name, b.phone, b.email, b.company, b.get_contact_method_display(), b.notes,
                b.internal_notes,
            ])
        return resp
