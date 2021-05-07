#------------------------------------------------------------------
#
#   Schwarz-Christoffel Conformal Mapping Algorithm
#   written by Zane Fadul: zef211@nyu.edu
#
#   Alogrithm written as part of NYU Shanghai 2021 CS
#   Capstone, with partner Andrew Liu creating Front End Web-App
#
#------------------------------------------------------------------

import debugpy
import numpy as np
import copy
import matplotlib
import matplotlib.pyplot as plt
import math
from polygon import Polygon
from numpy.linalg import LinAlgError
import scipy.linalg
from scipy import special
import scipy.integrate as integrate
from scipy.optimize import newton

class SchwarzChristoffel: 
  def __init__(self, vertices):
    self.polygon = Polygon(vertices)
    self.A = None
    self.β = None
    self.aMappedPolys = self.polygon.vertices
    self.c1 = None
    self.c2 = None

  def getParameters(self):
    attempts = 0
    vertices = [(vertex.x, vertex.y) for vertex in self.polygon.vertices]
    
    while True:
      polygon = Polygon(vertices)
      try:
        sc_accessories = SchwarzChristoffelAccessories(polygon)
        sc_accessories, I = sc_accessories.getParameters()

        for a in sc_accessories:
          if type(a) == complex:
            raise Exception

        break
      except Exception as e:
        print(e)
        head = vertices[-1]
        for v in range(len(vertices) - 1, 0, -1):
          vertices[v] = vertices[v - 1]
        vertices[0] = head
        attempts += 1
      if attempts >= len(vertices):
        print("Solution not found...")
        return

    self.A = sc_accessories
    self.I = I
    self.polygon = polygon
    self.β = [float(polygon.extAngles[i]) / np.pi for i in range(len(polygon.extAngles))]

    # Rotating betas counter-clockwise by one
    head = self.β[-1]
    for b in range(len(self.β)-1, 0, -1):
      self.β[b] = self.β[b-1]
    self.β[0] = head



  #complex quadrature code thanks to dr jimbob on stack overflow, plus some tweaks
  def complexQuadrature(self, func, a, b):
    def real_func(x):
        return scipy.real(func(x))
    def imag_func(x):
        return scipy.imag(func(x))
    real_integral = integrate.quad(real_func, a, b)
    imag_integral = integrate.quad(imag_func, a, b)
    return real_integral[0] + 1j*imag_integral[0]

  #====================================================================================================
  # _calcC1()
  # parameters: None
  # return: None
  # desc: solves for C1
  #====================================================================================================
  def _calcC1(self):
    if self.A is None: raise Exception("Need to find parameters first")
    z_1 = self.polygon.vertices[0].zcoord
    z_2 = self.polygon.vertices[1].zcoord
    
    r1 = self.polygon.lines[0].length / self.I[0]
    η1 = np.angle(z_2 - z_1) #TO DO: NEED TO CHECK CORNER CASE FOR N > 0, N < 0 FOR FORM M+Ni
    θ1 = η1 + (math.pi * sum([self.β[i] for i in range(1,len(self.β))]) )
    c1 = r1 * (math.cos(θ1) + 1j * math.sin(θ1))
    self.c1 = c1
  
  #====================================================================================================
  # _calcC2()
  # parameters: None
  # return: None
  # desc: solves for C2
  #====================================================================================================
  def _calcC2(self):
    if self.A is None: raise Exception("Need to find parameters first")
    
    def PiProdTerm(a_i, β_i):
        return lambda ζ: (ζ-a_i)**(β_i)
    
    terms = []
    for i in range(len(self.A)):
      terms.append(PiProdTerm(self.A[i], self.β[i]))

    def integralFunc(ζ, termIndex=0):
      if termIndex == len(terms) - 1:
        return ( 1 / terms[termIndex](ζ) )
      result = ( 1 / terms[termIndex](ζ) ) * integralFunc(ζ, termIndex + 1)
      return result

    z_1 = self.polygon.vertices[0].zcoord
    c2 = z_1 + (self.c1 * self.complexQuadrature(integralFunc, self.A[0], 0))

    self.c2 = c2

  #====================================================================================================
  # 
  # parameters:
  #   z: imaginary point
  # return: 
  # desc: 
  #====================================================================================================
  def forwardMap(self, z):
    if self.c1 is None:
      self._calcC1()
    if self.c2 is None:
      self._calcC2()
      
    #Calc imaginary part of integral
    img_z = scipy.imag(z)
    def PiProdTerm(a_i, β_i):
      return lambda ζ: (1j*ζ-a_i)**(β_i)
    
    terms = []
    for i in range(len(self.A)):
      terms.append(PiProdTerm(self.A[i], self.β[i]))

    def imaginaryIntegralFunc(ζ, termIndex=0):
      if termIndex == len(terms) - 1:
        return ( 1 / terms[termIndex](ζ) )
      result = ( 1 / terms[termIndex](ζ) ) * imaginaryIntegralFunc(ζ, termIndex + 1)
      return result

    γ = 1j * self.complexQuadrature(imaginaryIntegralFunc, 0,img_z)

    #Calculate real part of integral
    def PiProdTerm(a_i, β_i):
      return lambda ζ: (ζ+1j*img_z-a_i)**(β_i)
    
    terms = []
    for i in range(len(self.A)):
      terms.append(PiProdTerm(self.A[i], self.β[i]))

    def realIntegralFunc(ζ, termIndex=0):
      if termIndex == len(terms) - 1:
        return ( 1 / terms[termIndex](ζ) )
      result = ( 1 / terms[termIndex](ζ) ) * realIntegralFunc(ζ, termIndex + 1)
      return result

    realTerm = self.complexQuadrature(realIntegralFunc, 0, scipy.real(z))

    #Map this point and perform transformation
    point = ( self.c1 * (γ + realTerm) ) + self.c2
    return point

  def graphPoly(self, ax=None):
    if ax is None:
      fig, ax = plt.subplots()
    x = [vertex.x for vertex in self.polygon.vertices]
    y = [vertex.y for vertex in self.polygon.vertices]
    x.append(self.polygon.vertices[0].x)
    y.append(self.polygon.vertices[0].y)
    ax.plot(x, y)
    return ax

  def graphFlowLines(self, complexPoints, ax=None):
    if ax is None:
      fig, ax = plt.subplots()
    mappedx = []
    mappedy = []
    for point in complexPoints:
      mappedx.append(np.real(point))
      mappedy.append(np.imag(point))
    ax.plot(mappedx, mappedy)
    return ax

  def diskToPlane(self,W):
    return 1j * ((1 + W) / (1 - W))
    
  def generateCirclePoints(self, r = 0):
    points = list(np.arange(0, 2*math.pi, 0.02))
    for i in range(len(points)):
      mapPointToComplex = lambda theta: r * math.e ** (1j * theta)
      cirleComplexPoint = mapPointToComplex(points[i])
      planeComplexPoint = self.diskToPlane(cirleComplexPoint)
      points[i] = self.forwardMap(planeComplexPoint)
    return points

  def generateLinePoints(self, theta):
    points = list(np.arange(-0.999, 0.999, 0.01))
    for i in range(len(points)):
      mapPointToComplex = lambda r: r * math.e ** (1j * theta)
      lineComplexPoint = mapPointToComplex(points[i])
      planeComplexPoint = self.diskToPlane(lineComplexPoint)
      points[i] = self.forwardMap(planeComplexPoint)
    return points

  def rangeToPi(self):
    return list(np.arange(0, math.pi, 0.4))





