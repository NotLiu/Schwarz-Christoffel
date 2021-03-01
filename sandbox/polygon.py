import math

class Vertex:
    def __init__(self, label, coords):
        self.label = label
        self.x = coords[0]
        self.y = coords[1]
        self.coord = (self.x, self.y)
    
    def __str__(self):
        return f'{self.label}: ({self.x}, {self.y})'
        
class Line:
    def __init__(self, label, vertex1, vertex2):
        self.label = label
        self.v1 = vertex1
        self.v2 = vertex2
        self.length = self.getLength()
        self.rise = self.v2.y - self.v1.y
        self.run = self.v2.x - self.v1.x
        self.slope = self.getSlope()
        
    def getLength(self):
        return math.sqrt( ( self.v2.x - self.v1.x )**2 + ( self.v2.y - self.v1.y )**2 )
    
    def getSlope(self):
        return self.rise/self.run if self.run != 0 else float('NaN')
        
    def __str__(self):
        return f'{self.label}:\n {str(self.v1)} <-> {str(self.v2)}\n line length: {self.length}\n line slope: {self.slope}'
    
    def __iter__(self):
        yield self.v1
        yield self.v2
        
class Angle:
    def __init__(self, line1, line2):
        self.vertices = self.getVertices(line1, line2)
        if len(self.vertices) != 3:
            print('Invalid Angle')
            return None
        self.label = self.determineLabel()
        self.line1 = line1
        self.line2 = line2
    
    def getVertices(self, line1, line2):
        lines = [line1, line2]
        vertices = []
        for line in lines:
            for vertex in line:
                if vertex not in vertices:
                    vertices.append(vertex)
        return vertices
                
    def determineLabel(self):
        label=''
        for vertex in self.vertices:
            label += vertex.label
        return label
    
    def calcAngle(self, method='degrees'): 
        #radians = 'radians'
        
        angle = float('inf')

        # Implementation courtesy of https://stackoverflow.com/questions/20252845/best-algorithm-for-detecting-interior-and-exterior-angles-of-an-arbitrary-shape

        p1 = self.vertices[2]
        ref = self.vertices[1]
        p2 = self.vertices[0]
        
        x1, y1 = p1.x - ref.x, p1.y - ref.y
        x2, y2 = p2.x - ref.x, p2.y - ref.y
        
        cross_sign = x1 * y2 > x2 * y1
        
        numer = (x1 * x2 + y1 * y2) 
        denom = math.sqrt( (x1 ** 2 + y1 ** 2) * (x2 ** 2 + y2 ** 2) )
        if method == 'degrees':
            angle = math.degrees(math.acos(numer/denom))
            if cross_sign:
                angle = 360 - angle
        elif method == 'radians':
            angle = math.acos(numer/denom)
            if cross_sign:
                angle = math.radians(360) - angle
        else:
            print("Invalid method of returning angle.")
            return None
        
        '''
        if method == 'degrees':
            angle = math.degrees( slope1Negative*math.atan2(self.line1.rise, self.line1.run) +\
                                 slope2Negative*math.atan2(self.line2.rise, self.line2.run) )
        elif method == 'radians':
            angle = slope1Negative*math.atan2(self.line1.rise, self.line1.run) +\
                slope2Negative*math.atan2(self.line2.rise, self.line2.run)
        '''
        return angle

    def __str__(self):
        return f'∠{self.label}: {self.calcAngle()}'
    
class Polygon:
    def __init__(self, vertices):
        self.vertices = self.getVertices(vertices)
        self.lines = self.getLines()
        self.angles = self.makeAngleObjects()
    
    def getVertices(self, vertices):
        #Assume vertices are list of tuples in order of polygon construction
        vertexList = []
        vertexLabelASCII = 65
        if len(vertices) < 3:
            print('Polygons cannot have less than 3 vertices.')
            return None
        for vertex in vertices:
            if type(vertex) is not tuple:
                print('Vertices must be tuples.')
                return None
            if len(vertex) != 2:
                print('Vertices must have only 2 fields.')
                return None

        for vertex in vertices:
            vertexList.append(Vertex(chr(vertexLabelASCII), vertex))
            vertexLabelASCII += 1
        return vertexList
    
    def getLines(self):
        lineList = []
        lineLabelASCII = 97
        for vertexIndex in range(1, len(self.vertices)):
            lineList.append(Line(chr(lineLabelASCII), self.vertices[vertexIndex - 1], self.vertices[vertexIndex]))
            lineLabelASCII += 1
        lineList.append(Line(chr(lineLabelASCII), self.vertices[len(self.vertices)-1], self.vertices[0]))
        return lineList
    
    def makeAngleObjects(self):
        angleList = []
        for lineIndex in range(1, len(self.lines)):
            angleList.append(Angle(self.lines[lineIndex - 1], self.lines[lineIndex]))
        angleList.append(Angle(self.lines[len(self.lines)-1], self.lines[0]))
        return angleList
    
    def __str__(self):
        returnString = 'VERTICES\n'
        for vertex in self.vertices:
            returnString += f'{vertex}\n'
        returnString += '\nLINES\n'
        for line in self.lines:
            returnString += f'{line}\n'
        returnString += '\nANGLES\n'
        for angle in self.angles:
            returnString += f'{angle}\n'
        return f'{returnString}\n{"-" * 70}\n'