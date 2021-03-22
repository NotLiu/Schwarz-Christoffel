# -*- coding: utf-8 -*-

import operator
import numpy as np
from scipy import special
from scipy.optimize import newton
from functools import reduce

class SchwarzChristoffel:
    def __init__(self, polygon):
        self.polygon = polygon
        self.N = len(polygon.vertices)
        self.a = self.approximateRealMapping()
        self.α = [float(self.polygon.extAngles[i])/np.pi for i in range(len(self.polygon.extAngles))]
        print(self.α)
        self.c1 = 1
        self.c2 = 0
        self.λ = []
        self.I = []
        self.F = []
        
    def approximateRealMapping(self):
        #map from real axis to z-plane vertices
        #start with -1, 1, ... N + 2, starting from a_3 mappings, last one inf or arbitrary
        vertices = self.polygon.vertices
        mapping = {}
        mapping[-1], mapping[1] = vertices[0], vertices[1]
        for vIndex in range(2, self.N - 1):
            mapping[vIndex] = vertices[vIndex]
        mapping[float('inf')] = vertices[-1]
        return mapping
    
    def getSideLengths(self, n=100):
        #newton raphson
        print('Finding Parameters')

        internalf = lambda ζ, a, α: [ζ - a[j]**(α[j]-1) for j in range(self.N-1)]
        a = list(self.a.keys())
        PiProd = lambda ζ: reduce(operator.mul, internalf(ζ, a, self.α))
        
        I = []
        for i in range(self.N):
            ζ = lambda u: (a[i+1]-a[i])*u/2 + (a[i+1]+a[i])/2
            for j in range(self.N):
                denom = lambda j: (ζ(j)-a[j])**self.α[j]
                
            integral = -1
            I.append(integral)
        #find accessory parameters a_{j} for j = 1, 2, ..., N - 1
        
        #sub any vertex of polygon and corresponding z plane
        '''
        self.c1 = z_i / int_{0}^{a_i} Pi_{j=1}^{N-1} (ζ - a_j)^a_{j-1} d-ζ        
        '''
        return I
    
    def piProd(self, iterable):
        return reduce(operator.mul, iterable)

    def gaussJacobiQuad(self, func, α = -0.1, β = -0.1, n = 10):
        result = special.j_roots(n, α, β)
        points, weights = result[0], result[1]
        return sum([weights[i]*func(points[i]) for i in range(n)])
    
    def getSLFirstDerivative(self, i, a, h=0.01):
        return ( i*(a-2*h) - (8*i)*(a-h) + (8*i)*(a+h) - i*(a+2*h) )/(12*h)
        
    def calc(self):
        #input params into sc integral
        return -1
            
    def __str__(self):
        return str(self.polygon)
    
    
    
# method for finding integral for (1-x)^-0.5 * (1+x)^-0.6 * (1+x^2)
 
'''
f2 = lambda x: 1 + x**2 

result = special.j_roots(10,-0.5,-0.6)

points, weights = result[0], result[1]

integral = 0
for i in range(10):
    integral += weights[i] * f2(points[i])
    
print(integral)
'''

'''
Isubaux1 = lambda i: (a[i + 1] - a[i]) ** (1 - b[i] - b[i + 1]) / 2
Isubaux2 = lambda j: lambda i: lambda x: 1 / ((a[i + 1] - a[i]) * x / 2 + (a[i + 1] + a[i]) / 2 - a[j])
Iaux = Isubaux1
for j in range(self.N):
    if j != i and j != i + 1:
        Iaux *= Isubaux2(j)
I[i] = gaussJacobiQuad(Iaux(i), -b[i+1], -b[i])
'''