class SchwarzChristoffelAccessories:
  def __init__(self, polygon):
    self.N = len(polygon.vertices)
    self.A = self.approximateRealMapping()
    self.β = [float(polygon.extAngles[i]) / np.pi for i in range(len(polygon.extAngles))]

    # Rotating betas counter-clockwise by one
    head = self.β[-1]
    for b in range(len(self.β)-1, 0, -1):
      self.β[b] = self.β[b-1]
    self.β[0] = head

    self.λ = [polygon.lines[i].length / polygon.lines[0].length for i in range(1, len(polygon.lines))]
    self.F = self.setF()

    #print(self.λ)

  #====================================================================================================
  # approximateRealMapping()
  # parameters: None
  # return: list of a's
  # desc: sets all points on the real axis, including setting a_0 and a_1 as fixed points -1 and 1,
  #       and arbitrarily incrementing values from 2 to N-1
  #====================================================================================================
  def approximateRealMapping(self):
    A = [-1, 1]
    for n in range(2, self.N):
      A.append(n)
    return A

  #====================================================================================================
  # setF()
  # parameters: None
  # return: list of functions 
  # desc: sets up system of equations in form f(I) = I_i - λ_i-1 * I_l
  #==================================================================================================== 
  def setF(self):
    F = []
    def f(i):
      def _f(I):
        return I[i] - self.λ[i-1] * I[0] 
      return _f
    for i in range(1, self.N-1):
      F.append(f(i))
    return F
  
  #====================================================================================================
  # gaussJacobiQuad()
  # parameters:
  #   func: function of x representing interior part of integral from -1 to 1, excluding weight function
  #   α: alpha for gaussJacobi weight function
  #   β1: beta for gaussJacobi weight function
  #   n: number of points for riemanns approximation of integral
  # return: float
  # desc: Gauss Jacobi quadrature from -1 to 1 of function func
  #====================================================================================================
  def gaussJacobiQuad(self, func, α, β1, n=10):
    result = special.j_roots(n, α, β1)
    points, weights = result[0], result[1]
    return sum([weights[m]*func(points[m]) for m in range(n)])

  #====================================================================================================
  # calcIntegrals()
  # parameters:
  #   A: list of points on real axis
  # return: list of I values (integrals between those a's)
  # desc: calculates each I given a list of a values
  #====================================================================================================
  def calcIntegrals(self, A):
    I = []
    for ISub in range(self.N-1):
      I.append(self.calcSingleI(A, ISub))
    return I

  #====================================================================================================
  # calcSingleI()
  # parameters:
  #   A: list of points on real axis
  #   ISub: index of the I value to be calculated
  # return: float
  # desc: creates a portion of the integral's func(x) determined with conditional terms based on
  #       the index of I, calculates using an auxillery recursive function
  #====================================================================================================
  def calcSingleI(self, A, ISub):
    terms = []
    staticTermExponent = 1 - self.β[ISub] - self.β[ISub + 1]
    staticTerm = ( pow( (A[ISub + 1] - A[ISub]) / 2 , staticTermExponent ) )
    def conditionalTerm(termNum, ISub):
      def innerTerm(x):
        t1 = x * ((A[ISub+1] - A[ISub]) / 2) 
        t2 = ((A[ISub+1] + A[ISub]) / 2)
        t3 = A[termNum]
        exp = self.β[termNum]
        return 1 / ( pow(abs(t1 + t2 - t3), exp) )
      return innerTerm
        
    for termNum in range(len(A)):
      if termNum != ISub and termNum != ISub + 1:
          terms.append(conditionalTerm(termNum, ISub))

    α = -self.β[ISub + 1]
    β1 = -self.β[ISub]
    return self.calcSingleIAux(A, staticTerm, terms, α, β1)

  def calcSingleIAux(self, A, staticTerm, terms, α, β1):
    def innerIntegralFunc(x, termIndex=0):
      if termIndex == len(terms) - 1:
          return terms[termIndex](x)
      result = terms[termIndex](x) * innerIntegralFunc(x, termIndex + 1)
      return staticTerm * result
    return self.gaussJacobiQuad(innerIntegralFunc, α, β1)

  #====================================================================================================
  # generateJacobiMatrix()
  # parameters:
  #   A: list of points on real axis
  #   I: list of integrals between a's
  # return: matrix
  # desc: calculates jacobi matrix based on the first derivatives of I's with respect to a's
  #====================================================================================================
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

    #create Numpy objects
    derivativeMatrix = np.matrix(derivativeMatrix)
    derivativeColumn = np.matrix(derivativeColumn)
    λ = np.matrix(self.λ[:-1]).T
    
    rightTerm = λ*derivativeColumn
    J = derivativeMatrix - rightTerm
    return J

  #====================================================================================================
  # calcSLFirstDerivative()
  # parameters:
  #   A: list of points on real axis
  #   δISub: index of I
  #   δaSub: index of a
  #   h: modifier, default 0.001
  # return: float
  # desc: slightly alters current list of a's at index δaSub, and uses approximation of five-point
  #       Langrange differential formula to calculate the first derivative of side length I wrt a
  #====================================================================================================
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

  #====================================================================================================
  # paramsValidated()
  # parameters:
  #   A: list of points on real axis
  #   APrev: list of points (from last iteration) on real axis
  #   acceptableError: float
  # return: bool
  # desc: checks if a values are converging to their respective solutions
  #====================================================================================================
  def paramsValidated(self, A, APrev, acceptableError=10 ** -5):
    if A is None or APrev is None: return False
    for k in range(len(A)):
      if abs(A[k] - APrev[k]) > acceptableError: return False
    return True
  
  #====================================================================================================
  # getParameters()
  # parameters: None
  # return: None
  # desc: returns a tuned list a values using newton raphson method iteratively,
  #       (currently maps directly from real axis to shape)
  #====================================================================================================
  def getParameters(self):
    A = self.A
    APrev = None

    As = []    
    I_ratios = []

    iter_counter = 0

    while not self.paramsValidated(A, APrev):
      APrev = A.copy()
      I = self.calcIntegrals(A)
      F = [func(I) for func in self.F]
      J = self.generateJacobiMatrix(A, I)
      invJ = scipy.linalg.inv(J)

      AVect = np.matrix(A[2:]).T
      F = np.matrix(F).T
      rightTerm = invJ * F
      AVect = AVect - rightTerm

      A = self.A[:2]
      
      for aSub in range(len(AVect)):
        A.append(AVect.item(aSub))

      iter_counter += 1
      As.append(A)

      I_ratio = []
      for i in range(1, self.N - 1):
        I_ratio.append(I[i] / I[0])
      I_ratios.append(I_ratio)

      if iter_counter > 200:
        raise Exception("Taking too long")

    # t = np.arange(0, iter_counter, 1)
    # fig, ax = plt.subplots()
    # #ax.plot(t, As, color="green")
    # ax.hlines(self.λ[:-1], 0, iter_counter, linewidth=5, alpha=0.5, color="blue", linestyle="dashed", label="Target λ")
    # ax.plot(t, I_ratios, color="#FA605A", linewidth=5, alpha=0.5)
    # ax.set(xlabel='iterations', ylabel='I Ratios')
    # ax.grid()
    # plt.show()
    return A, I

