"""Everything the website shows that is editable in the admin, as one JSON-ready dict."""
from urllib.parse import quote_plus

from .models import (
    Brand, Cuisine, EventType, RamadanPackage, Reel, Service, SiteSettings, SiteText, SocialLink, file_url,
)


def _bi(en, ar):
    return {'en': en, 'ar': ar}


def _maps(brand, branch):
    if branch.maps_url:
        return branch.maps_url
    return f'https://www.google.com/maps/search/?api=1&query={quote_plus(f"{brand.name} {branch.name_en}, Kuwait")}'


def site_content():
    s = SiteSettings.load()
    return {
        'texts': {t.key: _bi(t.en, t.ar) for t in SiteText.objects.all()},
        'contact': {'phone': s.phone, 'whatsapp': s.whatsapp, 'email': s.email},
        'logo': file_url(s.logo, s.LOGO_BUILTIN),
        'about': {
            'main': {'src': file_url(s.about_image, s.ABOUT_BUILTIN), 'alt': _bi(s.about_image_alt_en, s.about_image_alt_ar)},
            'small': {'src': file_url(s.about_image_small, s.ABOUT_SMALL_BUILTIN), 'alt': _bi(s.about_image_small_alt_en, s.about_image_small_alt_ar)},
        },
        'socials': [
            {'platform': x.platform, 'url': x.url, 'handle': x.handle}
            for x in SocialLink.objects.filter(is_active=True)
        ],
        'reels': [
            {'id': str(r.pk), 'src': r.video_url, 'poster': r.poster_url, 'label': _bi(r.label_en, r.label_ar), 'heroSlot': r.hero_slot}
            for r in Reel.objects.filter(is_active=True)
        ],
        'cuisines': [
            {
                'id': c.slug, 'name': _bi(c.name_en, c.name_ar), 'tagline': _bi(c.tagline_en, c.tagline_ar),
                'image': file_url(c.image, c.image_builtin),
                'dishes': [_bi(d.name_en, d.name_ar) for d in c.dishes.all()],
            }
            for c in Cuisine.objects.filter(is_active=True).prefetch_related('dishes')
        ],
        'services': [
            {'id': x.slug, 'icon': x.icon, 'name': _bi(x.name_en, x.name_ar), 'text': _bi(x.text_en, x.text_ar), 'image': file_url(x.image, x.image_builtin)}
            for x in Service.objects.filter(is_active=True)
        ],
        'events': [
            {'id': x.slug, 'icon': x.icon, 'name': _bi(x.name_en, x.name_ar), 'text': _bi(x.text_en, x.text_ar)}
            for x in EventType.objects.filter(is_active=True)
        ],
        'ramadan': [
            {'id': str(x.pk), 'name': _bi(x.name_en, x.name_ar), 'time': _bi(x.time_en, x.time_ar), 'text': _bi(x.text_en, x.text_ar), 'image': file_url(x.image, x.image_builtin)}
            for x in RamadanPackage.objects.filter(is_active=True)
        ],
        'brands': [
            {
                'id': str(b.pk), 'name': b.name, 'logo': file_url(b.logo, b.logo_builtin),
                'instagram': b.instagram, 'handle': b.handle, 'hotline': b.hotline_list,
                'branches': [
                    {
                        'name': _bi(br.name_en, br.name_ar),
                        'hours': _bi(br.hours_en, br.hours_ar) if (br.hours_en or br.hours_ar) else '',
                        'phone': br.phone,
                        'maps': _maps(b, br),
                    }
                    for br in b.branches.all()
                ],
            }
            for b in Brand.objects.filter(is_active=True).prefetch_related('branches')
        ],
    }
