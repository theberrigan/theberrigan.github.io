#!/bin/bash

timestamp1() {
    date +"%d.%m.%Y %H:%M:%S"
}

timestamp=$(date +%s)
DATE_WITH_TIME=`date "+%Y%m%d-%H%M%S"`

# git reset HEAD~
git add -A
git commit -m "$( date +"%d.%m.%Y %H:%M:%S" )"
git push