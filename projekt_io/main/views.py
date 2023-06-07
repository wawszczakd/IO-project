from django.shortcuts import render
import time
from rest_framework import viewsets
from .models import Room
from .serializers import RoomSerializer

def index(request):
    return render(request=request, template_name='main/index.html')

def play(request):
    return render(request, 'main/play.html', {})

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
