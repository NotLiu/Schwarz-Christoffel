from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
# from django.views.decorators.csrf import csrf_exempt

print("FFFFFF")
@api_view(['GET', 'POST'])
def data_transfer(request):
    print("EGRAREGARGA");
    if request.method == 'GET':
        print("XXX")
        return Response({"message": "Got some data!"})
    if request.method == 'POST':
        print("AAA")
        return Response({"message": "Got some data!", "data": request.config.data})

def index(request):
    return render(request, "SC/index.html", context={})
