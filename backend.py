import pandas as pd

class user:
   location = [0,0]
   def __init__(self, location):
      self.location = location

def getRankedList(dataBase, user):
    # get the ranked list from the database
    # return the ranked list`
    lc = []
    for i in dataBase:
      lc.append([i, getWeightedAverageForDBIndex(i, user)])
    sorted(lc, key=lambda x: x[1])
    return lc
  
def getWeightedAverageForDBIndex(dataBase, user):

