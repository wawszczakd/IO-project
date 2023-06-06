from django.shortcuts import render
from game.models import *
import time


def index(request):
    return render(request=request, template_name='main/index.html')

def play(request):
    game = GameHandAndBrain()
    return render(request, 'main/play.html', {})
