from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models
from django.templatetags.static import static
from django.utils.deconstruct import deconstructible

IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp']
VIDEO_TYPES = ['mp4', 'webm']


@deconstructible
class MaxFileSize:
    def __init__(self, mb):
        self.mb = mb

    def __call__(self, f):
        if f.size > self.mb * 1024 * 1024:
            raise ValidationError(f'This file is larger than {self.mb} MB. Please upload a smaller or compressed version.')

    def __eq__(self, other):
        return isinstance(other, MaxFileSize) and other.mb == self.mb


def image_field(folder, help_text='JPG, PNG or WebP, about 1400px wide, under 10 MB.', verbose_name='photo'):
    return models.FileField(
        verbose_name, upload_to=folder, max_length=255, blank=True, help_text=help_text,
        validators=[FileExtensionValidator(IMAGE_TYPES), MaxFileSize(10)],
    )


def builtin_field():
    """The original file shipped with the website (path under frontend/public/media/), used until a new one is uploaded."""
    return models.CharField(max_length=200, blank=True, editable=False)


def file_url(upload, builtin=''):
    """URL of the uploaded file, else the built-in path (the website turns it into a full address)."""
    return upload.url if upload else builtin


def admin_url(upload, builtin=''):
    """Like file_url, but always a full address (for previews in the admin)."""
    return upload.url if upload else (static(f'media/{builtin}') if builtin else '')


class Ordered(models.Model):
    order = models.PositiveIntegerField('position', default=0, help_text='Lower numbers show first.')
    is_active = models.BooleanField('show on website', default=True)

    class Meta:
        abstract = True
        ordering = ['order', 'id']


# ─── Contact, logo & photos ──────────────────────────────────────────────

class SiteSettings(models.Model):
    """One row only: contact details and the single photos that are not part of a list."""
    LOGO_BUILTIN = 'logo-light@3x.png'
    ABOUT_BUILTIN = 'img/pomegranate.jpg'
    ABOUT_SMALL_BUILTIN = 'img/croquettes.jpg'

    phone = models.CharField(max_length=30, blank=True, help_text="Green Hills' phone, e.g. +965 1234 5678. Empty = hidden.")
    whatsapp = models.CharField(max_length=20, blank=True, help_text='Digits only with country code, e.g. 96512345678. Empty = hidden.')
    email = models.EmailField(blank=True, help_text='Empty = hidden.')

    logo = models.FileField(
        upload_to='logo', max_length=255, blank=True,
        validators=[FileExtensionValidator(IMAGE_TYPES + ['svg']), MaxFileSize(5)],
        help_text='White logo on a transparent background (PNG or SVG). Shown on the dark header and footer.',
    )

    about_image = image_field('about', 'Large photo in the "Who we are" section. Tall photos work best.', 'large photo')
    about_image_alt_en = models.CharField(
        'large photo description (English)', max_length=160, default='Pomegranate jelly with pistachio and mint',
        help_text='Read aloud to blind visitors and used by Google. Update it when you change the photo.',
    )
    about_image_alt_ar = models.CharField('large photo description (Arabic)', max_length=160, default='جيلي الرمان بالفستق والنعناع')
    about_image_small = image_field('about', 'Small photo overlapping the large one.', 'small photo')
    about_image_small_alt_en = models.CharField('small photo description (English)', max_length=160, default='Crispy croquettes with dip')
    about_image_small_alt_ar = models.CharField('small photo description (Arabic)', max_length=160, default='كروكيت مقرمش مع صلصة')

    class Meta:
        verbose_name = 'contact, logo & photos'
        verbose_name_plural = 'contact, logo & photos'

    def __str__(self):
        return 'Contact, logo & photos'

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class SocialLink(Ordered):
    PLATFORMS = [
        ('instagram', 'Instagram'),
        ('tiktok', 'TikTok'),
        ('snapchat', 'Snapchat'),
        ('x', 'X (Twitter)'),
        ('facebook', 'Facebook'),
        ('youtube', 'YouTube'),
        ('linkedin', 'LinkedIn'),
        ('whatsapp', 'WhatsApp channel'),
        ('website', 'Other website'),
    ]
    platform = models.CharField(max_length=20, choices=PLATFORMS)
    url = models.URLField('link', max_length=300, help_text='Full address, e.g. https://www.instagram.com/greenhillskw')
    handle = models.CharField(max_length=80, blank=True, help_text='Shown next to the icon, e.g. @greenhillskw. Empty = the platform name.')

    class Meta(Ordered.Meta):
        verbose_name = 'social media link'

    def __str__(self):
        return f'{self.get_platform_display()} {self.handle}'.strip()


