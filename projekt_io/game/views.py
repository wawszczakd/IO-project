from django.http import JsonResponse
from .models import Game, GameHandAndBrain
from .serializers import *

def game_detail(request, game_id):
    try:
        game = Game.objects.get(pk=game_id)
        serializer = GameSerializer(game)
        return JsonResponse(serializer.__dict__)
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)

def game_hand_brain_detail(request, game_id):
    try:
        game_hand_brain = GameHandAndBrain.objects.get(pk=game_id)
        serializer = GameHandAndBrainSerializer(game_hand_brain)
        return JsonResponse(serializer.__dict__)
    except GameHandAndBrain.DoesNotExist:
        return JsonResponse({'error': 'GameHandAndBrain not found'}, status=404)

# view which returns JSON with possible figures for brain
def game_hand_brain_detail_move_brain(request, game_id):
    try:
        game_hand_brain = GameHandAndBrain.objects.get(pk=game_id)
        serializer = GameHandAndBrainSerializerBrainMove(game_hand_brain)
        return JsonResponse(serializer.__dict__)
    except GameHandAndBrain.DoesNotExist:
        return JsonResponse({'error': 'GameHandAndBrain not found'}, status=404)

# view which returns JSON with possible moves for hand
def game_hand_brain_detail_move_hand(request, game_id):
    try:
        game_hand_brain = GameHandAndBrain.objects.get(pk=game_id)
        request 
        serializer = GameHandAndBrainSerializerHandMove(game_hand_brain)
        return JsonResponse(serializer.__dict__)
    except GameHandAndBrain.DoesNotExist:
        return JsonResponse({'error': 'GameHandAndBrain not found'}, status=404)

