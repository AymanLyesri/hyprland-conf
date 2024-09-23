#!/bin/bash

# Check if an argument (arithmetic expression) is passed
if [ -z "$1" ]; then
    echo "Usage: $0 '<arithmetic_expression>'"
    exit 1
fi

# Evaluate the arithmetic expression using bc
result=$(echo "$1" | bc -l)

# Check if the result is empty or contains only whitespace
if [ -z "$result" ]; then
    # Return empty JSON
    echo "[]"
else
    # Return JSON with result
    echo "[{\"app_name\": \"$result\", \"app_exec\": \"wl-copy $result\", \"app_icon\": \"view-grid-symbolic\"}]"
fi
