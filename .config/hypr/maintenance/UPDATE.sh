#!/bin/bash

figlet "Updating Config"

if [ "$1" = "keep" ]; then
    git stash

    # Change branch to the specified branch
    git checkout master
    git fetch origin master
    git reset --hard origin/master

    git stash pop
else
    # Change branch to the specified branch
    git checkout master
    git fetch origin master
    git reset --hard origin/master
fi
