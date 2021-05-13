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

SC = None 

@api_view(['GET', 'POST'])
def get_sc(request):
  if request.method == 'GET':
    print(request)
    return Response(request.data)
  if request.method == 'POST':
    print(request.data)
    vertices = [(vertex[0], vertex[1]) for vertex in request.data['vertices']]
    global SC 
    SC = SchwarzChristoffel(vertices)
    SC.getParameters()

    return Response({'message': 'sc parameters and flow lines received',
                    'lambda': [str(λ) for λ in SC.λ],
                    'Is' : [str(I)  for I in SC.I],
                    'IRatios': [str(IRatio) for IRatio in SC.IRatios]})


@api_view(['GET', 'POST'])
def get_flows(request):
  if request.method == 'GET':
    print(request)
    return Response(request.data)
  if request.method == 'POST':
    alpha = complex(request.data['alpha']) #alpha should be a complex number -1 < x < 1
    SC.getFlowLines(alpha)

    flowLinesString = []
    for pointSet in SC.flowLines:
      l = []
      for point in pointSet:
        l.append(str(point))
      flowLinesString.append(l)
    
    return Response({
      'message': f'flow lines received with alpha {alpha}',
      'flowLines' : flowLinesString
    })


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
