from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Room
import json
from asgiref.sync import sync_to_async

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract the room name from the URL
        # self.room_name = 69
        # # self.room_code = self.scope['url_route']['kwargs']['room_name']
        # self.room_group_name = 'game_%s' % self.room_name

        # # Join the room group
        # await self.channel_layer.group_add(
        #     self.room_group_name,
        #     self.channel_name
        # )

        # print(self.room_name, self.room_group_name)

        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the room group
        # await self.channel_layer.group_discard(
        #     self.room_group_name,
        #     self.channel_name
        # )
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
