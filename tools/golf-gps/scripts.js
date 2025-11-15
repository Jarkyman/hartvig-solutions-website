document.addEventListener('DOMContentLoaded', (event) => {
    const map = L.map('map').setView([55.427105, 12.175586], 17);
    //https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
    //L.tileLayer('https://ecn.t3.tiles.virtualearth.net/tiles/{z}/{y}/{x}.jpeg', { //Bing Sattelite??
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { // Esri Sattelite
        //L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { // Google sattelite
        //L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // OpenStreetMap Not Sattelite
        maxZoom: 24,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let markers = [];
    let tempMarker = null;
    const fieldsContainer = document.getElementById('fieldsContainer');

    function addRow(courseId = '', hole = '1', poi = 'Green', location = 'F', sideOfFairway = 'C', latitude = '', longitude = '') {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
            <div class="line">
                <input type="text" name="courseId" placeholder="CourseID" value="${courseId}">
                <input type="number" name="hole" placeholder="Hole" min="1" value="${hole}">
                <button type="button" class="toggle-markers-btn">Toggle Markers</button>
            </div>
            <div class="line">
                <select name="poi">
                    <option value="Green" ${poi === 'Green' ? 'selected' : ''}>Green</option>
                    <option value="Green Bunker" ${poi === 'Green Bunker' ? 'selected' : ''}>Green Bunker</option>
                    <option value="Fairway Bunker" ${poi === 'Fairway Bunker' ? 'selected' : ''}>Fairway Bunker</option>
                    <option value="Water" ${poi === 'Water' ? 'selected' : ''}>Water</option>
                    <option value="Trees" ${poi === 'Trees' ? 'selected' : ''}>Trees</option>
                    <option value="100 Marker" ${poi === '100 Marker' ? 'selected' : ''}>100 Marker</option>
                    <option value="150 Marker" ${poi === '150 Marker' ? 'selected' : ''}>150 Marker</option>
                    <option value="200 Marker" ${poi === '200 Marker' ? 'selected' : ''}>200 Marker</option>
                    <option value="Dogleg" ${poi === 'Dogleg' ? 'selected' : ''}>Dogleg</option>
                    <option value="Road" ${poi === 'Road' ? 'selected' : ''}>Road</option>
                    <option value="Tee Front" ${poi === 'Tee Front' ? 'selected' : ''}>Tee Front</option>
                    <option value="Tee Back" ${poi === 'Tee Back' ? 'selected' : ''}>Tee Back</option>
                </select>
                <select name="location">
                    <option value="F" ${location === 'F' ? 'selected' : ''}>Front</option>
                    <option value="C" ${location === 'C' ? 'selected' : ''}>Middle</option>
                    <option value="B" ${location === 'B' ? 'selected' : ''}>Back</option>
                </select>
                <select name="sideOfFairway">
                    <option value="L" ${sideOfFairway === 'L' ? 'selected' : ''}>Left</option>
                    <option value="C" ${sideOfFairway === 'C' ? 'selected' : ''}>Center</option>
                    <option value="R" ${sideOfFairway === 'R' ? 'selected' : ''}>Right</option>
                </select>
            </div>
            <div class="line">
                <input type="text" name="latitude" placeholder="Latitude" value="${latitude}" readonly>
                <input type="text" name="longitude" placeholder="Longitude" value="${longitude}" readonly>
                <button type="button" class="select-location-btn">Select Location</button>
            </div>
        `;

        fieldsContainer.appendChild(row);
        initializeRowEvents(row);
    }

    function initializeRowEvents(row) {
        row.querySelector('.select-location-btn').addEventListener('click', () => {
            const latField = row.querySelector('input[name="latitude"]');
            const lngField = row.querySelector('input[name="longitude"]');
            const poiField = row.querySelector('select[name="poi"]');

            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }

            map.on('mousemove', function (e) {
                if (tempMarker) {
                    tempMarker.setLatLng(e.latlng);
                } else {
                    tempMarker = L.circleMarker(e.latlng, {
                        radius: 8,
                        fillColor: 'blue',
                        color: 'black',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map);
                }
            });

            map.once('click', function (e) {
                const lat = e.latlng.lat.toFixed(7);
                const lng = e.latlng.lng.toFixed(7);

                latField.value = lat;
                lngField.value = lng;

                const markerColor = getMarkerColor(poiField.value);

                const existingMarkerIndex = markers.findIndex(m => m.row === row);
                if (existingMarkerIndex !== -1) {
                    map.removeLayer(markers[existingMarkerIndex].marker);
                    markers.splice(existingMarkerIndex, 1);
                }

                const marker = L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: markerColor,
                    color: 'black',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);

                markers.push({ row, marker, circles: [] });
                map.removeLayer(tempMarker);
                tempMarker = null;
                map.off('mousemove');
            });
        });

        row.querySelector('.toggle-markers-btn').addEventListener('click', () => {
            const markerIndex = markers.findIndex(m => m.row === row);
            if (markerIndex !== -1) {
                const markerObj = markers[markerIndex];
                if (markerObj.circles.length === 0) {
                    const lat = markerObj.marker.getLatLng().lat;
                    const lng = markerObj.marker.getLatLng().lng;
                    const circle1 = L.circle([lat, lng], {
                        radius: 100,
                        color: 'blue',
                        opacity: 0.5,
                        fillOpacity: 0,
                        fillColor: 'white',
                        fillOpacity: 0.1
                    }).addTo(map);
                    const circle2 = L.circle([lat, lng], {
                        radius: 150,
                        color: 'green',
                        opacity: 0.5,
                        fillOpacity: 0,
                        fillColor: 'white',
                        fillOpacity: 0.1
                    }).addTo(map);
                    const circle3 = L.circle([lat, lng], {
                        radius: 200,
                        color: 'red',
                        opacity: 0.5,
                        fillOpacity: 0,
                        fillColor: 'white',
                        fillOpacity: 0.1
                    }).addTo(map);
                    markerObj.circles.push(circle1, circle2, circle3);
                } else {
                    markerObj.circles.forEach(circle => {
                        if (map.hasLayer(circle)) {
                            map.removeLayer(circle);
                        } else {
                            map.addLayer(circle);
                        }
                    });
                }
            }
        });

        row.querySelector('input[name="courseId"]').addEventListener('input', (e) => {
            const newValue = e.target.value;
            document.querySelectorAll('input[name="courseId"]').forEach(input => input.value = newValue);
        });

        row.querySelector('input[name="hole"]').addEventListener('input', (e) => {
            const newValue = e.target.value;
            document.querySelectorAll('input[name="hole"]').forEach(input => input.value = newValue);
        });
    }

    function getMarkerColor(poiValue) {
        switch (poiValue) {
            case 'Green': return 'green';
            case 'Green Bunker': return 'lightgreen';
            case 'Fairway Bunker': return 'lightblue';
            case 'Water': return 'darkblue';
            case 'Trees': return 'darkgreen';
            case '100 Marker': return 'red';
            case '150 Marker': return 'white';
            case '200 Marker': return 'darkblue';
            case 'Dogleg': return 'purple';
            case 'Road': return 'gray';
            case 'Tee Front': return 'darkorange';
            case 'Tee Back': return 'lightorange';
            default: return 'black';
        }
    }

    document.getElementById('addRowBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addRow(courseId, hole);
    });

    document.getElementById('generateCSVBtn').addEventListener('click', () => {
        const rows = document.querySelectorAll('#fieldsContainer .row');
        let csvContent = '';
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input, select');
            const data = Array.from(inputs).map(input => input.value).join(',');
            csvContent += data + '\n';
        });

        const csvOutput = document.getElementById('csvOutput');
        csvOutput.value = csvContent.trim();

        document.getElementById('popup').style.display = 'block';
    });

    document.getElementById('resetRowsBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = parseInt(document.querySelector('input[name="hole"]').value) + 1;

        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }

        fieldsContainer.innerHTML = '';
        markers.forEach(m => {
            map.removeLayer(m.marker);
            m.circles.forEach(circle => map.removeLayer(circle));
        });
        markers = [];
        initializeRows(courseId, hole);
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const csvOutput = document.getElementById('csvOutput');
        csvOutput.select();
        document.execCommand('copy');
    });

    document.getElementById('closePopupBtn').addEventListener('click', () => {
        document.getElementById('popup').style.display = 'none';
    });

    // Funktioner for at tilføje foruddefinerede rækker
    function addGreenBunkerL(courseId, hole) {
        addRow(courseId, hole, 'Green Bunker', 'F', 'L');
        addRow(courseId, hole, 'Green Bunker', 'B', 'L');
    }

    function addGreenBunkerR(courseId, hole) {
        addRow(courseId, hole, 'Green Bunker', 'F', 'R');
        addRow(courseId, hole, 'Green Bunker', 'B', 'R');
    }

    function addFairwayBunkerL(courseId, hole) {
        addRow(courseId, hole, 'Fairway Bunker', 'F', 'L');
        addRow(courseId, hole, 'Fairway Bunker', 'B', 'L');
    }

    function addFairwayBunkerR(courseId, hole) {
        addRow(courseId, hole, 'Fairway Bunker', 'F', 'R');
        addRow(courseId, hole, 'Fairway Bunker', 'B', 'R');
    }

    function add100m(courseId, hole) {
        addRow(courseId, hole, '100 Marker', 'C', 'C');
    }

    function add150m(courseId, hole) {
        addRow(courseId, hole, '150 Marker', 'C', 'C');
    }

    function add200m(courseId, hole) {
        addRow(courseId, hole, '200 Marker', 'C', 'C');
    }

    function addDogled(courseId, hole) {
        addRow(courseId, hole, 'Dogleg', 'B', 'C');
        addRow(courseId, hole, 'Dogleg', 'F', 'L');
    }

    function addRoadL(courseId, hole) {
        addRow(courseId, hole, 'Road', 'C', 'L');
    }

    function addRoadC(courseId, hole) {
        addRow(courseId, hole, 'Road', 'C', 'C');
    }

    function addRoadR(courseId, hole) {
        addRow(courseId, hole, 'Road', 'C', 'R');
    }

    function addWaterL(courseId, hole) {
        addRow(courseId, hole, 'Water', 'F', 'L');
        addRow(courseId, hole, 'Water', 'B', 'L');
    }

    function addWaterR(courseId, hole) {
        addRow(courseId, hole, 'Water', 'F', 'R');
        addRow(courseId, hole, 'Water', 'B', 'R');
    }

    // Event listeners for knapperne
    document.getElementById('addGreenBunkerLBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addGreenBunkerL(courseId, hole);
    });

    document.getElementById('addGreenBunkerRBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addGreenBunkerR(courseId, hole);
    });

    document.getElementById('addFairwayBunkerLBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addFairwayBunkerL(courseId, hole);
    });

    document.getElementById('addFairwayBunkerRBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addFairwayBunkerR(courseId, hole);
    });

    document.getElementById('add100mBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        add100m(courseId, hole);
    });

    document.getElementById('add150mBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        add150m(courseId, hole);
    });

    document.getElementById('add200mBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        add200m(courseId, hole);
    });

    document.getElementById('addDogledBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addDogled(courseId, hole);
    });

    document.getElementById('addRoadLBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addRoadL(courseId, hole);
    });

    document.getElementById('addRoadCBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addRoadC(courseId, hole);
    });

    document.getElementById('addRoadRBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addRoadR(courseId, hole);
    });

    document.getElementById('addWaterLBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addWaterL(courseId, hole);
    });

    document.getElementById('addWaterRBtn').addEventListener('click', () => {
        const courseId = document.querySelector('input[name="courseId"]').value;
        const hole = document.querySelector('input[name="hole"]').value;
        addWaterR(courseId, hole);
    });

    function initializeRows(courseId = '', hole = '1') {
        addRow(courseId, hole, 'Green', 'L', 'C');
        addRow(courseId, hole, 'Green', 'C', 'C');
        addRow(courseId, hole, 'Green', 'B', 'C');
        addRow(courseId, hole, 'Tee Front', 'C', 'C');
        addRow(courseId, hole, 'Tee Back', 'C', 'C');
    }

    initializeRows();
});
