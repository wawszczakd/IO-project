from django.urls import path
from .views import game_detail, game_hand_brain_detail

urlpatterns = [
    path('games/<int:game_id>/', game_detail),
    path('gamehandandbrain/<int:game_id>/', game_hand_brain_detail),
    # Other URL patterns in your project
]
