var mapScene = new THREE.Scene();

var mapRenderer = new THREE.WebGLRenderer();

var mapContainer = document.getElementById('tdMapContainer');
mapRenderer.setSize($(tdMapContainer).width(),$(tdMapContainer).height());
mapContainer.appendChild(mapRenderer.domElement);

mapRenderer.setClearColor(new THREE.Color(0x00000000));

document.getElementById('3d-map').appendChild(mapRenderer.domElement);

var mapCamera = new THREE.PerspectiveCamera(75, $(mapContainer).width() / $(mapContainer).height(), 0.1, 10000);

var update_time_stamps = [];

mapCamera.position.y = -5;
mapCamera.lookAt(0, 0, 0);
mapScene.add(mapCamera);

var mapPointLight = new THREE.PointLight(0xffffff);
mapPointLight.position.set(0, 20, 20);
mapScene.add(mapPointLight);

var mapControls = new THREE.FlyControls(mapCamera, mapRenderer.domElement);
mapControls.autoForward = false;
mapControls.dragToLook = true;
mapControls.movementSpeed = 1;
mapControls.rollSpeed = 0.05;

var mapAmbientLight = new THREE.AmbientLight(0xaaaaaa);
mapScene.add(mapAmbientLight);


var mapPointGeometry = new THREE.BufferGeometry();
var carPointGeometry = new THREE.BufferGeometry();
var MAX_POINTS = 1000000;

var mapPositions = new Float32Array(MAX_POINTS * 3); // 3 vertices per
var carPositions = new Float32Array(MAX_POINTS * 3); // 3 vertices per

mapPositions.fill(0);
carPositions.fill(0);

mapPointGeometry.addAttribute('position', new THREE.BufferAttribute(mapPositions, 3));
carPointGeometry.addAttribute('position', new THREE.BufferAttribute(carPositions, 3));

var mapMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });
var carMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.4 });

var mapPointCloud = new THREE.Points(mapPointGeometry, mapMaterial);
var cameraPoints = new THREE.Points(carPointGeometry, carMaterial);

mapScene.add(mapPointCloud);
mapScene.add(cameraPoints);

var currentIndex = 0;
var currentCarIndex = 0;

var animate = function ()
{
    requestAnimationFrame(animate);
    mapRenderer.render(mapScene, mapCamera);
    mapControls.update(1);
};

animate();


var insertCameraPoints = function (cameraPointsArray)
{
    var positions = cameraPoints.geometry.attributes.position.array;
    if(currentCarIndex === 0)
    {
        positions.fill(0);
    }
    for(var i in cameraPointsArray)
    {
        positions[currentCarIndex++] = cameraPointsArray[i].x;
        positions[currentCarIndex++] = cameraPointsArray[i].y;
        positions[currentCarIndex++] = cameraPointsArray[i].z;
    }
    cameraPoints.geometry.attributes.position.needsUpdate = true;
};

var insertMapPoints = function (mapPoints)
{
    var positions = mapPointCloud.geometry.attributes.position.array;
    if(currentIndex === 0)
    {
        positions.fill(0);
    }
    for (var i in mapPoints)
    {
        positions[currentIndex++] = mapPoints[i].x;
        positions[currentIndex++] = mapPoints[i].y;
        positions[currentIndex++] = mapPoints[i].z;
    }
    mapPointCloud.geometry.attributes.position.needsUpdate = true;
};

var floatArrayFromString = function (inString, precision, delimiter) {
    var mapCoordinatesParsed = [];
    var i = 0;
    while (i < inString.length) {
        if (inString[i] === '-') {
            var beforeDecimal = inString.substring(i, i + inString.substring(i).indexOf('.'));
            var endOfNumber = inString.substring(i + beforeDecimal.length, i + beforeDecimal.length + precision + '.'.length);
            mapCoordinatesParsed.push(parseFloat(beforeDecimal + endOfNumber));
            i += beforeDecimal.length + endOfNumber.length + delimiter.length;
        }
        else {
            var beforeDecimal = inString.substring(i, i + inString.substring(i).indexOf('.'));
            var endOfNumber = inString.substring(i + beforeDecimal.length, i + beforeDecimal.length + precision + '.'.length);
            mapCoordinatesParsed.push(parseFloat(beforeDecimal + endOfNumber));
            i += beforeDecimal.length + endOfNumber.length + delimiter.length;
        }
    }
    return mapCoordinatesParsed;
}

