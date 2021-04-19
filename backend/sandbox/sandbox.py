#!/usr/bin/env python
# coding: utf-8

from polygon import Polygon
from schwarzchristoffel import SchwarzChristoffel

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
    (-2,2),
    (-2,0),
    (-4,0),
    (-4,4),
    (-2,4),
    (0,6),
    (2,4),
    (4,4),
    (4,0)
    ]

test3list.reverse()

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

print("Let's input some vertices:")
vertexList = []
cmd = ''
while cmd != 'done':
    cmd = input('input a vertex in clockwise order (e.g. 0,1), otherwise "done":')
    if cmd == 'done': break
    else:
        cmd = cmd.split(',')
    vertexList.append((int(cmd[0]), int(cmd[1])))

shape = Polygon(vertexList)

print(shape)

sc = SchwarzChristoffel(shape)
sc.getParameters()
