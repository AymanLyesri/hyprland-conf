#!/bin/bash

# Directories where .desktop files are commonly located
APP_DIRECTORIES=(
    "/usr/share/applications/"
    "$HOME/.local/share/applications/"
)

# Function to extract the app name and binary from a .desktop file
extract_app_info() {
    local desktop_file="$1"

    # Extract Name and Exec fields
    local app_name=$(grep -m 1 "^Name=" "$desktop_file" | cut -d '=' -f 2)
    local app_exec=$(grep -m 1 "^Exec=" "$desktop_file" | cut -d '=' -f 2)

    # If both fields are found, remove options from the Exec field
    if [[ -n "$app_name" && -n "$app_exec" ]]; then
        # Clean the Exec line (remove options like %U, %f, %u)
        app_exec=$(echo "$app_exec" | sed 's/ *%[A-Za-z]//g')

        # Output the app name and its executable path
        echo "App: $app_name"
        echo "Executable: $app_exec"
        echo "-------------------------"
    fi
}

# Main function to search through directories and extract app info
search_apps() {
    local search_term="$1"

    # Check if search term is provided
    if [[ -z "$search_term" ]]; then
        echo "Usage: $0 <search-term>"
        exit 1
    fi

    # Normalize the search term for case-insensitive matching
    search_term=$(echo "$search_term" | tr '[:upper:]' '[:lower:]')

    # Initialize an empty array to hold JSON objects
    json_array=()

    for app_dir in "${APP_DIRECTORIES[@]}"; do
        if [[ -d "$app_dir" ]]; then
            # Search for .desktop files in the directory using process substitution to avoid subshell
            while IFS= read -r desktop_file; do
                # Extract app info
                app_name=$(grep -m 1 "^Name=" "$desktop_file" | cut -d '=' -f 2)

                # Extract the Exec field (binary)
                app_exec=$(grep -m 1 "^Exec=" "$desktop_file" | cut -d '=' -f 2)

                # Normalize app name for case-insensitive matching
                app_name=$(echo "$app_name" | tr '[:upper:]' '[:lower:]')

                # Remove any placeholder options (e.g., %U, %f, %u, etc.)
                app_exec=$(echo "$app_exec" | sed 's/ *%[A-Za-z]//g')

                # Check if the app name contains the search term
                if [[ "$app_name" == *"$search_term"* ]]; then
                    # Add the JSON object to the array
                    json_array+=("{\"app_name\": \"$app_name\", \"app_exec\": \"$app_exec\"}")
                fi
            done < <(find "$app_dir" -name "*.desktop")
        fi
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
