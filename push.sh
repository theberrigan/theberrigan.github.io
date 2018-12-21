#!/bin/bash

timestamp() {
    date +"%d.%m.%Y %H:%M:%S"
}

# git reset HEAD~
git add -A
git commit -m timestamp
git push