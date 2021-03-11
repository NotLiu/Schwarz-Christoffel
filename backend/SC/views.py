from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status


@api_view(['GET', 'POST'])
def data_transfer(request):
    if request.method == 'GET':
        
    if request.method == 'POST':


def index(request):
    return render(request, "SC/index.html", context={})
