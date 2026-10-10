import json
from datetime import timedelta

from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone

from .models import Booking


def payload(**over):
    data = {
        'event_type': 'wedding',
        'event_date': (timezone.localdate() + timedelta(days=30)).isoformat(),
        'start_time': '19:30',
        'guests': 250,
        'service_style': 'buffet',
        'cuisines': ['arabic', 'lebanese'],
        'budget': '20-35',
        'venue_type': 'hall',
        'governorate': 'hawalli',
        'area': 'Salmiya',
        'address': 'Hall 3',
        'extras': ['waiters', 'setup'],
        'full_name': 'Test Customer',
        'phone': '+96555512345',
        'email': 'test@example.com',
        'company': '',
        'contact_method': 'whatsapp',
        'notes': 'No nuts please',
        'consent': True,
        'language': 'ar',
        'website': '',
    }
    data.update(over)
    return data


class BookingApiTests(TestCase):
    def setUp(self):
        cache.clear()

    def post(self, data):
        return self.client.post('/api/bookings/', data=json.dumps(data), content_type='application/json')

    def test_valid_booking_is_saved(self):
        r = self.post(payload())
        self.assertEqual(r.status_code, 201, r.content)
        ref = r.json()['reference']
        b = Booking.objects.get(reference=ref)
        self.assertEqual(b.guests, 250)
        self.assertEqual(b.cuisines, ['arabic', 'lebanese'])
        self.assertEqual(b.status, 'new')
        self.assertRegex(ref, r'^GH-\d{6}-[A-Z2-9]{4}$')

    def test_optional_fields_can_be_empty(self):
        r = self.post(payload(start_time=None, budget='', address='', extras=[], email='', notes=''))
        self.assertEqual(r.status_code, 201, r.content)

    def test_rejects_past_date_bad_phone_and_no_cuisine(self):
        r = self.post(payload(event_date=timezone.localdate().isoformat(), phone='+96512345678', cuisines=[]))
        self.assertEqual(r.status_code, 400)
        errs = r.json()['errors']
        self.assertIn('event_date', errs)
        self.assertIn('phone', errs)
        self.assertIn('cuisines', errs)
        self.assertEqual(Booking.objects.count(), 0)

    def test_rejects_unknown_option(self):
        r = self.post(payload(cuisines=['italian']))
        self.assertEqual(r.status_code, 400)

    def test_requires_consent(self):
        r = self.post(payload(consent=False))
        self.assertEqual(r.status_code, 400)
        self.assertIn('consent', r.json()['errors'])

    def test_email_required_when_contact_by_email(self):
        r = self.post(payload(contact_method='email', email=''))
        self.assertEqual(r.status_code, 400)
        self.assertIn('email', r.json()['errors'])

    def test_honeypot_saves_nothing(self):
        r = self.post(payload(website='http://spam'))
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Booking.objects.count(), 0)

    def test_rate_limit(self):
        for _ in range(6):
            self.assertEqual(self.post(payload()).status_code, 201)
        self.assertEqual(self.post(payload()).status_code, 429)

    def test_bad_json(self):
        r = self.client.post('/api/bookings/', data='not json', content_type='application/json')
        self.assertEqual(r.status_code, 400)

    def test_get_not_allowed(self):
        self.assertEqual(self.client.get('/api/bookings/').status_code, 405)

    def test_admin_export_csv(self):
        from django.contrib.auth.models import User
        User.objects.create_superuser('admin', 'a@a.com', 'pass12345')
        self.client.login(username='admin', password='pass12345')
        self.post(payload())
        ids = list(Booking.objects.values_list('id', flat=True))
        r = self.client.post('/admin/bookings/booking/', {'action': 'export_csv', '_selected_action': ids})
        self.assertEqual(r.status_code, 200)
        self.assertIn('Test Customer', r.content.decode('utf-8'))
        self.assertEqual(self.client.get('/admin/bookings/booking/').status_code, 200)
        self.assertEqual(self.client.get(f'/admin/bookings/booking/{ids[0]}/change/').status_code, 200)


class AdminLoginTests(TestCase):
    def setUp(self):
        from django.contrib.auth.models import User
        User.objects.create_superuser('yassi', 'owner@example.com', 'Pass-12345')

    def test_login_with_username(self):
        self.assertTrue(self.client.login(username='yassi', password='Pass-12345'))

    def test_login_with_email_any_case(self):
        self.assertTrue(self.client.login(username='Owner@Example.com', password='Pass-12345'))

    def test_wrong_password_fails(self):
        self.assertFalse(self.client.login(username='owner@example.com', password='nope'))

    def test_admin_form_accepts_email(self):
        r = self.client.post('/admin/login/?next=/admin/', {'username': 'owner@example.com', 'password': 'Pass-12345'})
        self.assertEqual(r.status_code, 302)
        self.assertEqual(self.client.get('/admin/').status_code, 200)
