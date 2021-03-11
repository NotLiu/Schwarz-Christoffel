#may be irrelevant classes
from rest_framework import serializers

class Polygon:
    def __init__(self, vertices, lines, angles):
        self.vertices = vertices
        self.lines = lines
        self.angles = angles

class polygonSerializer(serializers.Serializer):
    class Meta:
        model = Student 
        fields = ('pk', 'name', 'email', 'document', 'phone', 'registrationDate')