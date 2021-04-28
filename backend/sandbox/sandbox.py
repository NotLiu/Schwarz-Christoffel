#!/usr/bin/env python
# coding: utf-8
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from polygon import Polygon
from schwarzchristoffel import SchwarzChristoffel


# letters = ["a", "b", "c", "d"]

# printLetterNTimes = lambda letter: lambda n: letter * n
# letterTerms = []
# for letter in letters:
#   letterTerms.append(printLetterNTimes(letter))


# def innerLetterIterator(n, letterIndex=0):
#   if letterIndex == len(letterTerms) - 1:
#     return letterTerms[letterIndex](n)
#   return letterTerms[letterIndex](n) + innerLetterIterator(n, letterIndex + 1)

# print(innerLetterIterator(10))













class SCTest:
  def __init__(self, testRange):
    fourSides = None
    resultsFile = open('results.txt', 'w')
    didntConverge = []
    for x in range(testRange):
      fourSides = [
        (0, 0),
        (testRange - x, testRange // 2),
        (0, testRange),
        (-testRange, testRange//2)
      ]
      sc = SchwarzChristoffel(Polygon(fourSides))
      data = sc.getParameters()
      t = np.arange(0, data[0], 1)
      fig, ax = plt.subplots()
      ax.plot(t, data[2])
      ax.set(title=f'mapping for polygon#{x}', xlabel='iterations', ylabel='As')
      ax.grid()
      plt.savefig(f'polygon_{x}')
      
      resultsFile.write(f'Results for polygon #{x}: {fourSides} ')
      if data[0] > 1000:
        didntConverge.append(x)
        print(didntConverge)
        resultsFile.write(f"\tDID NOT CONVERGE")
      resultsFile.write('\n')
      resultsFile.write(f'\tBetas:\n\t{sc.β}\n\tLambda:\n\t{sc.λ}\n\tI_ratios:\n\t{data[1]}')
      resultsFile.write('\n\n')

    resultsFile.write(f"did not converge: {didntConverge}")
    resultsFile.close()

square = Polygon([
    (0,0),
    (1,0),
    (2,1),
    (0,1)
    ], True)



test = Polygon([
    (0,0),
    (2,3),
    (5,3),
    (7,0),
    (2,-3)
    ])

test2 = Polygon([
    (0,0),
    (2,2),
    (0,4),
    (2,5),
    (4,4),
    (4,3),
    (3,3),
    (3,2),
    (4,2),
    (4,0)
    ])

test3 = Polygon([
    (0,0),
    (1,1),
    (0,2),
    (-1,1),
    (-1,0),
    (-2,0),
    (-2,2),
    (-1,2),
    (0,3),
    (1,2),
    (2,2),
    (2,0)
    ])

test3list = [
    (0,0),
    (2,2),
    (0,4),
    (-2, 2),
    (-2, 0),
    (0, -1),
    (1, -1)
    ]

test3 = Polygon(test3list, True)

test4 = Polygon([
    (0,0),
    (-1,1),
    (-1,2),
    (0,2),
    (0,3),
    (-2,3),
    (-2,0)
    ], True)

test5 = Polygon([
    (0, 0),
    (2, 0),
    (2, 1),
    (1.0, 1),
    (0, 1)
])

test6 = Polygon([
    (0, 0),
    (2, 0),
    (2.5, 2),
    (1, 2),
    (.5, 3),
    (-1, 3),
])

test7 = Polygon([
  (0, 0),
  (2, 5),
  (1, 9),
  (-3, 2),
  (-2, -4)
])

test8 = Polygon([
  (0, 0),
  (1, 0),
  (1, 1),
  (2, 2),
  (0, 2),
  (-1, 1),
  (-1, -1)
])

test9 = Polygon([
  (0, 0),
  (1, 0),
  (2, 1),
  (3, 1),
  (3, 2),
  (2, 2),
  (1, 1),
  (0.5, 1),
])
sc = SchwarzChristoffel(test9)
sc.getParameters()

# scTest = SCTest(100)
# print("Let's input some vertices:")
# vertexList = []
# cmd = ''
# while cmd != 'done':
#     cmd = input('input a vertex in counter-clockwise order (e.g. 0,1), otherwise "done":')
#     if cmd == 'done': break
#     else:
#         cmd = cmd.split(',')
#     vertexList.append((float(cmd[0]), float(cmd[1])))

# shape = Polygon(vertexList)

# sc = SchwarzChristoffel(shape)
# sc.getParameters()
