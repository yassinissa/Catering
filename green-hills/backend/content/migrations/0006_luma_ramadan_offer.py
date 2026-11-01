"""
Adds the Luma Ramadan delivery offer (cakes, iced drinks and the section's texts).
Only customer-facing names and selling prices: the costs and margins of the pricing deck stay out of the website.
"""
from decimal import Decimal

from django.db import migrations
from django.db.models import F

CAKES = [
    ('Decadent Chocolate Cake', 'كيكة الشوكولاتة الفاخرة', '18.000', 'cake-chocolate'),
    ('Cheese Cake', 'تشيز كيك', '22.000', 'cake-cheese'),
    ('Tiramisu Cake', 'كيكة تيراميسو', '17.000', 'cake-tiramisu'),
    ('Ecuador Cake', 'كيكة الإكوادور', '19.000', 'cake-ecuador'),
]
DRINKS = [
    ('Blue Lagoon Mojito', 'موهيتو بلو لاجون', '1.500', 'drink-blue-lagoon-mojito'),
    ('Passion Fruit Mojito', 'موهيتو باشن فروت', '1.750', 'drink-passion-fruit-mojito'),
    ('Mix Berries Mojito', 'موهيتو ميكس بيريز', '1.750', 'drink-mix-berries-mojito'),
    ('Classic Mojito', 'موهيتو كلاسيك', '1.500', 'drink-classic-mojito'),
    ('Ice Americano', 'آيس أمريكانو', '1.250', 'drink-ice-americano'),
    ('Ice Latte', 'آيس لاتيه', '1.500', 'drink-ice-latte'),
    ('Ice Coconut Latte', 'آيس لاتيه جوز الهند', '2.000', 'drink-ice-coconut-latte'),
    ('Mix Berries Latte', 'ميكس بيريز لاتيه', '2.000', 'drink-mix-berries-latte'),
]

# Same order and wording as STRINGS.offer in frontend/src/content/strings.js
TEXTS = [
    ('offer.eyebrow', 'Luma · Ramadan delivery offer', 'لوما · عرض توصيل رمضان'),
    ('offer.title', 'Whole cakes and iced drinks, *delivered for Ramadan.*', 'كيك كامل ومشروبات مثلّجة، *نوصلها لك في رمضان.*'),
    ('offer.lead', "Four whole cakes in Luma's signature gift box and eight iced drinks, made to share at your Ramadan table.", 'أربع كيكات كاملة في علبة هدايا لوما المميزة وثمانية مشروبات مثلّجة، لتشاركها على مائدتك الرمضانية.'),
    ('offer.openLabel', 'Pre-orders open', 'بدء الطلب المسبق'),
    ('offer.open', '2nd week of January', 'الأسبوع الثاني من يناير'),
    ('offer.launchLabel', 'Launch', 'الانطلاق'),
    ('offer.launch', '2nd week of February', 'الأسبوع الثاني من فبراير'),
    ('offer.cta', 'Message Luma on Instagram', 'راسل لوما على إنستغرام'),
    ('offer.cakesTitle', 'The whole cake collection', 'مجموعة الكيك الكامل'),
    ('offer.cakeTag', 'Whole round cake · Luma gift box', 'كيكة دائرية كاملة · علبة هدايا لوما'),
    ('offer.drinksTitle', 'Iced drinks', 'المشروبات المثلّجة'),
]


def forwards(apps, schema_editor):
    OfferItem = apps.get_model('content', 'OfferItem')
    SiteText = apps.get_model('content', 'SiteText')

    if not OfferItem.objects.exists():
        for category, items in (('cake', CAKES), ('drink', DRINKS)):
            for i, (en, ar, price, photo) in enumerate(items):
                OfferItem.objects.create(
                    category=category, order=i, name_en=en, name_ar=ar, price=Decimal(price), image_builtin=f'luma/{photo}.jpg',
                )

    # right after the Ramadan texts in the admin list
    last = SiteText.objects.filter(key='ramadan.cta').first()
    start = last.position + 1 if last else 0
    SiteText.objects.filter(position__gte=start).update(position=F('position') + len(TEXTS))
    for i, (key, en, ar) in enumerate(TEXTS):
        SiteText.objects.get_or_create(
            key=key,
            defaults={'section': 'offer', 'position': start + i, 'en': en, 'ar': ar, 'default_en': en, 'default_ar': ar},
        )


class Migration(migrations.Migration):
    dependencies = [('content', '0005_offer_item')]
    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
