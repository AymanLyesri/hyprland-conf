import json
import os
import sys
import requests
from requests.auth import HTTPBasicAuth

# Arguments
# 1. API source (danbooru/gelbooru)
# 2. NSFW (true/false)
# 3. ID/Tag (id or tag)

exclude_tags = ["-animated"]

def fetch_danbooru(nsfw, tags, post_id):
    api_url = (f"https://danbooru.donmai.us/posts/{post_id}.json?tags={nsfw}rating%3Aexplicit+"
               f"{'+'.join(tags)}&ratio%3A>%3D1%2F3")
    user_name = "publicapi"
    api_key = "Pr5ddYN7P889AnM6nq2nhgw1"  # Replace with your own API key
    response = requests.get(api_url, auth=HTTPBasicAuth(user_name, api_key))
    if response.status_code == 200:
        return response.json()
    return None


def fetch_gelbooru(nsfw, tags, post_id):
    if post_id=="random": 
        api_url = (f"https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=1&tags={nsfw}rating:explicit+sort:random"
               f"+{'+'.join(tags)}"
               f"+{'+'.join(exclude_tags)}")
        print(api_url)
    else:
        api_url = (f"https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&id={post_id}")
    user_id = "1667355"
    api_key = "1ccd9dd7c457c2317e79bd33f47a1138ef9545b9ba7471197f477534efd1dd05"  # Replace with your own API key
    response = requests.get(api_url, auth=HTTPBasicAuth(user_id, api_key))
    if response.status_code == 200:
        print (response.json())
        return response.json()['post'][0]
    return None


def main():
    if len(sys.argv) < 4:
        print("Usage: get-waifu.py [danbooru/gelbooru] [nsfw] [id/tag]")
        sys.exit(1)

    api_source = sys.argv[1].lower()
    nsfw = "" if sys.argv[2] == "true" else "-"
    post_id = "random"
    tags = []
    
    for arg in sys.argv[3].split():
        if arg.isdigit():
            post_id = arg
        elif arg:
            tags.append(arg)
    
    print(tags,"id",post_id)

    save_dir = os.path.expanduser("~/.config/ags/assets/waifu")
    os.makedirs(save_dir, exist_ok=True)
    image_name = "waifu.png"
    
    print(f"Fetching waifu from {api_source}...")
    
    if api_source == "danbooru":
        data = fetch_danbooru(nsfw, tags, post_id)
    elif api_source == "gelbooru":
        data = fetch_gelbooru(nsfw, tags, post_id)
    else:
        print("Invalid API source. Use 'danbooru' or 'gelbooru'.")
        sys.exit(1)
    
    if data:
        image_url = data.get('file_url')
        if image_url:
            image_path = os.path.join(save_dir, image_name)
            img_response = requests.get(image_url)
            if img_response.status_code == 200:
                with open(image_path, 'wb') as file:
                    file.write(img_response.content)
                    
                waifu_json = os.path.join(save_dir, 'waifu.json')
                with open(waifu_json, 'w') as file:
                    json.dump(data, file, indent=4)
                print("Changed Successfully.")
            else:
                print("Failed to download.")
        else:
            print("No image URL found in the response.")
    else:
        print("Failed to fetch data from API.")

if __name__ == "__main__":
    main()
