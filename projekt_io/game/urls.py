from django.urls import path
from .views import *

urlpatterns = [
    path('games/<int:game_id>/', game_detail),
    path('gamehandandbrain/<int:game_id>/', game_hand_brain_detail),
    path('gamehandandbrain/<int:game_id>/move_brain', game_hand_brain_detail_move_brain),
    path('gamehandandbrain/<int:game_id>/move_hand', game_hand_brain_detail_move_hand)
    # Other URL patterns in your project
]
