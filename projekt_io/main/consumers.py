from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Room, User
import json
from asgiref.sync import sync_to_async
from .serializers import UserSerializer

class MainMenuConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']
        message_payload = data['payload']

        if message_type == 'create_room':
            await self.create_room(message_payload)
        elif message_type == 'join_room':
            await self.join_room(message_payload)

    async def create_room(self, room_code):
        room = await sync_to_async(Room.objects.create)(code=room_code)
        response = {
            'type': 'room_created',
            'payload': {
                'room_code': room.code,
            }
        }
        await self.send(json.dumps(response))

    async def join_room(self, room_code):
        try:
            room = await sync_to_async(Room.objects.get)(code=room_code)
            response = {
                'type': 'room_joined',
                'payload': {
                    'room_code': room.code,
                }
            }
        except Room.DoesNotExist:
            response = {
                'type': 'room_not_found',
                'payload': {
                    'error': 'Room does not exist.',
                }
            }
        await self.send(json.dumps(response))

class RoomConsumer(AsyncWebsocketConsumer):
    users = {}
    owner = {}

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = 'room_%s' % self.room_code

        if (self.owner.get(self.room_group_name, None) == None):
            self.owner[self.room_group_name] = None
            self.users[self.room_group_name] = []

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def broadcast_users(self):
        serializer = UserSerializer(self.users[self.room_group_name], many=True)
        response = {
            'type': 'send_message',
            'event': 'connected_users',
            'connected_users': serializer.data,
            'owner_id': self.owner[self.room_group_name].id if self.owner[self.room_group_name] else -1
        }

        await self.channel_layer.group_send(
            self.room_group_name,
            response
        )

    async def user_joined(self, nickname):
        user = await sync_to_async(User.objects.create)(nickname=nickname)
        self.users[self.room_group_name].append(user)
        if (self.owner[self.room_group_name] == None):
            self.owner[self.room_group_name] = user
        await self.broadcast_users()

    async def user_left(self, user_id):
        user = await sync_to_async(User.objects.get)(pk=user_id)
        self.users[self.room_group_name].remove(user)
        if (self.owner[self.room_group_name] == user):
            if (len(self.users[self.room_group_name]) != 0):
                self.owner[self.room_group_name] = self.users[self.room_group_name][0]
            else:
                self.owner[self.room_group_name] = None

        await sync_to_async(user.delete)()
        await self.broadcast_users()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']

        if message_type == 'user_joined':
            await self.user_joined(data['nickname'])
        elif message_type == 'user_left':
            await self.user_left(data['user_id'])
     
    async def send_message(self, res):
        await self.send(text_data=json.dumps({
            "payload": res,
        }))