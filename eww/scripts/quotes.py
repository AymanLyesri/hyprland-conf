import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv() 
KEY=os.getenv("KEY")

from textwrap import TextWrapper

text = "Given text and a desired line length, wrap the text as a typewriter would. Insert a newline character  '\\n' after each word that reaches or exceeds the desired line length."

tw = TextWrapper()
tw.width = int(sys.argv[1])

category = 'happiness'
api_url = 'https://api.api-ninjas.com/v1/quotes?category={}&limit=1'.format(category)
response = requests.get(api_url, headers={'X-Api-Key': KEY})

if response.status_code == requests.codes.ok:
    print("\n".join(tw.wrap(response.json()[0]['quote']))+'\n\t*'+response.json()[0]['author']+'*')
else:
    print("Error:", response.status_code, response.text)
