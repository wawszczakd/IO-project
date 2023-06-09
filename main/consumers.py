from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Room, User
import json
from asgiref.sync import sync_to_async
from game.chess_functions import *
from .serializers import UserSerializer
from game.chess_functions_fen import *

class MainMenuConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data["type"]
        message_payload = data["payload"]

        if message_type == "create_room":
            await self.create_room(message_payload)
        elif message_type == "join_room":
            await self.join_room(message_payload)

    async def create_room(self, room_code):
        room = await sync_to_async(Room.objects.create)(code=room_code)
        response = {
            "type"          : "room_created",
            "payload"       : {
                "room_code" : room.code,
            }
        }
        await self.send(json.dumps(response))

    async def join_room(self, room_code):
        try:
            room = await sync_to_async(Room.objects.get)(code=room_code)
            response = {
                "type"    : "room_joined",
                "payload" : {
                    "room_code" : room.code,
                }
            }
        except Room.DoesNotExist:
            response = {
                "type"    : "room_not_found",
                "payload" : {
                    "error" : "Room does not exist.",
                }
            }
        await self.send(json.dumps(response))

class RoomConsumer(AsyncWebsocketConsumer):
    users = {}
    owner = {}

    def check_if_valid(self):
        users = self.users[self.room_group_name]
        
        if len(users) < 4:
            return "Too few players"
        elif len(users) > 4:
            return "Too many players"
        else:
            roles = set()
            
            for user in users:
                role = users[user]["role"]
                if users[user]["team"] == 1:
                    role += "_1"
                else:
                    role += "_2"
                
                if role in roles:
                    return "More than one player with the same role"
                
                roles.add(role)
        
        return "OK"
    
    def get_roles(self):
        users = self.users[self.room_group_name]
        
        roles = {}
        for user in users:
            role = users[user]["role"]
            if users[user]["team"] == 1:
                role += "_1"
            else:
                role += "_2"
            roles[role] = user
        return roles

    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]
        self.room_group_name = "room_%s" % self.room_code

        if (self.users.get(self.room_group_name, None) == None):
            self.owner[self.room_group_name] = None
            self.users[self.room_group_name] = {}

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

    async def broadcast_users(self, new_id=-1):
        response = {
            "type"            : "send_message",
            "event"           : "connected_users",
            "connected_users" : self.users[self.room_group_name],
            "owner_id"        : self.owner[self.room_group_name].id if self.owner[self.room_group_name] else -1,
            "new_id"          : new_id
        }

        await self.channel_layer.group_send(
            self.room_group_name,
            response
        )

    async def start_game(self, user_id):
        valid = self.check_if_valid()
        
        if valid != "OK":
            response = {
                "type"    : "send_message",
                "event"   : "failed_start",
                "userId"  : user_id,
                "content" : valid,
            }
        else:
            roles = self.get_roles()
            response = {
                "type"  : "send_message",
                "event" : "start_game",
                "roles" : roles,
            }
        
        await self.channel_layer.group_send(
            self.room_group_name,
            response
        )

    async def user_joined(self, nickname):
        user = await sync_to_async(User.objects.create)(nickname=nickname)

        users = self.users[self.room_group_name]

        team1, team2 = [], [] 
        
        for id in users:
            if users[id]['team'] == 1:
                team1.append(users[id]['role'])
            else:
                team2.append(users[id]['role'])
    
        team = 1 if len(team1) < 2 else 2
        
        role = 'brain'
        if team == 1:
            if len(team1) > 0:
                if team1[0] == 'brain':
                    role = 'hand'
        else: 
            if len(team2) > 0:
                if team2[0] == 'brain':
                    role = 'hand'

        self.users[self.room_group_name][user.id] = {
            "nickname": nickname,
            "team": team,
            "role": role,
        }
        if (self.owner[self.room_group_name] == None):
            self.owner[self.room_group_name] = user
        await self.broadcast_users(new_id=user.id)

    async def user_left(self, user_id):
        user = await sync_to_async(User.objects.get)(pk=user_id)
        self.users[self.room_group_name].pop(user.id)
        if (self.owner[self.room_group_name] == user):
            self.owner[self.room_group_name] = None
            for user_id in self.users[self.room_group_name].keys():
                self.owner[self.room_group_name] = await sync_to_async(User.objects.get)(pk=user_id)
                break

        await sync_to_async(user.delete)()
        await self.broadcast_users()

    async def team_changed(self, user_id, new_team):
        self.users[self.room_group_name][user_id]["team"] = new_team
        await self.broadcast_users()

    async def role_changed(self, user_id, new_role):
        self.users[self.room_group_name][user_id]["role"] = new_role
        await self.broadcast_users()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data["type"]

        if message_type == "user_joined":
            await self.user_joined(data["nickname"])
        elif message_type == "user_left":
            await self.user_left(data["user_id"])
        elif message_type == "team_changed":
            await self.team_changed(data["user_id"], data["new_team"])
        elif message_type == "role_changed":
            await self.role_changed(data["user_id"], data["new_role"])
        elif message_type == "start_game":
            await self.start_game(data["user_id"])
     
    async def send_message(self, res):
        await self.send(text_data=json.dumps({
            "payload": res,
        }))

# tutaj można stworzyć ogólnego gameConsumer zintegrowanego z modelem Game i extendować
class HandAndBrainConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]
        self.room_group_name = "room_%s" % self.room_code

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

    async def brain_choose_figure(self, figure, fen, current_role):
        moves = get_moves(fen, figure)

        response = {
            "type"          : "send_message",
            "event"         : "brain_choose_figure",
            "moves"         : moves,
            "fen"           : fen,
            "current_role"  : (current_role + 1) % 4,
            "chosen_figure" : figure,
        }

        await self.channel_layer.group_send(
            self.room_group_name,
            response
        )

    async def hand_choose_move(self, fen, current_role):
        finished = is_finished(fen)
        if finished != "The game is still in progress.":
            response = {
                "type"         : "send_message",
                "event"        : "game_finished",
                "content"      : finished,
                "fen"          : fen,
            }
        else:
            figures = get_figures(fen)
            response = {
                "type"         : "send_message",
                "event"        : "hand_choose_move",
                "figures"      : figures,
                "fen"          : fen,
                "current_role" : (current_role + 1) % 4,
            }

        await self.channel_layer.group_send(
            self.room_group_name,
            response
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data["type"]

        if message_type == "brain_choose_figure":
            await self.brain_choose_figure(data["figure"], data["fen"], data["current_role"])
        elif message_type == "hand_choose_move":
            await self.hand_choose_move(data["fen"], data["current_role"])
        
    async def send_message(self, res):
        await self.send(text_data=json.dumps({
            "payload": res,
        }))