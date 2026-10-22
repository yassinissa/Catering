from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path
from django.views.static import serve

from bookings import views
from content import views as content_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/bookings/', views.create_booking, name='create-booking'),
    path('api/content/', content_views.content, name='content'),
    path('api/health/', views.health, name='health'),
]


def uploads(request, path):
    return serve(request, path, document_root=settings.MEDIA_ROOT)


if not settings.CLOUDINARY_ENABLED:
    # photos and videos uploaded in the admin and saved on this computer (local runs)
    urlpatterns.append(re_path(r'^uploads/(?P<path>.*)$', uploads))

# everything else is the React website
urlpatterns.append(re_path(r'^(?!static/|admin|api/|uploads/).*$', views.frontend, name='frontend'))
