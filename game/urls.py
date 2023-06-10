from django.urls import path
from .views import *

urlpatterns = [
    path('games/<int:game_id>/', game_detail),
    path('gamehandandbrain/<int:game_id>/', game_hand_brain_detail),
    path('gamehandandbrain/<int:game_id>/move_brain', game_hand_brain_send_brain),
    path('gamehandandbrain/<int:game_id>/move_hand', game_hand_brain_send_hand),
    path('gamehandandbrain/<int:game_id>/choose_figure/', game_hand_and_brain_choose_figure, name='choose_figure'),
    path('gamehandandbrain/<int:game_id>/make_move/', game_hand_and_brain_make_move, name='make_move'),
    path('get_game_id', get_game_id, name='get_game_id')
    # Other URL patterns in your project
]
