from django.test import TestCase
from channels.testing import WebsocketCommunicator
from .consumers import *
from .models import *
from .serializers import *
import json

from django.test import TestCase
from .models import Room, User

class RoomModelTest(TestCase):
    def test_room_code_generation(self):
        room = Room.objects.create()
        self.assertIsNotNone(room.code)
        self.assertEqual(len(room.code), 6)

    def test_room_code_uniqueness(self):
        room1 = Room.objects.create()
        room2 = Room.objects.create()
        self.assertNotEqual(room1.code, room2.code)

class UserModelTest(TestCase):
    def test_user_creation(self):
        nickname = "JohnDoe"
        user = User.objects.create(nickname=nickname)
        self.assertEqual(user.nickname, nickname)

    def test_user_str_representation(self):
        nickname = "JohnDoe"
        user = User.objects.create(nickname=nickname)
        self.assertEqual(str(user), nickname)
