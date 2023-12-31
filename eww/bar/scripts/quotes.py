import os
import sys
import requests
from dotenv import load_dotenv
from textwrap import TextWrapper

load_dotenv() 
KEY=os.getenv("KEY")

tw = TextWrapper()
tw.width = int(sys.argv[1])

category = 'happiness'

api_url = 'https://api.api-ninjas.com/v1/quotes?category={}&limit=1'.format(category)
response = requests.get(api_url, headers={'X-Api-Key': KEY})

if response.status_code == requests.codes.ok:
    print("\n".join(tw.wrap(response.json()[0]['quote']))+'\t*'+response.json()[0]['author']+'*')
else:
    quote_alt = os.popen('hyprctl splash').read()
    print(quote_alt)
