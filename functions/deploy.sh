#! /bin/bash

env="$1"
if [ $env = "server" ]; then
    firebase deploy --only functions	
elif [ $env = "local" ]; then
	firebase functions:shell
fi