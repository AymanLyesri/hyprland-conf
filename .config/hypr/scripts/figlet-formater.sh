#!/bin/bash

# Path to the input file (the file containing ### titles)
input_file="$1"
# Temporary file to store modified content
temp_file=$(mktemp)

# Read through the input file line by line
while IFS= read -r line || [[ -n "$line" ]]; do
    # Check if the line starts with ###
    if echo "$line" | grep -q "^###"; then
        # Remove the leading ### and any extra spaces
        title=$(echo "$line" | sed 's/^### *//')

        # Use figlet in banner mode to format the title
        figlet_output=$(figlet "$title")

        # Prepend each line of the figlet output with a #
        echo "$figlet_output" | sed 's/^/#/' >> "$temp_file"
    else
        # If it's not a title line, just append it as is
        echo "$line" >> "$temp_file"
    fi
done < "$input_file"

# Overwrite the input file with the formatted output
mv "$temp_file" "$input_file"

echo "Titles formatted with figlet banner and # successfully!"
