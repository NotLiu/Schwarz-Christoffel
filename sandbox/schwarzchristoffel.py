# -*- coding: utf-8 -*-
import scipy

class SchwarzChristoffel:
    def __init__(self, polygon):
        self.polygon = polygon
    
    def getParameters(self):
        for i in range(10):
            print('Finding swaggy parameters')
            
    def __str__(self):
        return str(self.polygon)