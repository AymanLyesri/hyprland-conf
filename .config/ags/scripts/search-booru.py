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
        
        # check if posts is an array if not convert it to an array
        if not isinstance(posts, list):
            posts = [posts]
    

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

def fetch_danbooru_tags(tag: str, limit: int = 10):
    """Fetch the top 10 most popular matching tags from Danbooru."""
    user_id = "publicapi"  # Danbooru's public API user (rate-limited)
    api_key = "Pr5ddYN7P889AnM6nq2nhgw1"  # Replace with your own if needed
    url = "https://danbooru.donmai.us/tags.json"
    
    # Search for tags containing the input string (wildcard search)
    params = {
        "search[name_matches]": f"*{tag}*",
        "limit": 1000,  # Fetch extra to ensure we get the most popular
        "order": "count",  # Sort by post count (descending)
    }

    try:
        response = requests.get(url, params=params, auth=HTTPBasicAuth(user_id, api_key))
        response.raise_for_status()
        
        tags = response.json()
        
        # Handle cases where post_count is None (treat as 0)
        sorted_tags = sorted(
            tags,
            key=lambda x: x.get("post_count", 0) or 0,
            reverse=True
        )
        
        # Extract tag names from the top 10 most popular
        top_tags = [tag["name"] for tag in sorted_tags[:limit]]
        
        return top_tags
        
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
    
    
def fetch_gelbooru_tags(tag: str, limit: int = 10):
    """Fetch matching tags from Gelbooru by partial name matching."""
    user_id = "1667355"
    api_key = "1ccd9dd7c457c2317e79bd33f47a1138ef9545b9ba7471197f477534efd1dd05"
    url = "https://gelbooru.com/index.php"
    params = {
        "page": "dapi",
        "q": "index",
        "s": "tag",
        "json": "1",
        "limit": 1000,  # Fetch more than needed
        "name_pattern": f"%{tag}%"  # Search for tags containing the input string
    }

    try:
        response = requests.get(url, params=params, auth=HTTPBasicAuth(user_id, api_key))
        response.raise_for_status()
        tags = response.json().get("tag", [])

        if not tags:
            return []

        # Sort the matching tags by popularity (post_count) in descending order
        sorted_tags = sorted(tags, key=lambda x: int(x.get("post_count", 0)), reverse=True)

        # Extract just the tag names
        tag_names = [tag_data["name"] for tag_data in sorted_tags]

        # Return the top matching tags
        return tag_names[:limit]

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
    
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
    tag = ""

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
        elif sys.argv[i] == "--tag":
            tag = sys.argv[i + 1]
        elif sys.argv[i] == "--tags":
            tags = sys.argv[i + 1].split(",") 
            

    save_dir = os.path.expanduser("~/.config/ags/assets/waifu")
    os.makedirs(save_dir, exist_ok=True)
    

    if api_source == "danbooru":
        if tag:
            data = fetch_danbooru_tags(tag)
        else:
            data = fetch_danbooru(tags, post_id, page, limit)
    elif api_source == "gelbooru":
        if tag:
            data = fetch_gelbooru_tags(tag)
        else:
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
