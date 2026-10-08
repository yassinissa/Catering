import secrets

from django.db import models
from django.utils import timezone

from . import choices as C

_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  # no 0/O, 1/I


def new_reference():
    stamp = timezone.localdate().strftime('%y%m%d')
    return f"GH-{stamp}-{''.join(secrets.choice(_ALPHABET) for _ in range(4))}"


class Booking(models.Model):
    reference = models.CharField(max_length=20, unique=True, editable=False)
    status = models.CharField(max_length=12, choices=C.STATUSES, default='new', db_index=True)

    # Event
    event_type = models.CharField(max_length=20, choices=C.EVENT_TYPES)
    event_date = models.DateField(db_index=True)
    start_time = models.TimeField(null=True, blank=True)
    guests = models.PositiveIntegerField()
    service_style = models.CharField(max_length=20, choices=C.SERVICE_STYLES)
    cuisines = models.JSONField(default=list)
    budget = models.CharField(max_length=10, choices=C.BUDGETS, blank=True)

    # Venue
    venue_type = models.CharField(max_length=20, choices=C.VENUES)
    governorate = models.CharField(max_length=20, choices=C.GOVERNORATES)
    area = models.CharField(max_length=80)
    address = models.CharField(max_length=200, blank=True)
    extras = models.JSONField(default=list, blank=True)

    # Customer
    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    email = models.EmailField(max_length=160, blank=True)
    company = models.CharField('company / bank', max_length=120, blank=True)
    contact_method = models.CharField(max_length=10, choices=C.CONTACT_METHODS, default='whatsapp')
    notes = models.TextField(max_length=1500, blank=True)
    language = models.CharField(max_length=2, choices=C.LANGUAGES, default='en')

    # Internal
    internal_notes = models.TextField('team notes', blank=True, help_text='Only visible to staff.')
    ip_address = models.GenericIPAddressField(null=True, blank=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'booking request'
        verbose_name_plural = 'booking requests'

    def __str__(self):
        return f'{self.reference} · {self.full_name}'

    def save(self, *args, **kwargs):
        if not self.reference:
            for _ in range(10):
                ref = new_reference()
                if not Booking.objects.filter(reference=ref).exists():
                    self.reference = ref
                    break
        super().save(*args, **kwargs)

    @property
    def cuisines_display(self):
        return ', '.join(C.label(C.CUISINES, c) for c in self.cuisines) or '—'

    @property
    def extras_display(self):
        return ', '.join(C.label(C.EXTRAS, x) for x in self.extras) or '—'
