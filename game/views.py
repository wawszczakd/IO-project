from django.http import JsonResponse
from .models import Game, GameHandAndBrain
from django.views.decorators.csrf import csrf_exempt
from .serializers import *
import json

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
def game_hand_brain_send_brain(request, game_id):
    try:
        game_hand_brain = GameHandAndBrain.objects.get(pk=game_id)
        serializer = GameHandAndBrainSerializerBrainMove(game_hand_brain)
        return JsonResponse(serializer.__dict__)
    except GameHandAndBrain.DoesNotExist:
        return JsonResponse({'error': 'GameHandAndBrain not found'}, status=404)

# view which returns JSON with possible moves for hand
def game_hand_brain_send_hand(request, game_id):
    try:
        game_hand_brain = GameHandAndBrain.objects.get(pk=game_id)
        serializer = GameHandAndBrainSerializerHandMove(game_hand_brain)
        return JsonResponse(serializer.__dict__)
    except GameHandAndBrain.DoesNotExist:
        return JsonResponse({'error': 'GameHandAndBrain not found'}, status=404)

@csrf_exempt
def game_hand_and_brain_choose_figure(request, game_id):
    if request.method == 'POST':
        try:
            game = GameHandAndBrain.objects.get(pk=game_id)
            data = json.loads(request.body)
            selected_piece = data.get('selected_piece')
            game.make_move_brain(selected_piece)
            return JsonResponse({'success': 'Figure chosen successfully'})
        except GameHandAndBrain.DoesNotExist:
            return JsonResponse({'error': 'GameHandAndBrain not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def game_hand_and_brain_make_move(request, game_id):
    if request.method == 'POST':
        try:
            game = GameHandAndBrain.objects.get(pk=game_id)
            data = json.loads(request.body)
            move = data.get('move')
            game.make_move_hand(move)
            game.save()
            return JsonResponse({'success': 'Move made successfully'})
        except GameHandAndBrain.DoesNotExist:
            return JsonResponse({'error': 'GameHandAndBrain not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
