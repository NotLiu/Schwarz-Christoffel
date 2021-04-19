import debugpy
import numpy as np
import copy

from numpy.linalg import LinAlgError
from scipy import special
from scipy.optimize import newton

class SchwarzChristoffel:
  def __init__(self, polygon):
    self.N = len(polygon.vertices)
    self.A = self.approximateRealMapping()
    self.aMappedPolys = polygon.vertices
    self.c1 = 1
    self.c2 = 0
    self.β = [float(polygon.extAngles[i]) / np.pi for i in range(len(polygon.extAngles))]

    head = self.β[-1]
    for b in range(len(self.β)-1, 0, -1):
      self.β[b] = self.β[b-1]
    self.β[0] = head

    #Question regarding inconsistencies within the paper; taking all sides for a paper assuming the polygon isnt closed?
    self.λ = [polygon.lines[i].length / polygon.lines[0].length for i in range(1, len(polygon.lines))]
    self.F = self.setF()
    print(sum(self.β))
    print(f"β: {self.β}\nλ: {self.λ}")

  def approximateRealMapping(self):
    A = [-1, 1]
    for n in range(2, self.N):
      A.append(n)
    return A
  
  def setF(self):
    F = []
    def f(i):
      def _f(I):
        #print(f"Calculating F:\nI = {I}\ncurr_i = {I[i]}\ncurr_lambda = {self.λ[i]}")
        return I[i] - self.λ[i-1] * I[0] 
      return _f
    for i in range(1, self.N-1):
      F.append(f(i))
    return F
  
  def gaussJacobiQuad(self, func, α, β, n=10):
    debugpy.breakpoint()
    result = special.j_roots(n, α, β)
    points, weights = result[0], result[1]
    return sum([weights[m]*func(points[m]) for m in range(n)])

  def calcIntegrals(self, A):
    I = []
    for ISub in range(self.N-1):
      I.append(self.calcSingleI(A, ISub))
    return I

  def calcSingleI(self, A, ISub):
    terms = []
    
    staticTerm = ((A[ISub + 1] - A[ISub]) / 2) ** (1 - self.β[ISub] - self.β[ISub + 1])
    def conditionalTerm(termNum, ISub):
      #print(f"isub: {ISub} b_isub+1: {self.β[ISub+1]}, b_isub: {self.β[ISub]}")
      def innerTerm(x):
        t1 = x * ((A[ISub+1] - A[ISub]) / 2)
        t2 = ((A[ISub+1] + A[ISub]) / 2)
        t3 = A[termNum]
        exp = self.β[termNum]
        return 1 / (abs(t1 + t2 - t3) ** exp)
      return innerTerm
        
    for termNum in range(len(A)):
      if termNum != ISub and termNum != ISub + 1:
          terms.append(conditionalTerm(termNum, ISub))

    α = -self.β[ISub + 1]
    β = -self.β[ISub]
    return self.calcSingleIAux(A, staticTerm, terms, α, β)

  def calcSingleIAux(self, A, staticTerm, terms, α, β):
    def innerIntegralFunc(x, termIndex=0):
        #print(f"termIndex={termIndex}, term = {terms[termIndex](x)}")
        if termIndex == len(terms) - 1:
            return staticTerm * terms[termIndex](x)
        return terms[termIndex](x) * innerIntegralFunc(x, termIndex + 1)
    return self.gaussJacobiQuad(innerIntegralFunc, α, β)

  def generateJacobiMatrix(self, A, I):
    derivativeMatrix = []
    for δISub in range(1, self.N - 1):
      currδIδas = []
      for δaSub in range(2, self.N):
        currδIδas.append(self.calcSLFirstDerivative(A, δISub, δaSub))
      derivativeMatrix.append(currδIδas)
    
    derivativeColumn = []
    for δaSub in range(2, self.N):
      derivativeColumn.append(self.calcSLFirstDerivative(A, 0, δaSub))

    #create numpy objects
    derivativeMatrix = np.matrix(derivativeMatrix)
    derivativeColumn = np.matrix(derivativeColumn)
    λ = np.reshape(np.matrix(self.λ[:-1]), (len(self.λ) - 1, 1))
    
    #print(f"derMat: \n{derivativeMatrix}\n\nderCol:\n{derivativeColumn}\n\nλ:\n{λ}\n")
    J = np.subtract( derivativeMatrix, np.dot(derivativeColumn, λ) )
    return J
  
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

  def calcSLFirstDerivative(self, A, δISub, δaSub, h=0.01):
    terms = []
    termModifiers = [-2 * h, -h, h, 2 * h]
    for termIndex in range(4):
      ACopy = copy.deepcopy(A)
      ACopy[δaSub] += termModifiers[termIndex]
      terms.append(self.calcSingleI(ACopy, δISub))
    
    t1, t2, t3, t4 = terms[0], -8 * terms[1], 8 * terms[2], -terms[3]
    SLFirstDerivative = sum([t1, t2, t3, t4]) / (12 * h)
    return SLFirstDerivative

  def paramsValidated(self, A, APrev, acceptableError = 10 ** -5):
    if A is None or APrev is None: return False
    for k in range(len(A)):
      if abs(A[k] - APrev[k]) > acceptableError: return False
    return True
  
  def getParameters(self):
    A = self.A
    APrev = None

    # I = self.calcIntegrals(self.A)
    # F = [func(I) for func in self.F]
    # J = self.generateJacobiMatrix(self.A, I)
    # invJ = self.getInverseMatrix(J)

    # print(f"I vals for {self.A}:\n\t{I}")
    # print(f"J:\n{J}\ninvJ:\n{invJ}")

    while not self.paramsValidated(A, APrev):
      debugpy.breakpoint()
      APrev = A.copy()
      I = self.calcIntegrals(A)
      F = [func(I) for func in self.F]
      J = self.generateJacobiMatrix(A, I)
      invJ = self.getInverseMatrix(J)
      
      AVect = np.matrix(A[2:]).T
      F = np.matrix(F).T
      rightTerm = invJ * F
      AVect = AVect - rightTerm
      Avect = AVect.T

      A = self.A[:2]
      for aSub in range(len(AVect)):
        A.append(Avect.item(aSub))
      
    print(A)
    print(I)


      # print(f"I vals for {self.A}:\n\t{I}")
      # print(f"J:\n{J}\ninvJ:\n{invJ}")

