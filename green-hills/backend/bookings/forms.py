import re
from datetime import timedelta

from django import forms
from django.utils import timezone

from . import choices as C
from .models import Booking

PHONE_RE = re.compile(r'^\+965[24569]\d{7}$')


class MultiChoiceListField(forms.Field):
    """Accepts a JSON list of ids and checks each against allowed choices."""

    def __init__(self, *, allowed, min_items=0, **kwargs):
        self.allowed = {k for k, _ in allowed}
        self.min_items = min_items
        super().__init__(**kwargs)

    def to_python(self, value):
        if value in (None, ''):
            return []
        if not isinstance(value, (list, tuple)):
            raise forms.ValidationError('Expected a list.')
        out = []
        for v in value:
            if v not in self.allowed:
                raise forms.ValidationError(f'Unknown option: {v}')
            if v not in out:
                out.append(v)
        return out

    def validate(self, value):
        if len(value) < self.min_items:
            raise forms.ValidationError('Choose at least one.')


class BookingForm(forms.ModelForm):
    cuisines = MultiChoiceListField(allowed=C.CUISINES, min_items=1)
    extras = MultiChoiceListField(allowed=C.EXTRAS, required=False)
    consent = forms.BooleanField(required=True)

    class Meta:
        model = Booking
        fields = [
            'event_type', 'event_date', 'start_time', 'guests', 'service_style', 'cuisines', 'budget',
            'venue_type', 'governorate', 'area', 'address', 'extras',
            'full_name', 'phone', 'email', 'company', 'contact_method', 'notes', 'language',
        ]

    def clean_event_date(self):
        d = self.cleaned_data['event_date']
        if d <= timezone.localdate():
            raise forms.ValidationError('Choose a date from tomorrow onwards.')
        if d > timezone.localdate() + timedelta(days=730):
            raise forms.ValidationError('Choose a date within the next two years.')
        return d

    def clean_guests(self):
        g = self.cleaned_data['guests']
        if not 10 <= g <= 5000:
            raise forms.ValidationError('Guests must be between 10 and 5000.')
        return g

    def clean_phone(self):
        p = re.sub(r'[\s-]', '', self.cleaned_data['phone'])
        if not PHONE_RE.match(p):
            raise forms.ValidationError('Enter a valid Kuwaiti number.')
        return p

    def clean_full_name(self):
        n = self.cleaned_data['full_name'].strip()
        if len(n) < 2:
            raise forms.ValidationError('Enter your name.')
        return n

    def clean(self):
        data = super().clean()
        if data.get('contact_method') == 'email' and not data.get('email'):
            self.add_error('email', 'Email is required when you choose email as the contact method.')
        return data
