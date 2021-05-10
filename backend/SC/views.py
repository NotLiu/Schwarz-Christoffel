from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from sandbox.polygon import Vertex, Line, Angle, Polygon

def defPoly(vertices):
    print(type(vertices[0]))
    testPoly = Polygon(vertices, True)

    return testPoly
# from django.views.decorators.csrf import csrf_exempt

@api_view(['GET', 'POST'])
def get_sc(request):
  if request.method == 'GET':
    print(request)
    return Response(request.data)
  if request.method == 'POST':
    pass


@api_view(['GET', 'POST'])
def data_transfer(request):
    if request.method == 'GET':
        print(request)
        return Response(request.data)
    if request.method == 'POST':
        vertList = []
        for i in request.data['vertices']:
            vertList.append((float(i[0]),float(i[1])))
        if(len(vertList)>2):
            poly = defPoly(vertList)

            lineLens = []
            lineSlopes = []
            polyIntAngles = []
            polyExtAngles = []
            
            print(poly)
            for i  in range(len(vertList)):
                lineLens.append(str(poly.lines[i].v1.label)+"<->"+str(poly.lines[i].v2.label)+":  "+str(poly.lines[i].getLength()))
                lineSlopes.append(str(poly.lines[i].v1.label)+"<->"+str(poly.lines[i].v2.label)+":  "+str(poly.lines[i].getSlope()))
                polyIntAngles.append(str(poly.intAngles[i]))
                polyExtAngles.append(str(poly.extAngles[i]))

            return Response({"message": "POLYGON COMPLETE",  
                            'lineLengths': lineLens,
                            'lineSlopes' : lineSlopes,
                            'Interior Angles' : polyIntAngles,
                            'Exterior Angles' : polyExtAngles
                            })
        return Response({"message": "Got some data!", "data": request.data})


def index(request):
    data_transfer(request)
    return render(request, "SC/index.html", context={})
