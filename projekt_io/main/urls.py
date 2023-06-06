from django.urls import include, path
from . import views
from .views import *

urlpatterns = [
    path('', views.index, name='index'),
    path('play', views.play, name='play'),
    path('api/', include('game.urls')),
]
