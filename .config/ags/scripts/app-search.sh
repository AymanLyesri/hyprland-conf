#!/bin/bash

# Directories where .desktop files are commonly located
APP_DIRECTORIES=(
    "/usr/share/applications/"
    "$HOME/.local/share/applications/"
)

# Directories where icons are commonly located
ICON_DIRECTORIES=(
    "/usr/share/icons/hicolor/"
    # "/usr/share/pixmaps/"
    # "$HOME/.local/share/icons/"
)

icon_dir="/usr/share/icons/hicolor/"

# Function to find the full path of the icon
find_icon_path() {
    local icon_name="$1"

    # Iterate over common icon directories
    # for icon_dir in "${ICON_DIRECTORIES[@]}"; do
    # Search for icons with common file extensions
    for extension in "png" "svg"; do
        icon_path=$(find "$icon_dir" -name "$icon_name.$extension" -print -quit 2>/dev/null)
        if [[ -n "$icon_path" ]]; then
            echo "$icon_path"
            return
        fi
    done
    # done

    # If no path is found, return the original icon name
    echo "$icon_name"
}

# Main function to search through directories and extract app info
search_apps() {
    local search_term="$1"
    local app_arg="$2"

    # Check if search term is provided
    if [[ -z "$search_term" ]]; then
        echo [] # Return an empty JSON array
        exit 1
    fi

    # Initialize an associative array to hold unique app_name, app_exec, and app_icon pairs
    declare -A app_dict

    # Initialize an empty array to hold JSON objects
    json_array=()

    # Iterate over each directory and process .desktop files
    for app_dir in "${APP_DIRECTORIES[@]}"; do
        while IFS='|' read -r app_name app_exec app_icon; do
            # Check for duplicates using the associative array
            app_key="${app_name}_${app_exec}_${app_icon}"
            if [[ -z "${app_dict[$app_key]}" ]]; then
                app_dict["$app_key"]=1

                # Resolve the full path of the app icon
                full_icon_path=$(find_icon_path "$app_icon")

                # Add the JSON object to the array
                json_array+=("{\"app_name\": \"$app_name\", \"app_exec\": \"$app_exec\", \"app_arg\": \"$app_arg\", \"app_icon\": \"$full_icon_path\", \"app_type\": \"app\"}")
            fi
        done < <(
            find "$app_dir" -name "*.desktop" -print0 | xargs -0 -n 1 -P 4 awk -v term="$search_term" '
            BEGIN { IGNORECASE=1 }
            /^Name=/ { app_name = substr($0, 6) }
            /^Exec=/ {
                app_exec = substr($0, 6)
                gsub(/^"|"$/, "", app_exec) # Remove leading and trailing double quotes if present
                gsub(/ *%[A-Za-z]/, "", app_exec) # Remove placeholders like %U
            }
            /^Icon=/ { app_icon = substr($0, 6) }
            app_name ~ term && app_name != "" && app_exec != "" && app_icon != "" {
                print app_name "|" app_exec "|" app_icon
            }
        '
        )
    done

    # Join the array elements with commas and wrap in brackets
    echo "["
    echo "${json_array[*]}" | sed 's/} {/}, {/g'
    echo "]"
}

# Get the search term from the command line argument
search_term="$1"
shift 1
search_args="$@" # Additional arguments to pass to the app
# Call the main function with the search term
search_apps "$search_term" "$search_args"
