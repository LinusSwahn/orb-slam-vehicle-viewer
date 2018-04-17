#!/bin/bash

docker build -t testviewer . -f Dockerfile.amd64
docker run --rm --net=host -p 8081:8081 testviewer --cid=111
