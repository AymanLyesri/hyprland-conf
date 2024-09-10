#!/bin/bash

# Directories where .desktop files are commonly located
APP_DIRECTORIES=(
    "/usr/share/applications/"
    "$HOME/.local/share/applications/"
)

# Main function to search through directories and extract app info
search_apps() {
    local search_term="$1"

    # Check if search term is provided
    if [[ -z "$search_term" ]]; then
        echo "Usage: $0 <search-term>"
        exit 1
    fi

    # Initialize an associative array to hold unique app_name and app_exec pairs
    declare -A app_dict

    # Initialize an empty array to hold JSON objects
    json_array=()

    # Iterate over each directory and process .desktop files
    for app_dir in "${APP_DIRECTORIES[@]}"; do
        while IFS='|' read -r app_name app_exec; do
            # Check for duplicates using the associative array
            app_key="${app_name}_${app_exec}"
            if [[ -z "${app_dict[$app_key]}" ]]; then
                app_dict["$app_key"]=1
                # Add the JSON object to the array
                json_array+=("{\"app_name\": \"$app_name\", \"app_exec\": \"$app_exec\"}")
            fi
        done < <(
            find "$app_dir" -name "*.desktop" -print0 | xargs -0 -n 1 -P 4 awk -v term="$search_term" '
                BEGIN { IGNORECASE=1 }
                /^Name=/ { app_name = substr($0, 6) }
                /^Exec=/ { app_exec = substr($0, 6) }
                app_name ~ term && app_name != "" && app_exec != "" {
                    gsub(/ *%[A-Za-z]/, "", app_exec) # Remove placeholders like %U
                    print app_name "|" app_exec
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

# Call the main function with the search term
search_apps "$search_term"