var mapPointsArrayFromFloatArray = function (in_array) {
    var mapPoints = [];
    for (var i = 0; i < in_array.length; i += 3) {
        var mapPoint = new THREE.Vector3(in_array[i], in_array[i + 1], in_array[i + 2]);
        mapPoints.push(mapPoint);
    }
    return mapPoints;
}




var __libcluon = libcluon();

function getResourceFrom(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false /*asynchronous request*/);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

if ("WebSocket" in window) {
    var ws = new WebSocket("ws://" + window.location.host + "/");
    ws.binaryType = 'arraybuffer';

    ws.onopen = function () {
        console.log("Connected...");
        document.getElementById("connectionStatusSymbol").style.color = "#3CB371";
        document.getElementById("connectionStatusText").style.color = "#3CB371";
        document.getElementById("connectionStatusText").innerHTML = "Connected";
        var odvd = getResourceFrom("js/opendlv-standard-message-set-v0.9.1.odvd");
        console.log("Loaded " + __libcluon.setMessageSpecification(odvd) + " messages from specification.");
    };

    var gotOriginalCameraRotation = false;

    var oldTimeStamp = 0;
    ws.onmessage = function (evt) {
        // This method will pass an OpenDaVINCI container to libcluon to parse it into a JSON object using the provided message specification.
        var data = JSON.parse(__libcluon.decodeEnvelopeToJSON(evt.data));
        if (data.dataType > 0) {
            // if (oldTimeStamp == 0)
            // {
            //     oldTimeStamp = data.sampleTimeStamp.seconds * 1000 * 1000 + data.sampleTimeStamp.microseconds;
            // }
            // else
            // {
            //     var currentTimeStamp = data.sampleTimeStamp.seconds * 1000 * 1000 + data.sampleTimeStamp.microseconds;
            //     dataLine.append(new Date().getTime(), Math.abs(currentTimeStamp - oldTimeStamp));
            //     oldTimeStamp = currentTimeStamp;
            // }
        }

        if (data.dataType == 1046) {
            gaugePS.value = data.opendlv_proxy_GroundSpeedReading.groundSpeed * 3.6;
        }
        if (data.dataType == 19) {
            var c = [data.opendlv_proxy_GeodeticWgs84Reading.longitude, data.opendlv_proxy_GeodeticWgs84Reading.latitude];
            map.setCenter(c);
        }
        if (data.dataType == 1193) {
            update_time_stamps.push(Date.now());
            if (update_time_stamps.length > 1)
            {
                var updates_per_second = update_time_stamps.length / ((update_time_stamps[update_time_stamps.length - 1] - update_time_stamps[0]) / 1000);
                document.getElementById("updates-per-second-text").innerHTML = String(updates_per_second.toFixed(2) + " updates per second");
            }

            // CompactPointCloud
            var mapCoordinatesRaw = window.atob(data.opendlv_proxy_OrbslamMap.mapCoordinates);
            currentIndex = data.opendlv_proxy_OrbslamMap.mapCoordinateIndex * 3;
            currentCarIndex = data.opendlv_proxy_OrbslamMap.cameraCoordinateIndex * 3;

            var cameraCoordinatesRaw = window.atob(data.opendlv_proxy_OrbslamMap.cameraCoordinates);
            var cameraRotationRaw = window.atob(data.opendlv_proxy_OrbslamMap.cameraRotation);

            var mapCoordinatesParsed = floatArrayFromString(mapCoordinatesRaw, 4, ':');
            var cameraCoordinatesParsed = floatArrayFromString(cameraCoordinatesRaw, 4, ':');
            var cameraRotationParsed = floatArrayFromString(cameraRotationRaw, 4, ':');
            var mapPointsFromMap = mapPointsArrayFromFloatArray(mapCoordinatesParsed);
            var cameraPoints = mapPointsArrayFromFloatArray(cameraCoordinatesParsed);

            var cameraRadianRotation = new THREE.Vector3(cameraRotationParsed[0], cameraRotationParsed[1], cameraRotationParsed[2]);

            insertCameraPoints(cameraPoints);
            insertMapPoints(mapPointsFromMap);
            // updateLidar(cameraPoint[0], mapPointsFromMap);
        }
        if (data.dataType == 49) {
            // CompactPointCloud
            var distances = window.atob(data.opendlv_proxy_PointCloudReading.distances);

            var startAzimuth = data.opendlv_proxy_PointCloudReading.startAzimuth;
            var endAzimuth = data.opendlv_proxy_PointCloudReading.endAzimuth;
            var entriesPerAzimuth = data.opendlv_proxy_PointCloudReading.entriesPerAzimuth;
            var numberOfPoints = distances.length / 2;
            var numberOfAzimuths = numberOfPoints / entriesPerAzimuth;
            var azimuthIncrement = (endAzimuth - startAzimuth) / numberOfAzimuths;

            var GL_positions = lidarPointCloud.geometry.attributes.position.array;

            // VLP16 sends 16 layers,
            if (16 == entriesPerAzimuth) {
                GL_positions.fill(0);
                GL_position_index = 0;
            }
            // HDL32e sends the sequence 12, 11, 9 layers.
            if (12 == entriesPerAzimuth) {
                GL_positions.fill(0);
                GL_position_index = 0;
            }

            var index = 0;
            var azimuth = startAzimuth;
            for (var azimuthIndex = 0; azimuthIndex < numberOfAzimuths; azimuthIndex++) {
                for (var sensorIndex = 0; sensorIndex < entriesPerAzimuth; sensorIndex++) {
                    var verticalAngle = 0;
                    if (16 == entriesPerAzimuth) {
                        verticalAngle = verticalAngles16[sensorIndex];
                    }
                    if (12 == entriesPerAzimuth) {
                        verticalAngle = verticalAngles12[sensorIndex];
                    }
                    if (11 == entriesPerAzimuth) {
                        verticalAngle = verticalAngles11[sensorIndex];
                    }
                    if (9 == entriesPerAzimuth) {
                        verticalAngle = verticalAngles9[sensorIndex];
                    }

                    var byte0 = distances.charCodeAt(index++);
                    var byte1 = distances.charCodeAt(index++);
                    var distance = (((0xff & byte0) << 8) | (0xff & byte1)) / 500.0;
                    if (distance > 1.0) {
                        var xyDistance = distance * Math.cos(verticalAngle * Math.PI / 180.0);
                        var x = xyDistance * Math.sin(azimuth * Math.PI / 180.0);
                        var y = xyDistance * Math.cos(azimuth * Math.PI / 180.0);
                        var z = distance * Math.sin(verticalAngle * Math.PI / 180.0);
                        if (GL_position_index < MAX_POINTS - 3) {
                            GL_positions[GL_position_index++] = x;
                            GL_positions[GL_position_index++] = z;
                            GL_positions[GL_position_index++] = -y;
                        }
                    }
                }
                azimuth += azimuthIncrement;
            }

            // Trigger update
            if ((16 == entriesPerAzimuth) ||
                (9 == entriesPerAzimuth)) {
                lidarPointCloud.geometry.attributes.position.needsUpdate = true;
            }
        }
    };

    ws.onclose = function () {
        console.log("Connection is closed...");
        document.getElementById("connectionStatusText").style.color = "#555";
        document.getElementById("connectionStatusSymbol").style.color = "#555";
        document.getElementById("connectionStatusText").innerHTML = "disconnected";
    };

}
else {
    // The browser doesn't support WebSocket
    console.log("WebSocket NOT supported by your Browser!");
}
