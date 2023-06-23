from django.urls import path, re_path
from . import consumers

websocket_urlpatterns = [
    path('ws/', consumers.MainMenuConsumer.as_asgi()),
    re_path(r'ws/room/(?P<room_code>\w+)/$', consumers.RoomConsumer.as_asgi()),
    re_path(r'ws/hand_and_brain/(?P<room_code>\w+)/$', consumers.HandAndBrainConsumer.as_asgi()),
]