# -*- coding: utf-8 -*-

import operator
import numpy as np
from numpy.linalg import LinAlgError
from scipy import special
from scipy.optimize import newton
from functools import reduce
import debugpy

class SchwarzChristoffel:
    def __init__(self, polygon):

        #Polygon object, with vertices, lines, and angle nested objects
        self.polygon = polygon

        #Number of vertices
        self.N = len(polygon.vertices)

        #Points on the ζ-plane, using -1 and 1 as our two initial guesses and mapping the rest in increments of 1
        self.a = self.approximateRealMapping()

        #exterial angles within -1 and 1
        self.β = [float(self.polygon.extAngles[i]) /
                  np.pi for i in range(len(self.polygon.extAngles))]
        
        self.c1 = 1
        self.c2 = 0

        #column vector of length ratios of all sides with respect to initial two guesses a{0} and a{1}'s z plane distances        
        self.λ = [self.polygon.lines[i - 1].length / self.polygon.lines[0].length
                  for i in range(1, len(self.polygon.lines) - 1)]
        #self.λ = np.reshape(self.λ, (len(self.λ), 1))
        print(self.λ)

        #list of functions in the form I_{i} - λ_{i}*I{l} = 0, where l is our first initial guess. in this case, l = 0, since our guesses are a_{0} and a_{1}
        self.F = self.setF()
        
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

    # def findIConstant(self, a, i):
    #     result = ((a[i + 1] - a[i]) / 2) ** (1 - self.β[i] - self.β[i + 1])
    #     return result

    # def findI_JTerm(self, a, i, j): return lambda i: lambda x: 1 / \
    #     (abs(( (((a[i + 1] - a[i]) * x) / 2) + ((a[i + 1] + a[i]) / 2) - a[j])) ** self.β[j])
    
    # def findI(self, a, i, terms): return lambda x: self.findIConstant(
    #     a, i) * self.findIAux(1, x, i, terms, len(terms) - 1) 
    
    # def findIAux(self, result, x, i, terms, index): return result * self.findIAux(result, x, i, terms, index - 1) if index >= 0 else terms[index](i)(x)

    # def calcI(self, a=None, aDirIndex=None, hModifier=0):

    #     I = [None for i in range(self.N - 1)]
    #     a = list(self.a.keys()) if a is None else a[:]
        
    #     if aDirIndex is not None:
    #         a[aDirIndex] = a[aDirIndex] + hModifier

    #     for i in range(self.N - 1):
    #         terms = []
    #         for j in range(self.N - 1):
    #             if j != i and j != i + 1:
    #                 terms.append(self.findI_JTerm(a, i, j))
    #         α = -self.β[i]
    #         β = -self.β[i+1]
    #         I[i] = self.gaussJacobiQuad(self.findI(a, i, terms), α, β)
    #     print(I)
    #     return I

    def calcI(self, a):
        debugpy.breakpoint()
        I = [None for i in range(self.N - 1)]
        a = a.copy()

        debugpy.breakpoint()
        for i in range(1, self.N):
            #getting terms
            terms = []
            staticTerm = ((a[i] - a[i-1]) / 2) ** (1 - self.β[i-1] - self.β[i])
            for n in range(self.N):
                if n != i and n != i + 1:
                    terms.append(
                        lambda x: 1 / ( abs( x * ((a[i] - a[i-1]) / 2) + ((a[i] + a[i-1]) / 2) - a[n] ) ** self.β[n] )
                    )

            α = -self.β[i]
            β = -self.β[i-1]
            I[i-1] = self.calcIAux(a, staticTerm, terms, α, β)
        return I
                    
    def calcIAux(self, a, staticTerm, terms, α, β):

        def innerIntegralFunc(x, termIndex=0):
            #debugpy.breakpoint()
            if termIndex == len(terms) - 1:
                #print("static term", staticTerm)
                return staticTerm * terms[termIndex](x)
                #print("current term: ",terms[termIndex(x)])
            return terms[termIndex](x) * innerIntegralFunc(x, termIndex + 1)
        
        return self.gaussJacobiQuad(innerIntegralFunc, α, β)
        
    def setF(self):
        F = []
        def f(i):
            return lambda I: I[i] - self.λ[i-1] * I[0]
        for i in range(1, self.N-1):
            F.append(f(i))
        return F

    def getParameters(self):
        a_keys = list(self.a.keys())
        aPrev_keys = None
        values = list(self.a.values())

        while not self.validateParams(a_keys, aPrev_keys):  #newton raphson
            debugpy.breakpoint()
            I = self.calcI(a_keys)
            debugpy.breakpoint()
            F = np.reshape([func(I) for func in self.F], (len(self.F), 1))
            J = self.generateJacobiMatrix(I, a_keys)
            invJ = self.getInverseMatrix(J)

            aPrev_keys = a_keys
            a_keys, aPrev_keys = a_keys[:], aPrev_keys[:]
            
            a_keys_vector = np.reshape(a_keys[2:], (len(a_keys[2:]), 1))
            rightTerm = np.matmul(invJ, F)
            debugpy.breakpoint()
            a_keys_vector = a_keys_vector - rightTerm
            a_keys = [ key for key in aPrev_keys[:2]]
            for aIndex in range(len(a_keys_vector)):
                a_keys.append(a_keys_vector.item((aIndex, 0)))

        self.a = {}

        for aIndex in range(len(a_keys)):
            self.a[float(a_keys[aIndex])] = values[aIndex]


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

    def generateJacobiMatrix(self, I, a):
        debugpy.breakpoint()
        column = []
        # Create Jacobi matrix
        for iVal in range(1, self.N - 1):
            row = []
            for aDirIndex in range(2, self.N):
                print(f'calculating dI_{iVal}/da_{aDirIndex}')
                row.append(self.calcSLFirstDerivative(a, iVal, aDirIndex))
            column.append(row)
        derivativeMatrix = np.reshape(column, (len(row), len(column)))
        
        derivativeColumn = []
        for aDirIndex in range(2, self.N):
            
            derivativeColumn.append(self.calcSLFirstDerivative(a, 0, aDirIndex))

        print(self.λ, "\n", derivativeColumn)
        rightTerm = np.reshape(self.λ, (len(self.λ), 1)) * derivativeColumn
        print(rightTerm)
        J = np.subtract(derivativeMatrix, rightTerm)
        print(f'J: {J}')
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

    def gaussJacobiQuad(self, func, α, β, n=10):
        result = special.j_roots(n, α, β)
        points, weights = result[0], result[1]
        return sum([weights[m]*func(points[m]) for m in range(n)])

    def calcSLFirstDerivative(self, a, iVal, aDirIndex, h=0.01):
        #match the equation:
        # ðIk/ðai ~ [Ik(ai - 2h) - 8Ik(ai-h) + 8Ik(ai + h) - Ik(ai + 2h)]/12h

        a1 = a[:]
        a1[aDirIndex] += - 2 * h
        term1 = self.calcI(a1) #[iVal]
        
        a2 = a[:]
        a2[aDirIndex] += - h
        term2 = self.calcI(a2) #[iVal]
        
        a3 = a[:]
        a3[aDirIndex] += h
        term3 = self.calcI(a3) #[iVal]
        
        a4 = a[:]
        a4[aDirIndex] += 2 * h
        term4 = self.calcI(a4) #[iVal]

        print(f'a1:{a1}\na2:{a2}\na3:{a3}\na4:{a4}')
        print(f't1 {term1}\nt2 {term2}\nt3 {term3}\nt4 {term4}\n')
        result = (term1 - 8 * term2 + 8 * term3 - term4) / (12 * h)
        print(f'result: {result}')
        return result

    def calc(self):
        # input params into sc integral
        return -1

    def __str__(self):
        return str(self.polygon)