# ─── Page texts ──────────────────────────────────────────────────────────

class SiteText(models.Model):
    """One heading/paragraph of the website. Keys mirror frontend/src/content/strings.js."""
    SECTIONS = [
        ('nav', 'Menu bar'),
        ('hero', 'Top banner'),
        ('marquee', 'Moving words strip'),
        ('about', 'Who we are'),
        ('cuisines', 'Cuisines'),
        ('services', 'Services'),
        ('events', 'Events'),
        ('ramadan', 'Ramadan'),
        ('reels', 'Videos'),
        ('process', 'How booking works'),
        ('locations', 'Our restaurants'),
        ('book', 'Booking form'),
        ('footer', 'Footer'),
    ]
    key = models.CharField(max_length=80, unique=True)
    section = models.CharField(max_length=20, choices=SECTIONS, db_index=True)
    position = models.PositiveIntegerField(default=0)
    en = models.TextField('English', blank=True)
    ar = models.TextField('Arabic', blank=True)
    default_en = models.TextField(blank=True, editable=False)
    default_ar = models.TextField(blank=True, editable=False)

    class Meta:
        ordering = ['position']
        verbose_name = 'page text'

    def __str__(self):
        return self.key


# ─── Lists ───────────────────────────────────────────────────────────────

class Reel(Ordered):
    HERO_SLOTS = [
        (0, '—'),
        (1, 'Top banner · left'),
        (2, 'Top banner · middle (also the phone background)'),
        (3, 'Top banner · right'),
    ]
    label_en = models.CharField('caption (English)', max_length=80)
    label_ar = models.CharField('caption (Arabic)', max_length=80)
    video = models.FileField(
        upload_to='reels', max_length=255, blank=True,
        validators=[FileExtensionValidator(VIDEO_TYPES), MaxFileSize(60)],
        help_text='MP4, short and vertical (9:16), under 60 MB. Plays without sound on the page.',
    )
    video_builtin = builtin_field()
    poster = image_field('reels', 'Optional still image shown while the video loads.', 'cover image')
    poster_builtin = builtin_field()
    hero_slot = models.PositiveSmallIntegerField(
        'also show in top banner', choices=HERO_SLOTS, default=0,
        help_text='Choosing a spot takes it from the video that had it before.',
    )

    class Meta(Ordered.Meta):
        verbose_name = 'video'

    def __str__(self):
        return self.label_en

    def clean(self):
        if not self.video and not self.video_builtin:
            raise ValidationError({'video': 'Upload a video.'})

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.hero_slot:
            Reel.objects.filter(hero_slot=self.hero_slot).exclude(pk=self.pk).update(hero_slot=0)

    @property
    def video_url(self):
        return file_url(self.video, self.video_builtin)

    @property
    def poster_url(self):
        if self.poster:
            return self.poster.url
        if self.video:  # a new video must not keep the old video's cover
            frame = getattr(self.video.storage, 'video_poster_url', None)
            return frame(self.video.name) if frame else ''
        return self.poster_builtin


class Cuisine(Ordered):
    slug = models.SlugField(
        'id', max_length=30, unique=True,
        help_text="Short English id saved with bookings, e.g. 'indian'. It can't be changed later.",
    )
    name_en = models.CharField('name (English)', max_length=60)
    name_ar = models.CharField('name (Arabic)', max_length=60)
    tagline_en = models.CharField('tagline (English)', max_length=200)
    tagline_ar = models.CharField('tagline (Arabic)', max_length=200)
    image = image_field('cuisines')
    image_builtin = builtin_field()

    class Meta(Ordered.Meta):
        verbose_name = 'cuisine'

    def __str__(self):
        return self.name_en

    def clean(self):
        if not self.image and not self.image_builtin:
            raise ValidationError({'image': 'Upload a photo.'})


