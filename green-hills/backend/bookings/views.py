import json
import logging

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.http import HttpResponse, JsonResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from . import choices as C
from .forms import BookingForm

log = logging.getLogger('bookings')


def _client_ip(request):
    fwd = request.META.get('HTTP_X_FORWARDED_FOR', '')
    return (fwd.split(',')[0].strip() if fwd else request.META.get('REMOTE_ADDR')) or None


def _rate_limited(ip):
    key = f'booking-rate:{ip}'
    count = cache.get(key, 0)
    if count >= settings.BOOKING_RATE_LIMIT:
        return True
    cache.set(key, count + 1, settings.BOOKING_RATE_WINDOW)
    return False


def _notify(booking):
    if not settings.BOOKING_NOTIFY_EMAILS:
        return
    lines = [
        f'Reference: {booking.reference}',
        f'Event: {C.label(C.EVENT_TYPES, booking.event_type)} on {booking.event_date:%A %d %B %Y}'
        + (f' at {booking.start_time:%H:%M}' if booking.start_time else ''),
        f'Guests: {booking.guests}',
        f'Service: {C.label(C.SERVICE_STYLES, booking.service_style)}',
        f'Cuisines: {booking.cuisines_display}',
        f'Budget: {C.label(C.BUDGETS, booking.budget)}',
        f'Venue: {C.label(C.VENUES, booking.venue_type)}, {booking.area}, {C.label(C.GOVERNORATES, booking.governorate)}',
        f'Address: {booking.address or "—"}',
        f'Also needed: {booking.extras_display}',
        '',
        f'Name: {booking.full_name}',
        f'Phone: {booking.phone}',
        f'Email: {booking.email or "—"}',
        f'Company: {booking.company or "—"}',
        f'Contact by: {C.label(C.CONTACT_METHODS, booking.contact_method)}',
        f'Notes: {booking.notes or "—"}',
    ]
    try:
        send_mail(
            subject=f'New booking {booking.reference} · {C.label(C.EVENT_TYPES, booking.event_type)} · {booking.guests} guests',
            message='\n'.join(lines),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=settings.BOOKING_NOTIFY_EMAILS,
            fail_silently=False,
        )
    except Exception:  # never lose a booking because email failed
        log.exception('Booking %s saved but notification email failed', booking.reference)


@csrf_exempt  # public JSON endpoint; protected by validation, honeypot and rate limit
@require_POST
def create_booking(request):
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({'detail': 'Invalid JSON.'}, status=400)
    if not isinstance(payload, dict):
        return JsonResponse({'detail': 'Invalid payload.'}, status=400)

    ip = _client_ip(request)

    # Honeypot: bots fill hidden fields. Pretend success, save nothing.
    if payload.get('website'):
        log.info('Honeypot triggered from %s', ip)
        return JsonResponse({'reference': 'GH-000000-0000'}, status=201)

    if _rate_limited(ip):
        return JsonResponse({'detail': 'Too many requests. Please try again later.'}, status=429)

    form = BookingForm(payload)
    if not form.is_valid():
        return JsonResponse({'detail': 'Please correct the highlighted fields.', 'errors': form.errors}, status=400)

    booking = form.save(commit=False)
    booking.ip_address = ip
    booking.save()
    log.info('New booking %s (%s, %s guests)', booking.reference, booking.event_type, booking.guests)
    _notify(booking)
    return JsonResponse({'reference': booking.reference}, status=201)


@require_GET
def health(request):
    return JsonResponse({'ok': True})


@never_cache
def frontend(request):
    """Serves the built React app (frontend/dist/index.html)."""
    index = settings.FRONTEND_DIST / 'index.html'
    if not index.exists():
        return HttpResponse(
            '<div style="font-family:system-ui;max-width:560px;margin:60px auto;padding:0 20px;line-height:1.6">'
            '<h1 style="font-size:22px">Green Hills backend is running</h1>'
            '<p><b>Bookings admin:</b> <a href="/admin/">/admin/</a></p>'
            '<p><b>Website while developing:</b> run <code>npm run dev</code> in the <code>frontend</code> folder '
            'and open <a href="http://localhost:5180">http://localhost:5180</a>.</p>'
            '<p style="color:#666">To serve the website from this address instead, run <code>npm run build</code> '
            'in the <code>frontend</code> folder and reload.</p></div>',
            status=200,
        )
    return HttpResponse(index.read_text(encoding='utf-8'))
