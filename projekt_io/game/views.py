from django.http import JsonResponse
from .models import Game, GameHandAndBrain
from .serializers import GameSerializer, GameHandAndBrainSerializer

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
