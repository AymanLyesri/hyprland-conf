#!/bin/bash

# Translate a text to English
text=$1
launguage=$2

if [ -z "$launguage" ]; then
    launguage="en"
fi

result=$(trans -brief "$text" -t $launguage)

app_name=$result
app_exec="wl-copy '$result'"

echo "[{\"app_name\": \"$app_name\", \"app_exec\": \"$app_exec\"}]"
