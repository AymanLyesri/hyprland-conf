import json
import os
import sys
import requests
from requests.auth import HTTPBasicAuth

exclude_tags = ["-animated"]

import requests
from requests.auth import HTTPBasicAuth

def fetch_danbooru(tags, post_id, page=1, limit=6):
    if post_id == "random":
        api_url = (f"https://danbooru.donmai.us/posts.json?limit={limit}&page={page}&tags="
                   f"+{'+'.join(tags)}")
    else:
        api_url = (f"https://danbooru.donmai.us/posts/{post_id}.json?")
    
    user_name = "publicapi"
    api_key = "Pr5ddYN7P889AnM6nq2nhgw1"  # Replace with your own API key
    response = requests.get(api_url, auth=HTTPBasicAuth(user_name, api_key))
    
    if response.status_code == 200:
        posts = response.json()
    

        result = []
        for post in posts:
            media_asset = post.get("media_asset", {})
            variants = media_asset.get("variants", [])

            # Ensure there is at least a second variant available
            preview_url = variants[1].get("url") if len(variants) > 1 else None

            post_data = {
                "id": post.get("id"),
                "url": post.get("file_url"),
                "preview": preview_url,
                "width": post.get("image_width"),
                "height": post.get("image_height"),
            }

            # Filter out posts that have any empty (None or missing) values
            if all(post_data.values()):
                result.append(post_data)

        return result

    return None


def fetch_gelbooru(tags, post_id, page=1, limit=6):
    if post_id=="random": 
        api_url = (f"https://gelbooru.com/index.php?limit={limit}&pid={page}&page=dapi&s=post&q=index&json=1&tags="
               f"+{'+'.join(tags)}"
               f"+{'+'.join(exclude_tags)}")
    else:
        api_url = (f"https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&id={post_id}")
    user_id = "1667355"
    api_key = "1ccd9dd7c457c2317e79bd33f47a1138ef9545b9ba7471197f477534efd1dd05"  # Replace with your own API key
    response = requests.get(api_url, auth=HTTPBasicAuth(user_id, api_key))
    if response.status_code == 200:
        posts = response.json().get("post")
        
        # Extract only the necessary fields
        result = []
        for post in posts:
            # Handle the possibility of missing keys by using .get()
            post_data = {
                "id": post.get("id"),
                "url": post.get("file_url"),
                "preview": post.get("preview_url"),
                "width": post.get("width"),
                "height": post.get("height")
            }
            result.append(post_data)
        return result
    return None


def main():
    # Check if the correct number of arguments is passed
    if len(sys.argv) < 2:
        print("Usage: search-booru.py --api [danbooru/gelbooru] --id [id] --tags [tag,tag...] --page [page] --limit [limit]")
        sys.exit(1)

    # Initialize variables
    api_source = ""
    post_id = "random"
    tags = []
    page = 1  # Default page
    limit = 6  # Default limit

    # Parse arguments
    for i in range(1, len(sys.argv)):
        if sys.argv[i] == "--api":
            api_source = sys.argv[i + 1].lower()
        elif sys.argv[i] == "--id":
            post_id = sys.argv[i + 1]
        elif sys.argv[i] == "--page":
            page = int(sys.argv[i + 1])
        elif sys.argv[i] == "--limit":
            limit = int(sys.argv[i + 1])
        elif sys.argv[i] == "--tags":
            tags = sys.argv[i + 1].split(",") 
            

    save_dir = os.path.expanduser("~/.config/ags/assets/waifu")
    os.makedirs(save_dir, exist_ok=True)
    
    if api_source == "danbooru":
        data = fetch_danbooru(tags, post_id, page, limit)
    elif api_source == "gelbooru":
        data = fetch_gelbooru(tags, post_id, page, limit)
    else:
        print("Invalid API source. Use 'danbooru' or 'gelbooru'.")
        sys.exit(1)
    
    if data:
        print(json.dumps(data))
    else:
        print("Failed to fetch data from API.")

if __name__ == "__main__":
    main()
