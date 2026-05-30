import requests as rq
from bs4 import BeautifulSoup as bsoup
from time import sleep
from random import randint
import json

# f=''

# def remove_index(b):
#     i = 0
#     while (b[i] != b[-1]):
#         if(b[i]=='"'):
#             if(b[i+1].isdigit()):
#                 i = i-1
#                 continue
#             elif(b[i+1]=='"'):   
#                 i = i+1
#                 continue
#         if(b[i] == ':'):
#             if(b[i+1]=='{'):
#                 i= i+1
#                 continue
#         f.join(b[i])
#         i = i+1
#     return f


headers = {"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763'}
names = []
for i in range (1,12) :
    page = rq.get( 'https://www.downloadroms.io/roms/gameboy-advance/?letter=all&page={}&sort=popularity'.format(i) , headers = headers)
    soup = bsoup( page.content , 'html.parser')
    gbarom_containers = soup.find_all( 'div' , {'class' : 'titlebox'})
    for container in gbarom_containers :
        name = str(container.get_text())
        names.append(name)
    sleep(randint(1,3))
# df = pd.DataFrame({'Name':names})
# GBA_Roms = df.to_json(orient='index')
# newstr  = remove_index(GBA_Roms)
# print(newstr)
GBA_Roms = json.dumps({'Name':names})
# print(GBA_Roms)
with open('GBA_Roms_Names.json' , 'w') as jf:
    json.dump(GBA_Roms , jf)
