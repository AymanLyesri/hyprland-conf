#!/usr/bin/python3
import json
import os
import psutil
import random
import subprocess
import sys
import requests

waifuson_path = "assets/waifu/rules.json"
mode = sys.argv[1] if 1 < len(sys.argv) else ""
tag = sys.argv[2] if 2 < len(sys.argv) else ""
isNsfw = sys.argv[3] if 3 < len(sys.argv) else ""


def getWaifusonValue(data):
    with open(waifuson_path, "r") as waifuson:
        return json.load(waifuson)[data]


def setWaifuonValue(data, value):
    with open(waifuson_path, "r") as waifuson:
        content = json.load(waifuson)
        content[data] = value
    with open(waifuson_path, "w") as waifuson:
        json.dump(content, waifuson, indent=4)


def pin():
    with open(waifuson_path, "r") as waifuson:
        content = json.load(waifuson)
        print(os.system("eww get waifu_art"))


def nsfw():
    with open(waifuson_path, "r") as waifuson:
        content = json.load(waifuson)
        content["is_nsfw"] = not content["is_nsfw"]
    with open(waifuson_path, "w") as waifuson:
        json.dump(content, waifuson, indent=4)
    isnsfw = content["is_nsfw"]

    os.system("${EWW_CMD} update is_nsfw=" + str(isnsfw))


def loadImage(mode, url, tag=None):
    setWaifuonValue("last_waifu_art", subprocess.getoutput("eww get waifu_art"))
    if mode == "--im":
        params = {
            "included_tags": tag,
            "height": ">=600",
            "is_nsfw": True if isNsfw == "nsfw" else False,
        }
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            return data["images"][0]["url"]
    elif mode == "--pics":
        response = requests.get(url, params=None)
        if response.status_code == 200:
            data = response.json()
            return data["url"]
    elif mode == "--af":
        params = {"offset": str(random.randint(0, 2373))}
        response = requests.get(url, params)
        if response.status_code == 200:
            data = response.json()
            return data["image"]["url"]
    return print("Request failed with status code:" + str(response.status_code))

def write_url(url):
    data = requests.get(url).content 
    f = open('img.jpg','wb') 
    f.write(data) 
    f.close() 

def image_of_choice():
    if mode == "url":
        pass
    elif mode == "fuckyWucky":
        nsfw()
    elif mode == "pin":
        pin()
    elif mode == "--im":
        return loadImage(mode, "https://api.waifu.im/search", tag)
    elif mode == "--pics":
        return loadImage(mode, "https://api.waifu.pics/" + isNsfw + "/" + tag)
    elif mode == "--af":
        return loadImage(mode, "https://anime-feet-api.vercel.app/api/posts?")
    elif mode == "02":
        print("https://i.pinimg.com/736x/5a/b1/3b/5ab13b95d7e57630b303442c1d2d47ac.jpg")

write_url(image_of_choice())


print('img.jpg')

os.system("identify img.jpg | gawk '{split($3,sizes,'x'); print sizes[1]/sizes[2]}")

# os.system("${EWW_CMD} update waifu_art='img.jpg'")
