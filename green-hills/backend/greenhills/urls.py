from django.contrib import admin
from django.urls import path, re_path

from bookings import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/bookings/', views.create_booking, name='create-booking'),
    path('api/health/', views.health, name='health'),
    # everything else is the React website
    re_path(r'^(?!static/|admin|api/).*$', views.frontend, name='frontend'),
]
