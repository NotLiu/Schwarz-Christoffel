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
        self.β = [float(self.polygon.extAngles[i]) /
                  np.pi for i in range(len(self.polygon.extAngles))]
        self.c1 = 1
        self.c2 = 0

        self.λ = [self.polygon.lines[i + 1].length / self.polygon.lines[0].length
                  for i in range(1, len(self.polygon.lines) - 1)]
        self.λ = np.reshape(self.λ, (len(self.λ), 1))

        self.F = self.setF()
        self.δ = []

    def approximateRealMapping(self):
        # map from real axis to z-plane vertices
        # start with -1, 1, ... N + 2, starting from a_3 mappings, last one inf or arbitrary
        vertices = self.polygon.vertices
        mapping = {}
        mapping[-1], mapping[1] = vertices[0], vertices[1]
        for vIndex in range(2, self.N):
            mapping[vIndex] = vertices[vIndex]
        #mapping[float('inf')] = vertices[-1]
        return mapping

    def calcI(self, a = None, aDirIndex = None, hModifier = 0):
        #a is a list here
        I = [None for i in range(self.N - 1)]
        a = list(self.a.keys()) if a is None else a

        if aDirIndex is not None:
            a[aDirIndex] = a[aDirIndex] + hModifier

        def findIConstant(i): return (
            (a[i + 1] - a[i]) / 2) ** (1 - self.β[i] - self.β[i + 1])

        def findI_JTerm(j): return lambda i: lambda x: 1 / \
            abs(((a[i + 1] - a[i]) * x / 2 + (a[i + 1] + a[i]) / 2 - a[j])) ** self.β[j]
        
        def findI(i): return lambda x: findIConstant(
            i) * findIAux(1, x, i, len(terms) - 1)
        
        def findIAux(result, x, i, index): return result * findIAux(result,
                                                                           x, i, index - 1) if index > 0 else terms[index](i)(x)

        for i in range(self.N-1):
            terms = []
            for j in range(self.N - 1):
                if j != i and j != i + 1:
                    terms.append(findI_JTerm(j))
            α = -self.β[i + 1]
            β = -self.β[i]
            I[i] = self.gaussJacobiQuad(findI(i), α, β)

        return I

    def setF(self):
        F = []
        for i in range(-1, len(self.λ)-1):
            def f(I):
                return I[0] - self.λ[i + 1][0] * I[i]
            F.append(f)
        return F

    def getParameters(self):
        a_keys = list(self.a.keys())
        a_keys = np.reshape(a_keys, (len(self.a),1))
        aPrev_keys = None
        values = list(self.a.values())
        
        while not self.validateParams(a_keys, aPrev_keys):
            I = self.calcI(a_keys)
            F = np.reshape([func(I) for func in self.F], (len(self.F),1))
            J = self.generateJacobiMatrix(I)
            invJ = self.getInverseMatrix(J)
            
            
            aPrev_keys = a_keys
            a_keys, aPrev_keys = a_keys[2:], aPrev_keys[2:]
            a_keys = a_keys - np.matmul(invJ, F)

        firstTwo = list(self.a.keys())[:2]
        self.a = {}
        self.a[firstTwo[0]] = values[0]
        self.a[firstTwo[1]] = values[1]

        for aIndex in range(len(a_keys)):
            self.a[float(a_keys[aIndex])] = values[2 + aIndex]

            
                
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
        # Create Jacobi matrix
        for i in range(1, self.N - 1):
            row = []
            for j in range(self.N):
                # dI_{i}/da_{j}
                if j != 0 and j != 1:
                    #row.append(f'{i}{j}')
                    row.append(self.calcSLFirstDerivative(a, i, j))
            column.append(row)
        
        J = np.subtract(np.matrix(column),
                        np.matrix(self.λ) * np.matrix([self.calcSLFirstDerivative(a, 0, i) for i in range(self.N - 1) if i != 0 and i != 1]).T)
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

    #If all δ's are above acceptableError, return True, else false
    def validateParams(self, a=None, aPrev=None, acceptableError=10 ** -5):
        if a is None or aPrev is None: return False
        for k in range(len(a)):
            δ = abs(a[k] - aPrev[k])
            if δ > acceptableError: return False
        return True

    def piProd(self, iterable):
        return reduce(operator.mul, iterable)

    def gaussJacobiQuad(self, func, α, β, n=10):
        result = special.j_roots(n, α, β)
        points, weights = result[0], result[1]
        return sum([weights[x]*func(points[x]) for x in range(n)])

    def calcSLFirstDerivative(self, a, iVal, aDirIndex, h=0.01):
        #match the equation:
        # ðIk/ðai ~ [Ik(ai - 2h) - 8Ik(a-h) + 8Ik(ai + h) - Ik(ai + 2h)]/12h
        term1 = self.calcI(a, aDirIndex, -2 * h)[iVal]
        term2 = 8*self.calcI(a, aDirIndex, -h)[iVal]
        term3 = 8*self.calcI(a, aDirIndex, h)[iVal]
        term4 = self.calcI(a, aDirIndex, 2*h)[iVal]
        return (term1 - term2 + term3 - term4) / 12*h

    def calc(self):
        # input params into sc integral
        return -1

    def __str__(self):
        return str(self.polygon)
