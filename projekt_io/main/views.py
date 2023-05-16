from django.shortcuts import render
import time

def index(request):
    return render(request=request, template_name='main/index.html')

def play(request):
    return render(request, 'main/play.html', {})
