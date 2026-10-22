"""
Fills the content tables with what the website showed before the admin could edit it
(exported from frontend/src/content/site.js and strings.js into seed/*.json). Runs once, from a migration.
"""
import json
from pathlib import Path

SEED_DIR = Path(__file__).resolve().parent / 'seed'
HERO_SLOTS = {'r2': 1, 'r3': 2, 'r6': 3}  # the three videos the top banner showed


def _load(name):
    return json.loads((SEED_DIR / name).read_text(encoding='utf-8'))


def _bi(value):
    """{en, ar} or '' → (en, ar)"""
    return (value.get('en', ''), value.get('ar', '')) if isinstance(value, dict) else ('', '')


def seed_texts(get_model):
    SiteText = get_model('content', 'SiteText')
    for position, (key, value) in enumerate(_load('texts.json').items()):
        en, ar = value.get('en', ''), value.get('ar', '')
        # texts already edited in the admin are never overwritten, only their "original" copy is refreshed
        SiteText.objects.update_or_create(
            key=key,
            defaults={'section': key.split('.')[0], 'position': position, 'default_en': en, 'default_ar': ar},
            create_defaults={
                'section': key.split('.')[0], 'position': position, 'en': en, 'ar': ar, 'default_en': en, 'default_ar': ar,
            },
        )


def seed_lists(get_model):
    data = _load('site.json')
    Reel = get_model('content', 'Reel')
    Cuisine = get_model('content', 'Cuisine')
    Dish = get_model('content', 'Dish')
    Service = get_model('content', 'Service')
    EventType = get_model('content', 'EventType')
    RamadanPackage = get_model('content', 'RamadanPackage')
    Brand = get_model('content', 'Brand')
    Branch = get_model('content', 'Branch')

    if not Reel.objects.exists():
        for i, r in enumerate(data['reels']):
            en, ar = _bi(r['label'])
            Reel.objects.create(
                order=i, label_en=en, label_ar=ar, video_builtin=r['src'], poster_builtin=r['poster'],
                hero_slot=HERO_SLOTS.get(r['id'], 0),
            )

    if not Cuisine.objects.exists():
        for i, c in enumerate(data['cuisines']):
            cuisine = Cuisine.objects.create(
                order=i, slug=c['id'], name_en=c['name']['en'], name_ar=c['name']['ar'],
                tagline_en=c['tagline']['en'], tagline_ar=c['tagline']['ar'], image_builtin=c['image'],
            )
            for j, d in enumerate(c['dishes']):
                Dish.objects.create(cuisine=cuisine, order=j, name_en=d['en'], name_ar=d['ar'])

    if not Service.objects.exists():
        for i, s in enumerate(data['services']):
            Service.objects.create(
                order=i, slug=s['id'], icon=s['icon'], name_en=s['name']['en'], name_ar=s['name']['ar'],
                text_en=s['text']['en'], text_ar=s['text']['ar'], image_builtin=s['image'],
            )

    if not EventType.objects.exists():
        for i, e in enumerate(data['events']):
            EventType.objects.create(
                order=i, slug=e['id'], icon=e['icon'], name_en=e['name']['en'], name_ar=e['name']['ar'],
                text_en=e['text']['en'], text_ar=e['text']['ar'],
            )

    if not RamadanPackage.objects.exists():
        for i, p in enumerate(data['ramadan']):
            RamadanPackage.objects.create(
                order=i, name_en=p['name']['en'], name_ar=p['name']['ar'], time_en=p['time']['en'], time_ar=p['time']['ar'],
                text_en=p['text']['en'], text_ar=p['text']['ar'], image_builtin=p['image'],
            )

    if not Brand.objects.exists():
        for i, b in enumerate(data['brands']):
            brand = Brand.objects.create(
                order=i, name=b['name'], logo_builtin=b['logo'], instagram=b.get('instagram', ''),
                handle=b.get('handle', ''), hotline=', '.join(b.get('hotline', [])),
            )
            for j, br in enumerate(b['branches']):
                hours_en, hours_ar = _bi(br.get('hours'))
                Branch.objects.create(
                    brand=brand, order=j, name_en=br['name']['en'], name_ar=br['name']['ar'],
                    hours_en=hours_en, hours_ar=hours_ar, phone=br.get('phone', ''), maps_url=br.get('maps', ''),
                )

    get_model('content', 'SiteSettings').objects.get_or_create(pk=1)
