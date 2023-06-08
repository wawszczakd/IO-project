from django.urls import include, path
from rest_framework import routers

from . import views
from .views import *

router = routers.DefaultRouter()
router.register(r'rooms', RoomViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('play', views.play, name='play'),
    path('api/', include('game.urls'))
]
