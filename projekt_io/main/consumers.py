from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Room
import json
from asgiref.sync import sync_to_async

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
    nicknames = []

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = 'room_%s' % self.room_code

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
        response = {
            'type': 'send_message',
            'event': 'connected_users',
            'connected_users': self.nicknames
        }

        await self.channel_layer.group_send(
            self.room_group_name,
            response
        )

    async def user_joined(self, nickname):
        self.nicknames.append(nickname)
        await self.broadcast_users()

    async def user_left(self, nickname):
        self.nicknames.remove(nickname)
        await self.broadcast_users()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']

        if message_type == 'user_joined':
            await self.user_joined(data['nickname'])
        elif message_type == 'user_left':
            await self.user_left(data['nickname'])
     
    async def send_message(self, res):
        await self.send(text_data=json.dumps({
            "payload": res,
        }))