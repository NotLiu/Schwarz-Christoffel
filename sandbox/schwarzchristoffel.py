# -*- coding: utf-8 -*-

import operator
import numpy as np
import quadpy
from scipy import special
from scipy import integrate
from scipy.optimize import newton
from functools import reduce

class SchwarzChristoffel:
    def __init__(self, polygon):
        self.polygon = polygon
        self.N = len(polygon.vertices)
        self.a = self.approximateRealMapping()
        self.alpha = [float(self.polygon.extAngles[i])/np.pi for i in range(len(self.polygon.extAngles))]
        print(self.alpha)
        self.c1 = 1
        self.c2 = 0
        
    def approximateRealMapping(self):
        #map from real axis to z-plane vertices
        
        #start with -1, 1, ... N + 2, starting from a_3 mappings, last one inf or arbitrary
        mapping = {}
        mapping[-1] = self.polygon.vertices[0]
        mapping[1] = self.polygon.vertices[1]
        for vIndex in range(2, len(self.polygon.vertices) -1):
            mapping[vIndex] = self.polygon.vertices[vIndex]
        mapping[float('inf')] = self.polygon.vertices[-1]
        return mapping
    
    def getParameters(self, n=100):
        #newton raphson
        print('Finding Parameters')

        internalf = lambda zeta, a: [zeta - a[j]**(a[j]-1) for j in range(self.N-1)]
        keys = list(self.a.keys())
        PiProd = lambda zeta: reduce(operator.mul, internalf(zeta, keys))
        print(self.gauss_jacobi_quad(PiProd, n))

        #find accessory parameters a_{j} for j = 1, 2, ..., N - 1
        
        #sub any vertex of polygon and corresponding z plane
        '''
        self.c1 = z_i / int_{0}^{a_i} Pi_{j=1}^{N-1} (zeta - a_j)^a_{j-1} d-zeta        
        '''
        
    def gauss_jacobi_quad(self, func, n = 10):
        alpha = -0.1
        beta = -0.1
        result = special.j_roots(n, alpha, beta)
        points, weights = result[0], result[1]
        return sum([weights[i]*func(points[i]) for i in range(n)])
    
    def calc(self):
        #input params into sc integral
        return -1
            
    def __str__(self):
        return str(self.polygon)
    
    
    
# method for finding integral for (1-x)^-0.5 * (1+x)^-0.6 * (1+x^2)
 
f2 = lambda x: 1 + x**2 

result = special.j_roots(10,-0.5,-0.6)

points, weights = result[0], result[1]

integral = 0
for i in range(10):
    integral += weights[i] * f2(points[i])
    
print(integral)
    



