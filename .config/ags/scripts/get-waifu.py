import os
import sys
import requests
from requests.auth import HTTPBasicAuth

if len(sys.argv) < 1:
    print("Usage: get-waifu.py [nsfw] [id/tag]")
    sys.exit(1)

def main():
    post_id = "random"
    tags=[]
    nsfw = "" if sys.argv[1]=="true" else "-"
   # Check if ID or tag parameter is passed
    
    for arg in sys.argv[2:]:
        if arg.isdigit():
            post_id = arg
        elif arg != "":
            tags.append(arg)
            
    if len(tags) == 0:
        tags = ["~ass", "~breasts"]

    tags = (tags + ["", ""])[:2]
    
    # Variables
    api_url = f"https://danbooru.donmai.us/posts/{post_id}.json?tags={nsfw}rating%3Aexplicit+{tags[0]}+{tags[1]}&ratio%3A>%3D1%2F3"
    print(api_url)
    api_key = "tYWBHV2Pv5dKKmRBsQaMHtFH"  # Replace with your own API key
    user_name = "lilayman"  # Replace with your own username
    save_dir = os.path.expanduser("~/.config/ags/assets/waifu")  # Directory where the image will be saved
    image_name = "waifu.png"

    # Create the directory if it doesn't exist
    os.makedirs(save_dir, exist_ok=True)

    # Fetch the random post 
    response = requests.get(api_url, auth=HTTPBasicAuth(user_name, api_key))

    if response.status_code == 200:
        data = response.json()

        # Check if the response contains the image URL
        image_url = data.get('file_url')
        if image_url:
            # Full path to save the image
            image_path = os.path.join(save_dir, image_name)

            # Download the image
            img_response = requests.get(image_url)
            if img_response.status_code == 200:
                with open(image_path, 'wb') as file:
                    file.write(img_response.content)

                # Save response to files
                waifu_file = os.path.join(save_dir, 'waifu.json')
                with open(waifu_file, 'w') as file:
                    file.write(response.text)
                
                print("Changed Successfully.")
            else:
                print("Failed to download.")
        else:
            print("No image URL found in the response.")
    else:
        print(f"Failed to fetch data from API. Status code: {response.status_code}")

if __name__ == "__main__":
    main()
