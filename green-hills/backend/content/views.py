import json
import logging

from django.http import JsonResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET

from .api import site_content

log = logging.getLogger('bookings')


@never_cache
@require_GET
def content(request):
    return JsonResponse(site_content(), json_dumps_params={'ensure_ascii': False})


def content_script():
    """<script> that hands the content to the website with the page itself, so it shows without waiting for a request."""
    try:
        data = json.dumps(site_content(), ensure_ascii=False)
    except Exception:  # the website still works on its built-in content
        log.exception('Could not load website content')
        return ''
    # "<" escaped so text typed in the admin can never close the script tag
    return '<script>window.__GH_CONTENT__=' + data.replace('<', '\\u003c') + '</script>'