class Dish(models.Model):
    cuisine = models.ForeignKey(Cuisine, on_delete=models.CASCADE, related_name='dishes')
    name_en = models.CharField('dish (English)', max_length=100)
    name_ar = models.CharField('dish (Arabic)', max_length=100)
    order = models.PositiveIntegerField('position', default=0)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'dish'
        verbose_name_plural = 'sample menu'

    def __str__(self):
        return self.name_en


class Service(Ordered):
    """The service styles. A fixed set, because their ids are saved with bookings."""
    slug = models.SlugField('id', max_length=30, unique=True)
    icon = models.CharField(max_length=30)
    name_en = models.CharField('name (English)', max_length=60)
    name_ar = models.CharField('name (Arabic)', max_length=60)
    text_en = models.TextField('description (English)', max_length=300)
    text_ar = models.TextField('description (Arabic)', max_length=300)
    image = image_field('services')
    image_builtin = builtin_field()

    class Meta(Ordered.Meta):
        verbose_name = 'service style'

    def __str__(self):
        return self.name_en


class EventType(Ordered):
    """The event tiles. A fixed set, because their ids are saved with bookings."""
    slug = models.SlugField('id', max_length=30, unique=True)
    icon = models.CharField(max_length=30)
    name_en = models.CharField('name (English)', max_length=60)
    name_ar = models.CharField('name (Arabic)', max_length=60)
    text_en = models.CharField('description (English)', max_length=160)
    text_ar = models.CharField('description (Arabic)', max_length=160)

    class Meta(Ordered.Meta):
        verbose_name = 'event type'

    def __str__(self):
        return self.name_en


class RamadanPackage(Ordered):
    name_en = models.CharField('name (English)', max_length=60)
    name_ar = models.CharField('name (Arabic)', max_length=60)
    time_en = models.CharField('time (English)', max_length=60, blank=True, help_text='e.g. At sunset')
    time_ar = models.CharField('time (Arabic)', max_length=60, blank=True)
    text_en = models.TextField('description (English)', max_length=300)
    text_ar = models.TextField('description (Arabic)', max_length=300)
    image = image_field('ramadan')
    image_builtin = builtin_field()

    class Meta(Ordered.Meta):
        verbose_name = 'Ramadan package'

    def __str__(self):
        return self.name_en

    def clean(self):
        if not self.image and not self.image_builtin:
            raise ValidationError({'image': 'Upload a photo.'})


class Brand(Ordered):
    name = models.CharField(max_length=60)
    logo = image_field('brands', "Square logo, 300×300 px or larger. Until one is uploaded, the website shows the name's first letter.", 'logo')
    logo_builtin = builtin_field()
    instagram = models.URLField(max_length=300, blank=True, help_text='e.g. https://www.instagram.com/woknrollkw')
    handle = models.CharField('Instagram handle', max_length=60, blank=True, help_text='e.g. @woknrollkw')
    hotline = models.CharField(max_length=120, blank=True, help_text='8-digit numbers separated by commas, e.g. 25310857, 25310858')

    class Meta(Ordered.Meta):
        verbose_name = 'restaurant'

    def __str__(self):
        return self.name

    @property
    def hotline_list(self):
        return [n.strip() for n in self.hotline.replace('،', ',').split(',') if n.strip()]


class Branch(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='branches')
    name_en = models.CharField('branch (English)', max_length=120)
    name_ar = models.CharField('branch (Arabic)', max_length=120)
    hours_en = models.CharField('hours (English)', max_length=60, blank=True, help_text='e.g. 12 PM – 11:30 PM')
    hours_ar = models.CharField('hours (Arabic)', max_length=60, blank=True)
    phone = models.CharField(max_length=20, blank=True, help_text='8 digits')
    maps_url = models.URLField('Google Maps link', max_length=500, blank=True, help_text='Empty = a Google Maps search for the branch.')
    order = models.PositiveIntegerField('position', default=0)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'branch'
        verbose_name_plural = 'branches'

    def __str__(self):
        return f'{self.brand.name} · {self.name_en}'
