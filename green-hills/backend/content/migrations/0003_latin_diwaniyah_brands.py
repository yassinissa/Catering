"""
Adds the Latin American cuisine, the Diwaniyah event and the Sando, Beit Ladan and Estepona restaurants
to a database that was already seeded. Nothing that was edited in the admin is overwritten.
"""
from django.db import migrations
from django.db.models import F

LATIN = {
    'slug': 'latin', 'name_en': 'Latin American', 'name_ar': 'أمريكا اللاتينية',
    'tagline_en': 'Smoky chipotle, bright lime and corn straight off the grill.',
    'tagline_ar': 'شيبوتلي مدخّن، ليمون منعش وذرة مشوية على النار.',
    'image_builtin': 'img/skewer.jpg',
}
LATIN_DISHES = [
    ('Beef tacos with pico de gallo', 'تاكو لحم مع بيكو دي غايو'),
    ('Chicken empanadas', 'إمباناداس بالدجاج'),
    ('Sea bass ceviche', 'سيفيتشي سمك القاروص'),
    ('Grilled corn with lime & cheese', 'ذرة مشوية بالليمون والجبن'),
    ('Churros with dulce de leche', 'تشوروز مع دولسي دي ليتشي'),
]

DIWANIYAH = {
    'slug': 'diwaniyah', 'icon': 'sofa', 'name_en': 'Diwaniyah', 'name_ar': 'ديوانية',
    'text_en': 'Weekly nights, gahwa and late dinners.', 'text_ar': 'ليالي الديوانية، القهوة والعشاء المتأخر.',
}
# "Family gatherings" used to mention diwaniyas
GATHERING_TEXT = (
    ('Diwaniyas, reunions, weekend lunches.', 'دواوين، لقاءات عائلية، وغداء نهاية الأسبوع.'),
    ('Reunions, weekend lunches, family occasions.', 'لقاءات عائلية، غداء نهاية الأسبوع ومناسبات العائلة.'),
)

BRANDS = [
    {
        'name': 'Sando', 'instagram': 'https://www.instagram.com/sandokwt/', 'handle': '@sandokwt', 'hotline': '',
        'branches': [('Kuwait', 'الكويت', '7 AM – 11 PM', '٧ صباحًا – ١١ مساءً', '50509445')],
    },
    {
        'name': 'Beit Ladan', 'instagram': 'https://www.instagram.com/beit_ladan/', 'handle': '@beit_ladan',
        'hotline': '25356338, 25318411, 25318422',
        'branches': [('Jabriya – Block 3A, Street 2', 'الجابرية – قطعة 3أ، شارع 2', '11 AM – 10 PM', '١١ صباحًا – ١٠ مساءً', '')],
    },
    {
        'name': 'Estepona', 'instagram': 'https://www.instagram.com/estepona_kw/', 'handle': '@estepona_kw', 'hotline': '',
        'branches': [('Jabriya – Block 3A, Street 5', 'الجابرية – قطعة 3أ، شارع 5', '', '', '25315505')],
    },
]

# five → six cuisines: (key, old en, old ar, new en, new ar)
TEXTS = [
    ('hero.title1', 'Five kitchens.', 'خمسة مطابخ.', 'Six kitchens.', 'ستة مطابخ.'),
    (
        'about.p1',
        'Green Hills started with one idea: a host should not have to choose between the food their family grew up with and the food their guests travel for. So we built one team that cooks five cuisines properly, each with its own chefs, its own spices and its own fire.',
        'بدأت جرين هيلز بفكرة واحدة: المضيف لا يجب أن يختار بين الأكل الذي تربّى عليه وبين الأكل الذي يسافر ضيوفه من أجله. لذلك بنينا فريقًا واحدًا يطبخ خمسة مطابخ كما يجب، لكل مطبخ طهاته وبهاراته وناره.',
        'Green Hills started with one idea: a host should not have to choose between the food their family grew up with and the food their guests travel for. So we built one team that cooks six cuisines properly, each with its own chefs, its own spices and its own fire.',
        'بدأت جرين هيلز بفكرة واحدة: المضيف لا يجب أن يختار بين الأكل الذي تربّى عليه وبين الأكل الذي يسافر ضيوفه من أجله. لذلك بنينا فريقًا واحدًا يطبخ ستة مطابخ كما يجب، لكل مطبخ طهاته وبهاراته وناره.',
    ),
    ('cuisines.title', 'Choose a kitchen, *or mix all five.*', 'اختر مطبخًا، *أو امزج الخمسة.*', 'Choose a kitchen, *or mix all six.*', 'اختر مطبخًا، *أو امزج الستة.*'),
]


def _next_order(model):
    last = model.objects.order_by('-order').first()
    return last.order + 1 if last else 0


def forwards(apps, schema_editor):
    Cuisine = apps.get_model('content', 'Cuisine')
    Dish = apps.get_model('content', 'Dish')
    EventType = apps.get_model('content', 'EventType')
    Brand = apps.get_model('content', 'Brand')
    Branch = apps.get_model('content', 'Branch')
    SiteText = apps.get_model('content', 'SiteText')

    if not Cuisine.objects.filter(slug=LATIN['slug']).exists():
        cuisine = Cuisine.objects.create(order=_next_order(Cuisine), **LATIN)
        for i, (en, ar) in enumerate(LATIN_DISHES):
            Dish.objects.create(cuisine=cuisine, order=i, name_en=en, name_ar=ar)

    if not EventType.objects.filter(slug=DIWANIYAH['slug']).exists():
        gathering = EventType.objects.filter(slug='gathering').first()
        if gathering:  # right after "Family gatherings"
            EventType.objects.filter(order__gt=gathering.order).update(order=F('order') + 1)
            order = gathering.order + 1
        else:
            order = _next_order(EventType)
        EventType.objects.create(order=order, **DIWANIYAH)
    (old_en, old_ar), (new_en, new_ar) = GATHERING_TEXT
    EventType.objects.filter(slug='gathering', text_en=old_en).update(text_en=new_en)
    EventType.objects.filter(slug='gathering', text_ar=old_ar).update(text_ar=new_ar)

    for b in BRANDS:
        if Brand.objects.filter(name__iexact=b['name']).exists():
            continue
        brand = Brand.objects.create(
            order=_next_order(Brand), name=b['name'], instagram=b['instagram'], handle=b['handle'], hotline=b['hotline'],
        )
        for j, (name_en, name_ar, hours_en, hours_ar, phone) in enumerate(b['branches']):
            Branch.objects.create(
                brand=brand, order=j, name_en=name_en, name_ar=name_ar, hours_en=hours_en, hours_ar=hours_ar, phone=phone,
            )

    for key, old_en, old_ar, new_en, new_ar in TEXTS:
        SiteText.objects.filter(key=key, en=old_en).update(en=new_en)
        SiteText.objects.filter(key=key, ar=old_ar).update(ar=new_ar)
        SiteText.objects.filter(key=key).update(default_en=new_en, default_ar=new_ar)


class Migration(migrations.Migration):
    dependencies = [('content', '0002_seed_content')]
    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
