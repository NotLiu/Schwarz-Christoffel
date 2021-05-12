from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from sandbox.polygon import Vertex, Line, Angle, Polygon
from sandbox.schwarzchristoffel import SchwarzChristoffel

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
    vertices = [(vertex.x, vertex.y) for vertex in request.data['vertices']]
    sc = SchwarzChristoffel(vertices)
    sc.getParameters()
    sc.getFlowLines()

    flowLinesString = []
    for pointSet in sc.flowLines:
      l = []
      for point in pointSet:
        l.append(str(point))
      flowLinesString.append(l)

    return Response({'message': 'sc parameters and flow lines received',
                    'flowLines': flowLinesString,
                    'lambda': [str(λ) for λ in sc.λ],
                    'Is' : [str(I)  for I in sc.I],
                    'IRatios': [str(IRatio) for IRatio in sc.IRatios]})

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
