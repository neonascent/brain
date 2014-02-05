# -----------------------------------------------------------------------------------------------
# vxl_vtk_importer.py 
# only has one argument: the name of the vtk file to process (include the extension please)
# Author: dcantor
# -----------------------------------------------------------------------------------------------

import sys
import pdb
from threading import Thread


ARRAY_SIZE = 65536*3

vertices = []
indices = []
normals = []
scalars = []
colors = []

mode = "SOLID"

NOWHERE = 0    
POINTS = 1
LINES = 2
POLYGONS = 3
POINT_DATA = 4
NORMALS = 5
CELL_DATA = 6
TEXTURE_COORDINATES = 7
SCALARS = 8
LOOKUP_TABLE = 9
COLOR_SCALARS = 10

outputfile = ''
numBlocks = 0

# -----------------------------------------------------------------------
# Parses the VTK file
# -----------------------------------------------------------------------
def parseVTK(filename):

    global mode
    location = NOWHERE
    
    linenumber = 0
        
    for line in open(filename, 'r').readlines():
        linenumber = linenumber + 1
        try:
            if line.startswith('POINTS'):
                print(line)
                location = POINTS
                continue
            elif line.startswith('LINES'):
                print(line)
                location = LINES
                mode = "LINES"
                continue
            elif line.startswith('POLYGONS'):
                print(line)
                location = POLYGONS
                continue
            elif line.startswith('POINT_DATA'):
                location = POINT_DATA
                continue
            elif line.startswith('NORMALS'):
                print(line)
                location = NORMALS
                continue
            elif line.startswith('CELL_DATA'):
                print(line)
                location = CELL_DATA
                continue
            elif line.startswith('TEXTURE_COORDINATES'):
                print(line)
                location = TEXTURE_COORDINATES
                continue
            elif line.startswith('SCALARS'):
                print(line)
                location = SCALARS
                continue
            elif line.startswith('LOOKUP_TABLE'):
                print(line)
                location = LOOKUP_TABLE
                continue
            elif line.startswith('COLOR_SCALARS'):
                location = COLOR_SCALARS
                print(line)
                continue
            elif location == POINTS:
                for v in line.split():
                    vertices.append(float(v))
            elif location == LINES:
                tt = line.split()
                if len(tt)>0 and tt[0] == '2':
                    indices.append(int(tt[1]))
                    indices.append(int(tt[2]))
            elif location == POLYGONS: #they have to be triangles
                tt = line.split()
                if len(tt)>0 and tt[0] != '3':
                    raise AssertionError('Not triangles here')
                for i in tt[1:len(tt)]:
                    indices.append(int(i))
            elif location == LOOKUP_TABLE:
                if line.startswith('LOOKUP_TABLE'):
                    continue
                else:
                    for pd in line.split():
                        scalars.append(float(pd))
            elif location == COLOR_SCALARS:
                for n in line.split():
                    colors.append(float(n))
            elif location == NORMALS:
                for n in line.split():
                    normals.append(float(n))
        except:
            print('Error while processing line '+str(linenumber))
            print(line)
            raise



def writeJSON(fname):
    f = open(fname,'w')
    f.write('{\n')
    # writing vertices    
    f.write('  "vertices" : [')
    for v in vertices[0:len(vertices)-1]:
        f.write(str(v)+',')
    f.write(str(vertices[len(vertices)-1])+'],\n')
    
    # writing indices
    f.write('  "indices" : [')
    for i in indices[0:len(indices)-1]:
        f.write(str(i)+',')
    f.write(str(indices[len(indices)-1])+'],\n')
    
    # writing scalars    
    if len(scalars) > 0:
        f.write('  "scalars" : [')
        for pd in  scalars[0:len(scalars)-1]:
            f.write(str(pd)+',')
        f.write(str(scalars[len(scalars)-1])+'],\n')
        
    # writing colors
    if len(colors) > 0:
        f.write('  "colors" : [')
        for cl in  colors[0:len(colors)-1]:
            f.write(str(cl)+',')
        f.write(str(colors[len(colors)-1])+'],\n')
    
    f.write('  "mode" : "'+mode+'"\n')    
    f.write('}')
    f.close()
    




# -----------------------------------------------------------------------    
# Main function
# -----------------------------------------------------------------------    
def main():
    global outputfile
    if len(sys.argv) != 3:
        print ('Usage: python vxl_vtk_importer.py vtkFile.vtk outputFile.json')
        exit()


    print('----------------------------------------------------------')
    print(' Processing: ' + sys.argv[1])
    print('----------------------------------------------------------')
    parseVTK(sys.argv[1])
    writeJSON(sys.argv[2]);
    print('----------------------------------------------------------')
    print("                       DONE                               ")
    print('----------------------------------------------------------')

if __name__ == '__main__':
    main()
            
    