import json
import shutil
import tempfile
from datetime import timedelta
from unittest import mock

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone

from bookings.models import Booking
from bookings.tests import payload

from .models import Cuisine, Reel, SiteText, SocialLink
from .storage import CloudinaryStorage

MEDIA = tempfile.mkdtemp()


class SeedTests(TestCase):
    """The migration copies what the website showed before into the admin."""

    def test_lists_and_texts_are_seeded(self):
        d = self.client.get('/api/content/').json()
        self.assertEqual([c['id'] for c in d['cuisines']], ['arabic', 'lebanese', 'chinese', 'japanese', 'mediterranean', 'latin'])
        self.assertEqual(len(d['cuisines'][0]['dishes']), 5)
        self.assertEqual(len(d['events']), 9)
        self.assertEqual(d['events'][3]['id'], 'diwaniyah')  # right after family gatherings
        self.assertEqual(len(d['services']), 4)
        self.assertEqual(len(d['ramadan']), 3)
        self.assertEqual(len(d['reels']), 6)
        self.assertEqual(sorted(r['heroSlot'] for r in d['reels'] if r['heroSlot']), [1, 2, 3])
        self.assertEqual(d['reels'][0]['src'], 'videos/reel3.mp4')
        self.assertEqual(d['brands'][0]['hotline'], ['25310857', '25310858'])
        self.assertEqual([b['name'] for b in d['brands']], ['Wok n Roll', 'Dine', 'Luma', 'Sando', 'Beit Ladan', 'Estepona'])
        self.assertEqual(d['brands'][3]['logo'], '')
        self.assertEqual(d['texts']['hero.title1'], {'en': 'Six kitchens.', 'ar': SiteText.objects.get(key='hero.title1').ar})
        self.assertIn('Weddings\n', d['texts']['marquee']['en'])
        self.assertNotIn('book.f.name', d['texts'])  # booking form labels stay in code


class ContentApiTests(TestCase):
    def test_hidden_items_are_left_out(self):
        Cuisine.objects.filter(slug='japanese').update(is_active=False)
        ids = [c['id'] for c in self.client.get('/api/content/').json()['cuisines']]
        self.assertNotIn('japanese', ids)

    def test_order_and_social_links(self):
        Cuisine.objects.filter(slug='mediterranean').update(order=0)
        Cuisine.objects.exclude(slug='mediterranean').update(order=5)
        SocialLink.objects.create(platform='tiktok', url='https://www.tiktok.com/@greenhills', handle='@greenhills')
        SocialLink.objects.create(platform='x', url='https://x.com/old', is_active=False)
        d = self.client.get('/api/content/').json()
        self.assertEqual(d['cuisines'][0]['id'], 'mediterranean')
        self.assertEqual(d['socials'], [{'platform': 'tiktok', 'url': 'https://www.tiktok.com/@greenhills', 'handle': '@greenhills'}])

    def test_branch_without_map_link_gets_a_search(self):
        d = self.client.get('/api/content/').json()
        branch = d['brands'][0]['branches'][0]
        self.assertTrue(branch['maps'].startswith('https://www.google.com/maps/search/'))

    def test_choosing_a_hero_spot_takes_it_from_the_other_video(self):
        old = Reel.objects.get(hero_slot=2)
        new = Reel.objects.filter(hero_slot=0).first()
        new.hero_slot = 2
        new.save()
        old.refresh_from_db()
        self.assertEqual(old.hero_slot, 0)
        self.assertEqual(Reel.objects.filter(hero_slot=2).get(), new)


