from django.db import models
from django.contrib.auth.models import User
import chess

# Create your models here.


class Game(models.Model):
    STATUS_CHOICES = (
        ('O', 'Ongoing'),
        ('C', 'Completed'),
    )

    # 4 players
    players = models.ManyToManyField(User, related_name='games')
    status = models.CharField(
        max_length=1, choices=STATUS_CHOICES, default='O')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    current_move = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='current_games')

    board = chess.Board()

    def get_board(self):
        return self.board

    def get_legal_moves(self):
        return self.board.legal_moves


# specific class extending basic Game
class GameHandAndBrain(Game):
    team1_hand = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='team1_games_head')
    team1_brain = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='team1_games_brain')
    team2_hand = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='team2_games_head')
    team2_brain = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='team2_games_brain')

    current_piece = models.CharField(max_length=10, blank=True, null=True)

    selected_piece = "PAWN"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.current_move:
            self.current_move = self.team1_brain
        current_piece = "PAWN"

    def get_next_move(self):
        if self.current_move == self.team1_brain:
            return self.team2_hand
        elif self.current_move == self.team1_hand:
            return self.team2_brain
        elif self.current_move == self.team2_brain:
            return self.team1_hand
        elif self.current_move == self.team2_hand:
            return self.team1_brain
        else:
            return None

    def make_move_brain(self, piece):
        self.current_piece = piece
        self.save()

    def make_move_hand(self, move):
        self.board.push_san(move)
        self.save()


