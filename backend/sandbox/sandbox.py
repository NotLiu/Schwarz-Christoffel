#!/usr/bin/env python
# coding: utf-8
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from polygon import Polygon
from schwarzchristoffel import SchwarzChristoffel

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

square = [
    (0,0),
    (1,0),
    (1,1),
    (0,1)
    ]

test = Polygon([
    (0,0),
    (2,3),
    (5,3),
    (7,0),
    (2,-3)
    ])

test2 = [
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
    ]

test3 = [
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
    ]

test3list = [
    (0,0),
    (2,2),
    (0,4),
    (-2, 2),
    (-2, 0),
    (0, -1),
    (1, -1)
    ]


test4 = Polygon([
    (0,0),
    (-1,1),
    (-1,2),
    (0,2),
    (0,3),
    (-2,3),
    (-2,0)
    ], True)

test5 = [
    (0, 0),
    (2, 0),
    (2, 1),
    (1.0, 1),
    (0, 1)
]

test6 = Polygon([
    (0, 0),
    (2, 0),
    (2.5, 2),
    (1, 2),
    (.5, 3),
    (-1, 3),
])

test7 = [
  (0, 0),
  (2, 5),
  (1, 9),
  (-3, 2),
  (-2, -4)
]

test8 = [
  (0, -2),
  (1,-1),
  (0, 0),
  (1, 0),
  (1, 1),
  (2, 2),
  (0, 2),
  (-1, 1),
  (-1, -1)
]

test9 = [
  (0.6, 1),
  (0, 0),
  (1, 0),
  (2, 1),
  (3, 1),
  (3, 2),
  (2, 2),
]

test10 =[
  (0, 0),
  (1, 0),
  (2, 1),
  (-1, 1)
]

# sc = SchwarzChristoffel([
#   (0, 0),
#   (1, 0),
#   (2, 1),
#   (0, 2),
#   (0, 3),
#   (-2, 3),
#   (-2,1)
# ])

test11 = [
    (2.81, 0.95),
    (5.23, 0.01),
    (7.48, 1.32),
    (7.86, 3.89),
    (6.09, 5.80),
    (3.49, 5.59),
    (2.03, 3.44)
]

test12 = [
  (0, 0),
  (1, 0),
  (1, 4),
  (0, 5),
  (-1, 2)
]

test13 = [
  (0, 0),
  (1, 0),
  (1, 1),
  (2, 1),
  (2, 2),
  (0, 2)
]

test14 = [
  (0, 0),
  (4, 0),
  (3, 1),
  (4, 2),
  (0, 2)
]

test14_90degrees = [
  (0, 0),
  (2, 0),
  (2, 4),
  (1, 3),
  (0, 4)
]

test15 = [
  (0, 0),
  (4, 0),
  (3, 1),
  (3, 5),
  (1, 5),
  (1, 1)
]

test16 = [
  (3.91, 0.20),
  (6.88, 0.66),
  (7.97, 3.46),
  (6.09, 5.80),
  (3.12, 5.34),
  (5.35, 3.11),
]
test17 = [
  (3.91, 0.20),
  (6.88, 0.66),
  (7.97, 3.46),
  (6.09, 5.80),
  (4.23, 2.19),
  (1.79, 6.34),
]

test18 = [
  (2.48, 1.38),
  (7.17, 1.39),
  (5.543, 2.24),
  (6.09, 5.80),
  (4.81, 1.66),
  (2.48, 1.38)
]

test19 = [
  (4.20, 1.90),
  (8, 2.83),
  (3.00, 3.72),
  (4.19, 4.09),
  (1.05, 1.83)
]

test20 = [
  (0, 0),
  (2, 0),
  (2, 1),
  (3, 1),
  (3, 2),
  (1, 2),
  (1, 1),
  (0,1)
]

test21 = [
  (-1.79, 6.16),
  (4.24, 3.37),
  (3.61, 8.06),

]

test22 = [
  (4.77, 2.31),
  (7.11, 3.40),
  (6.92, 5.04),
  (4.37, 3.15),
  (2.48, 1.38)
]
sc = SchwarzChristoffel(test22)
sc.getParameters()
ax = sc.graphPoly()
sc.getFlowLines()
sc.graphFlowLines(ax)
#sc.upperHalfPlaneTest(7.049, ax)

plt.show()

