# -*- coding: utf-8 -*-

import operator
import numpy as np
from numpy.linalg import LinAlgError
from scipy import special
from scipy.optimize import newton
from functools import reduce

class SchwarzChristoffel:
    def __init__(self, polygon):
        self.polygon = polygon
        self.N = len(polygon.vertices)
        self.a = self.approximateRealMapping()
        self.α = [float(self.polygon.extAngles[i])/np.pi for i in range(len(self.polygon.extAngles))]
        self.β = [1 - self.α[i] for i in range(len(self.α))]
        self.c1 = 1
        self.c2 = 0
        self.λ = [self.polygon.lines[i + 1].length / self.polygon.lines[0].length \
            for i in range(len(self.polygon.lines) - 1)]
        self.F = self.setF()
        
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
    
    def setI(self, n = 100):
        I = [None for i in range(self.N - 1)]
        a = list(self.a.keys())
        β = self.β
        Isubaux1 = lambda i: (a[i + 1] - a[i]) ** (1 - β[i] - β[i + 1]) / 2
        Isubaux2 = lambda j : lambda i : lambda x : 1 / ((a[i + 1] - a[i]) * x / 2 + (a[i + 1] + a[i]) / 2 - a[j]) ** β[i]
        Isubsubaux1 = lambda result, x, terms, i: result * Isubsubaux1(result, x, terms, i - 1) if i > 0 else result
        Iaux = lambda i: lambda x: Isubaux1(i) * Isubsubaux1(1, x, terms, len(terms))
        for i in range(self.N - 1):
            terms = [Isubaux1]
            for j in range(self.N - 1):
                if j != i and j != i + 1:
                    terms.append(Isubaux2(j))
            _α = -β[i + 1]
            _β = -β[i]
            I[i] = self.gaussJacobiQuad(Iaux(i), _α, _β, n)
        
        return I
    
    def setF(self):
        F = []
        for f in range(self.N - 1):
            f = lambda I: I[f + 1] - self.λ[f + 1] * I[f]
            F.append(f)
        return F

    def getParameters(self):
        J = self.generateJacobiMatrix(self.setI())
        invJ = self.getInverseMatrix(J)
        print(J, invJ)
        
    def getInverseMatrix(self, matrix):
        inv = matrix
        try:
            inv = np.linalg.inv(matrix)
        except LinAlgError as e:
            if str(e) == "Singular matrix":
                inv = matrix
            else:
                raise e
        return inv

    def generateJacobiMatrix(self, I):
        column = []
        a = list(self.a.keys())
        #Create Jacobi matrix
        for i in range(len(I)):
            row = []
            for j in range(self.N - 1):
                #dI_{i}/da_{j}
                row.append(self.calcSLFirstDerivative(I[i], a[j]))
            column.append(row)
        J = np.subtract(np.matrix(column), \
             np.matrix(self.λ) * np.matrix([self.calcSLFirstDerivative(I[0], a[i]) for i in range(self.N - 1)]).T)
        return J

    # def getSideLengths(self, n=100):
    #     #newton raphson
    #     print('Finding Parameters')

    #     internalf = lambda ζ, a, α: [ζ - a[j]**(α[j]-1) for j in range(self.N-1)]
    #     a = list(self.a.keys())
    #     PiProd = lambda ζ: reduce(operator.mul, internalf(ζ, a, self.α))
        
    #     I = []
    #     for i in range(self.N):
    #         ζ = lambda u: (a[i+1]-a[i])*u/2 + (a[i+1]+a[i])/2
    #         for j in range(self.N):
    #             denom = lambda j: (ζ(j)-a[j])**self.α[j]
                
    #         integral = -1
    #         I.append(integral)
    #     #find accessory parameters a_{j} for j = 1, 2, ..., N - 1
        
    #     #sub any vertex of polygon and corresponding z plane
    #     '''
    #     self.c1 = z_i / int_{0}^{a_i} Pi_{j=1}^{N-1} (ζ - a_j)^a_{j-1} d-ζ        
    #     '''
    #     return I
    
    def validateParams(self):
        for f in self.F:
            for i in range(self.N - 1):
                if f(i) != 0:
                    print("NOPE NO CAN DO")
    def piProd(self, iterable):
        return reduce(operator.mul, iterable)

    def gaussJacobiQuad(self, func, α = -0.1, β = -0.1, n = 10):
        result = special.j_roots(n, α, β)
        points, weights = result[0], result[1]
        return sum([weights[x]*func(points[x]) for x in range(n)])
    
    def calcSLFirstDerivative(self, i, a, h=0.01):
        return ( i*(a-2*h) - (8*i)*(a-h) + (8*i)*(a+h) - i*(a+2*h) )/(12*h)
        
    def calc(self):
        #input params into sc integral
        return -1
            
    def __str__(self):
        return str(self.polygon)

