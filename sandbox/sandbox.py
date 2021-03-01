#!/usr/bin/env python
# coding: utf-8

from polygon import Polygon
import scipy
import math


square = Polygon([
    (0,0),
    (0,1),
    (1,1),
    (1,0)
    ])

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

print(square)
print(test)
print(test2)