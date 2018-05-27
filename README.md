## OpenDLV Microservice to view output from the ORB-SLAM2 OpenDLV implementation

This repository provides source code to view the output generated from the ORB-SLAM2 OpenDLV implementation available at: [OpenDLV ORB-SLAM2](https://github.com/chalmers-revere/opendlv-perception-vision-orbslam2) 

[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)


## Table of Contents
* [Dependencies](#dependencies)
* [Usage](#usage)
* [License](#license)


## Dependencies
No dependencies! The following dependencies are part of the source distribution:

* [font-awesome.css 4.7.0](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css)
* [maptalks.css](https://unpkg.com/maptalks/dist/maptalks.css)
* [maptalks](https://unpkg.com/maptalks/dist/maptalks.min.js)
* [three 88](https://cdnjs.cloudflare.com/ajax/libs/three.js/88/three.min.js)
* [gauge 2.1.4](https://cdn.rawgit.com/Mikhus/canvas-gauges/gh-pages/download/2.1.4/all/gauge.min.js)
* [smoothie 1.32.0](https://cdnjs.cloudflare.com/ajax/libs/smoothie/1.32.0/smoothie.min.js)
* [libcluon.js 0.0.51](https://github.com/chrberger/libcluon) - [![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)


## Usage
In order to build this repository, docker is required.

You can either build and run only this microservice by itself for debugging by running the ´build_and_run.sh´ bash script.

The alternative is to build this image using `buildImage.sh` and then running it in combintaion with the ORB-SLAM2 OpenDLV implementation. Further instructions located at the [ORB-SLAM2 repository](https://github.com/chalmers-revere/opendlv-perception-vision-orbslam2)

When the microservice is running, simply point your web-browser to the IP address and port 8081 where you
started this microservice to see any currently exchanged messages. The default ip is localhost.


## License

* This project is released under the terms of the BSD-3-Clause License

