from django.db import models
from django.contrib.auth.models import User
import chess

class GameSerializer:
    def __init__(self, game):
        self.id = game.id
        self.status = game.status
        self.start_time = game.start_time
        self.end_time = game.end_time
        self.current_move = game.current_move.username if game.current_move else None

class GameHandAndBrainSerializer:
    def __init__(self, game_hand_brain):
        self.id = game_hand_brain.id
        self.status = game_hand_brain.status
        self.start_time = game_hand_brain.start_time
        self.end_time = game_hand_brain.end_time
        self.current_move = game_hand_brain.current_move.username if game_hand_brain.current_move else None
        self.team1_hand = game_hand_brain.team1_hand.username if game_hand_brain.team1_hand else None
        self.team1_brain = game_hand_brain.team1_brain.username if game_hand_brain.team1_brain else None
        self.team2_hand = game_hand_brain.team2_hand.username if game_hand_brain.team2_hand else None
        self.team2_brain = game_hand_brain.team2_brain.username if game_hand_brain.team2_brain else None
        self.current_piece = game_hand_brain.current_piece
