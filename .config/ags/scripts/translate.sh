#!/bin/bash

# Translate a text to English
language=$1
shift
text=$*

result=$(trans -brief "$text" -t "$language")

app_name=$result
app_exec="wl-copy '$result'"

echo "[{\"app_name\": \"$app_name\", \"app_exec\": \"$app_exec\"}]"
