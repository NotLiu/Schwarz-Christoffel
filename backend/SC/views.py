from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

# from django.views.decorators.csrf import csrf_exempt

@api_view(['GET', 'POST'])
def data_transfer(request):
    if request.method == 'GET':
        print(request)
        return Response(request.data)
    if request.method == 'POST':
        print(request.data)
        return Response({"message": "Got some data!", "data": request.data})


def index(request):
    data_transfer(request)
    return render(request, "SC/index.html", context={})
