#!/bin/bash

if ./buildImage.sh; then
    docker run --rm --net=host -p 8081:8081 chalmersrevere/opendlv-orbslam2-vehicle-viewer:latest --cid=111
fi