@override_settings(MEDIA_ROOT=MEDIA)
class AdminTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA, ignore_errors=True)

    def setUp(self):
        User.objects.create_superuser('admin', 'a@a.com', 'pass12345')
        self.client.login(username='admin', password='pass12345')

    def test_admin_pages_open(self):
        for url in [
            '/admin/', '/admin/content/sitetext/', '/admin/content/sitetext/?section=hero', '/admin/content/reel/',
            '/admin/content/cuisine/', '/admin/content/cuisine/add/', '/admin/content/service/', '/admin/content/eventtype/',
            '/admin/content/ramadanpackage/', '/admin/content/brand/', '/admin/content/sociallink/add/',
            f'/admin/content/cuisine/{Cuisine.objects.first().pk}/change/', f'/admin/content/reel/{Reel.objects.first().pk}/change/',
        ]:
            self.assertEqual(self.client.get(url).status_code, 200, url)
        r = self.client.get('/admin/content/sitesettings/', follow=True)
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, 'Current logo')

    def test_fixed_sets_cannot_be_added(self):
        self.assertEqual(self.client.get('/admin/content/service/add/').status_code, 403)
        self.assertEqual(self.client.get('/admin/content/eventtype/add/').status_code, 403)

    def test_upload_replaces_built_in_photo(self):
        c = Cuisine.objects.get(slug='arabic')
        data = {
            'name_en': c.name_en, 'name_ar': c.name_ar, 'tagline_en': 'New tagline', 'tagline_ar': c.tagline_ar,
            'image': SimpleUploadedFile('ouzi.jpg', b'\xff\xd8\xff fake jpeg', content_type='image/jpeg'),
            'order': 0, 'is_active': 'on',
            'dishes-TOTAL_FORMS': '0', 'dishes-INITIAL_FORMS': '0', 'dishes-MIN_NUM_FORMS': '0', 'dishes-MAX_NUM_FORMS': '1000',
        }
        r = self.client.post(f'/admin/content/cuisine/{c.pk}/change/', data)
        self.assertEqual(r.status_code, 302, r.content[:3000])
        arabic = self.client.get('/api/content/').json()['cuisines'][0]
        self.assertEqual(arabic['tagline']['en'], 'New tagline')
        self.assertRegex(arabic['image'], r'^/uploads/cuisines/ouzi.*\.jpg$')
        self.assertEqual(self.client.get(arabic['image']).status_code, 200)

    def test_wrong_file_type_is_refused(self):
        r = self.client.post('/admin/content/sociallink/add/', {})  # sanity: empty form re-renders
        self.assertEqual(r.status_code, 200)
        reel = Reel.objects.first()
        r = self.client.post(f'/admin/content/reel/{reel.pk}/change/', {
            'label_en': 'x', 'label_ar': 'x', 'hero_slot': 0, 'order': 0, 'is_active': 'on',
            'video': SimpleUploadedFile('virus.exe', b'MZ', content_type='application/octet-stream'),
        })
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, 'File extension')

    def test_new_cuisine_needs_a_photo_and_can_be_booked(self):
        r = self.client.post('/admin/content/cuisine/add/', {
            'name_en': 'Indian', 'name_ar': 'هندي', 'slug': 'indian', 'tagline_en': 'Tandoor', 'tagline_ar': 'تندور',
            'order': 9, 'is_active': 'on',
            'dishes-TOTAL_FORMS': '0', 'dishes-INITIAL_FORMS': '0', 'dishes-MIN_NUM_FORMS': '0', 'dishes-MAX_NUM_FORMS': '1000',
        })
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, 'Upload a photo.')

        Cuisine.objects.create(slug='indian', name_en='Indian', name_ar='هندي', tagline_en='t', tagline_ar='t', image_builtin='img/grill.jpg')
        cache.clear()
        r = self.client.post('/api/bookings/', data=json.dumps(payload(cuisines=['arabic', 'indian'])), content_type='application/json')
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(Booking.objects.get().cuisines_display, 'Arabic, Indian')

    def test_texts_can_be_edited_and_restored(self):
        t = SiteText.objects.get(key='hero.title1')
        t.en = 'Seven kitchens.'
        t.save()
        self.assertEqual(self.client.get('/api/content/').json()['texts']['hero.title1']['en'], 'Seven kitchens.')
        self.client.post('/admin/content/sitetext/', {'action': 'restore_original', '_selected_action': [t.pk]})
        t.refresh_from_db()
        self.assertEqual(t.en, 'Six kitchens.')


class PageTests(TestCase):
    def test_content_is_handed_over_with_the_page(self):
        SiteText.objects.filter(key='hero.title1').update(en='</script><b>hi')
        with tempfile.TemporaryDirectory() as dist:
            with open(f'{dist}/index.html', 'w', encoding='utf-8') as f:
                f.write('<html><head><title>x</title></head><body></body></html>')
            from pathlib import Path
            with override_settings(FRONTEND_DIST=Path(dist)):
                html = self.client.get('/').content.decode('utf-8')
        self.assertIn('window.__GH_CONTENT__=', html)
        self.assertNotIn('</script><b>', html)
        data = json.loads(html.split('window.__GH_CONTENT__=')[1].split('</script>')[0])
        self.assertEqual(data['texts']['hero.title1']['en'], '</script><b>hi')


class CloudinaryStorageTests(TestCase):
    def setUp(self):
        patcher = mock.patch('content.storage._cloud', return_value='demo')
        patcher.start()
        self.addCleanup(patcher.stop)
        self.storage = CloudinaryStorage()

    def test_urls(self):
        self.assertEqual(
            self.storage.url('image/green-hills/cuisines/ouzi_ab12.jpg'),
            'https://res.cloudinary.com/demo/image/upload/c_limit,w_2000,f_auto,q_auto/green-hills/cuisines/ouzi_ab12.jpg',
        )
        self.assertEqual(
            self.storage.url('video/green-hills/reels/grill_x.mp4'),
            'https://res.cloudinary.com/demo/video/upload/q_auto/green-hills/reels/grill_x.mp4',
        )
        self.assertEqual(
            self.storage.video_poster_url('video/green-hills/reels/grill_x.mp4'),
            'https://res.cloudinary.com/demo/video/upload/so_0,f_auto,q_auto/green-hills/reels/grill_x.jpg',
        )

    def test_upload_picks_image_or_video(self):
        with mock.patch('cloudinary.uploader.upload', return_value={'public_id': 'green-hills/cuisines/a_1', 'format': 'jpg'}) as up, \
                mock.patch('cloudinary.uploader.upload_large', return_value={'public_id': 'green-hills/reels/v_1', 'format': 'mp4'}) as up_large:
            self.assertEqual(self.storage.save('cuisines/a.jpg', SimpleUploadedFile('a.jpg', b'x')), 'image/green-hills/cuisines/a_1.jpg')
            self.assertEqual(self.storage.save('reels/v.mp4', SimpleUploadedFile('v.mp4', b'x')), 'video/green-hills/reels/v_1.mp4')
        self.assertEqual(up.call_args.kwargs['folder'], 'green-hills/cuisines')
        self.assertEqual(up_large.call_args.kwargs['resource_type'], 'video')


class BookingStillWorksTests(TestCase):
    def test_built_in_cuisine_ids_still_accepted(self):
        cache.clear()
        Cuisine.objects.all().delete()
        r = self.client.post('/api/bookings/', data=json.dumps(payload(
            event_date=(timezone.localdate() + timedelta(days=5)).isoformat())), content_type='application/json')
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(Booking.objects.get().cuisines_display, 'Arabic, Lebanese')
