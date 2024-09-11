import os
import sys
import requests
from requests.auth import HTTPBasicAuth

def main():
    # Check if ID parameter is passed
    if len(sys.argv) > 1:
        post_id = sys.argv[1]
    else:
        post_id = "random"

    # Variables
    api_url = f"https://danbooru.donmai.us/posts/{post_id}.json?tags=~ass+~breasts&-rating%3Ae&ratio=%3C%3D1/10"
    api_key = "tYWBHV2Pv5dKKmRBsQaMHtFH"  # Replace with your own API key
    user_name = "lilayman"  # Replace with your own username
    save_dir = os.path.expanduser("~/.config/ags/assets/images")  # Directory where the image will be saved
    image_name = "waifu.jpg"

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
                previous_file = os.path.join(save_dir, 'previous.json')
                waifu_file = os.path.join(save_dir, 'waifu.json')
                if os.path.exists(waifu_file):
                    os.rename(waifu_file, previous_file)
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
