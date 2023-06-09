from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Game, GameHandAndBrain

class GameModelsTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password1')
        self.user2 = User.objects.create_user(username='user2', password='password2')
        self.game = Game.objects.create()
        self.game.players.add(self.user1)
        self.game.players.add(self.user2)

    def test_get_board(self):
        board = self.game.get_board()
        self.assertIsNotNone(board)
        self.assertEqual(board.fen(), "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

    def test_get_legal_moves(self):
        legal_moves = self.game.get_legal_moves()


class GameHandAndBrainModelsTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password1')
        self.user2 = User.objects.create_user(username='user2', password='password2')
        self.user3 = User.objects.create_user(username='user3', password='password1')
        self.user4 = User.objects.create_user(username='user4', password='password2')
        self.game = GameHandAndBrain.objects.create(team1_brain=self.user1, team1_hand=self.user2,
                                                    team2_brain=self.user3, team2_hand=self.user4)

    def test_get_next_move(self):
        next_move = self.game.get_next_move()
        self.assertEqual(next_move, self.game.team1_hand)

        # Modify the current move and check the next move again
        self.game.current_move = self.game.team1_hand
        self.game.save()
        next_move = self.game.get_next_move()
        self.assertEqual(next_move, self.game.team2_brain)

    def test_make_move_brain(self):
        piece = "PAWN"
        self.game.make_move_brain(piece)
        self.assertEqual(self.game.current_piece, piece)

    def test_make_move_hand(self):
        move = "e4"
        self.game.make_move_hand(move)
        self.assertEqual(self.game.board.fen(),
                              "rnbqkbnr/pppppppp/8/8/"\
                              "4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1")
