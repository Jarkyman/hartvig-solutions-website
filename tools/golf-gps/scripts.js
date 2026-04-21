document.addEventListener('DOMContentLoaded', () => {

    // ================================================================
    // MAP
    // ================================================================
    const map = L.map('map').setView([55.427105, 12.175586], 17);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 24, attribution: '© Esri'
    }).addTo(map);

    // ================================================================
    // CONSTANTS
    // ================================================================
    const POI_COLORS = {
        'Green':               '#16a34a',
        'Green Bunker':        '#84cc16',
        'Fairway Bunker':      '#eab308',
        'Water':               '#0284c7',
        'Trees':               '#166534',
        '100 Marker':          '#dc2626',
        '150 Marker':          '#f87171',
        '200 Marker':          '#991b1b',
        'Dogleg':              '#9333ea',
        'Road':                '#94a3b8',
        'Tee':                 '#ea580c',
        'Out of Bounds':       '#e2e8f0',
        'Penalty Area Yellow': '#facc15',
        'Penalty Area Red':    '#ef4444',
    };

    const POI_GEO_DEFAULT = {
        'Green':               'Polygon',
        'Green Bunker':        'Polygon',
        'Fairway Bunker':      'Polygon',
        'Water':               'Polygon',
        'Trees':               'Polygon',
        '100 Marker':          'Point',
        '150 Marker':          'Point',
        '200 Marker':          'Point',
        'Dogleg':              'Point',
        'Road':                'LineString',
        'Tee':                 'Polygon',
        'Out of Bounds':       'LineString',
        'Penalty Area Yellow': 'Polygon',
        'Penalty Area Red':    'Polygon',
    };

    // Course-scoped POIs: shared across holes, stored once per course
    const COURSE_SCOPED_POIS = new Set([
        'Road', 'Water', 'Trees', 'Out of Bounds', 'Penalty Area Yellow', 'Penalty Area Red'
    ]);

    const HOLE_POI_LIST   = Object.keys(POI_COLORS).filter(p => !COURSE_SCOPED_POIS.has(p));
    const COURSE_POI_LIST = Object.keys(POI_COLORS).filter(p => COURSE_SCOPED_POIS.has(p));
    const GEO_LIST = ['Point', 'LineString', 'Polygon'];

    const KEY_SESSION      = 'golfMapper_session';
    const KEY_ALL          = 'golfMapper_allFeatures';
    const KEY_HOLE_CACHE   = 'golfMapper_holeCache';
    const KEY_COURSE_CACHE = 'golfMapper_courseCache';

    // ================================================================
    // STATE
    // ================================================================
    let appState = { clubId: null, courseId: null, courseName: '', hole: 1, totalHoles: 18 };
    let mapLayers = [];
    let allFeatures = [];
    let holeRowsCache = {};    // { courseId: { hole: [rowData, ...] } }
    let courseRowsCache = {};   // { courseId: [rowData, ...] }
    let tempMarker = null;
    let drawSession = null;
    let clubsData = [];
    let coursesData = [];
    let teesData = [];

    // ================================================================
    // DOM REFS
    // ================================================================
    const $ = id => document.getElementById(id);
    const holeFieldsContainer   = $('holeFieldsContainer');
    const courseFieldsContainer  = $('courseFieldsContainer');
    const clubSelect       = $('clubSelect');
    const courseSelect     = $('courseSelect');
    const holeInput        = $('holeInput');
    const holeTotalDisplay = $('holeTotalDisplay');
    const courseIdDisplay  = $('courseIdDisplay');
    const totalFeatCount   = $('totalFeaturesCount');
    const drawingBanner    = $('drawingBanner');
    const drawingInfoText  = $('drawingInfoText');
    const drawPointCount   = $('drawingPointCount');
    const popup            = $('popup');
    const jsonOutput       = $('jsonOutput');
    const dropOverlay      = $('dropOverlay');

    // ================================================================
    // CSV PARSING
    // ================================================================
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const vals = line.split(',');
            const obj = {};
            headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
            return obj;
        });
    }

    async function loadClubs() {
        try {
            const text = await fetch('clubs.csv').then(r => r.text());
            clubsData = parseCSV(text).sort((a, b) => a.ClubName.localeCompare(b.ClubName));
            clubSelect.innerHTML = '<option value="">— Select Club —</option>';
            clubsData.forEach(c => {
                const o = document.createElement('option');
                o.value = c.ClubID; o.textContent = c.ClubName;
                clubSelect.appendChild(o);
            });
            if (appState.clubId) {
                clubSelect.value = appState.clubId;
                await loadCourses(appState.clubId);
                if (appState.courseId) {
                    courseSelect.value = appState.courseId;
                    updateCourseMeta();
                }
            }
        } catch (e) {
            clubSelect.innerHTML = '<option value="">Error loading clubs.csv</option>';
        }
    }

    async function loadCourses(clubId) {
        if (!coursesData.length) {
            const text = await fetch('courses.csv').then(r => r.text());
            coursesData = parseCSV(text);
        }
        if (!teesData.length) {
            try {
                const text = await fetch('tees.csv').then(r => r.text());
                teesData = parseCSV(text);
            } catch (e) {
                console.error('Error loading tees.csv', e);
            }
        }
        const filtered = coursesData.filter(c => c.ClubID === String(clubId));
        courseSelect.innerHTML = '<option value="">— Select Course —</option>';
        filtered.forEach(c => {
            const o = document.createElement('option');
            o.value = c.CourseID;
            o.textContent = `${c.CourseName} (${c.NumHoles}H)`;
            o.dataset.holes = c.NumHoles;
            courseSelect.appendChild(o);
        });
        courseSelect.disabled = filtered.length === 0;
    }

    function updateCourseMeta() {
        const sel = courseSelect.options[courseSelect.selectedIndex];
        if (!sel || !sel.value) {
            appState.courseId = null; appState.totalHoles = 18;
            courseIdDisplay.textContent = '—'; holeTotalDisplay.textContent = '/ 18';
            return;
        }
        appState.courseId   = sel.value;
        appState.courseName = sel.textContent;
        appState.totalHoles = parseInt(sel.dataset.holes) || 18;
        courseIdDisplay.textContent = sel.value;
        holeTotalDisplay.textContent = `/ ${appState.totalHoles}`;
        holeInput.max = appState.totalHoles;

        // Refresh all rows with new course's tees
        document.querySelectorAll('.poi-row').forEach(refreshRowTees);
    }

    // ================================================================
    // ROW DATA EXTRACTION
    // ================================================================
    function getRowData(row) {
        let extractedLabel = row.querySelector('[name="label"]')?.value || '';
        let teeIds = undefined;

        const poiVal = row.querySelector('[name="poi"]').value;
        if (poiVal === 'Tee') {
            const tempIds = [];
            row.querySelectorAll('.tee-badge.active').forEach(badge => {
                const id = parseInt(badge.getAttribute('data-teeid'), 10);
                if (!isNaN(id)) tempIds.push(id);
            });
            if (tempIds.length > 0) teeIds = tempIds;
        }

        return {
            poi:           poiVal,
            location:      row.querySelector('[name="location"]')?.value || 'C',
            sideOfFairway: row.querySelector('[name="sideOfFairway"]').value,
            geometryType:  row.querySelector('[name="geometryType"]').value,
            coordinates:   JSON.parse(row.dataset.coordinates || 'null'),
            label:         extractedLabel,
            teeIds:        teeIds
        };
    }

    // ================================================================
    // LOCALSTORAGE
    // ================================================================
    function saveState() {
        const c = appState.courseId || '';
        const h = appState.hole;
        // Persist hole rows
        if (!holeRowsCache[c]) holeRowsCache[c] = {};
        holeRowsCache[c][h] = [...holeFieldsContainer.querySelectorAll('.poi-row')].map(getRowData);
        // Persist course rows
        courseRowsCache[c] = [...courseFieldsContainer.querySelectorAll('.poi-row')].map(getRowData);
        rebuildAllFeatures();
        localStorage.setItem(KEY_SESSION, JSON.stringify({ ...appState }));
        localStorage.setItem(KEY_HOLE_CACHE, JSON.stringify(holeRowsCache));
        localStorage.setItem(KEY_COURSE_CACHE, JSON.stringify(courseRowsCache));
        localStorage.setItem(KEY_ALL, JSON.stringify(allFeatures));
        totalFeatCount.textContent = allFeatures.length;
    }

    function loadStateFromStorage() {
        try {
            const rawHC = localStorage.getItem(KEY_HOLE_CACHE);
            if (rawHC) holeRowsCache = JSON.parse(rawHC);
            const rawCC = localStorage.getItem(KEY_COURSE_CACHE);
            if (rawCC) courseRowsCache = JSON.parse(rawCC);
            const rawAll = localStorage.getItem(KEY_ALL);
            if (rawAll) { allFeatures = JSON.parse(rawAll); totalFeatCount.textContent = allFeatures.length; }
            const raw = localStorage.getItem(KEY_SESSION);
            if (!raw) return false;
            const s = JSON.parse(raw);
            appState = { clubId: s.clubId, courseId: s.courseId, courseName: s.courseName || '',
                         hole: s.hole || 1, totalHoles: s.totalHoles || 18 };
            holeInput.value = appState.hole;
            holeTotalDisplay.textContent = `/ ${appState.totalHoles}`;
            if (appState.courseId) courseIdDisplay.textContent = appState.courseId;
            const holeRestored = loadHoleRows(appState.hole);
            loadCourseRows();
            return holeRestored;
        } catch (e) { console.error('loadState error', e); }
        return false;
    }

    function clearHoleState() {
        mapLayers.filter(m => m.scope === 'hole').forEach(m => {
            map.hasLayer(m.layer) && map.removeLayer(m.layer);
            m.circles.forEach(c => map.hasLayer(c) && map.removeLayer(c));
        });
        mapLayers = mapLayers.filter(m => m.scope !== 'hole');
        holeFieldsContainer.innerHTML = '';
    }

    function clearCourseState() {
        mapLayers.filter(m => m.scope === 'course').forEach(m => {
            map.hasLayer(m.layer) && map.removeLayer(m.layer);
            m.circles.forEach(c => map.hasLayer(c) && map.removeLayer(c));
        });
        mapLayers = mapLayers.filter(m => m.scope !== 'course');
        courseFieldsContainer.innerHTML = '';
    }

    function saveCurrentHoleRows() {
        const c = appState.courseId || '';
        const h = appState.hole;
        if (!holeRowsCache[c]) holeRowsCache[c] = {};
        holeRowsCache[c][h] = [...holeFieldsContainer.querySelectorAll('.poi-row')].map(getRowData);
    }

    function loadHoleRows(hole) {
        const cached = holeRowsCache[appState.courseId || '']?.[hole];
        if (cached?.length) {
            cached.forEach(r => addRow(r.poi, r.location, r.sideOfFairway, r.geometryType, r.coordinates, 'hole', false, r.label, r.teeIds));
            return true;
        }
        return false;
    }

    function loadCourseRows() {
        clearCourseState();
        const cached = courseRowsCache[appState.courseId || ''];
        if (cached?.length) {
            cached.forEach(r => addRow(r.poi, r.location, r.sideOfFairway, r.geometryType, r.coordinates, 'course', false, r.label, r.teeIds));
        }
    }

    function switchHole(newHole) {
        saveCurrentHoleRows();
        clearHoleState();
        appState.hole = newHole;
        holeInput.value = newHole;
        if (!loadHoleRows(newHole)) initDefaultRows();
        saveState();
    }

    // ================================================================
    // BUILD ALL FEATURES
    // ================================================================
    function rebuildAllFeatures() {
        allFeatures = [];
        // Hole-scoped features
        for (const [courseId, holes] of Object.entries(holeRowsCache)) {
            for (const [holeStr, rows] of Object.entries(holes)) {
                const hole = parseInt(holeStr);
                rows.forEach(rd => {
                    allFeatures.push(...rowDataToHoleFeatures(rd, courseId, hole, rows));
                });
            }
        }
        // Course-scoped features
        for (const [courseId, rows] of Object.entries(courseRowsCache)) {
            rows.forEach(rd => {
                allFeatures.push(rowDataToCourseFeature(rd, courseId));
            });
        }
    }

    // Find the reference point for distance calculations.
    // If a dogleg exists with location=C, use that. Otherwise use Tee Front.
    function findReferencePoint(allRowsData) {
        // Prefer Dogleg center
        const dogleg = allRowsData.find(r => r.poi === 'Dogleg' && (r.location === 'C' || r.location === 'B') && r.coordinates?.length === 2);
        if (dogleg) return dogleg.coordinates;
        // Fallback to Tee centroid
        const tee = allRowsData.find(r => r.poi === 'Tee' && r.coordinates?.length && r.geometryType === 'Polygon');
        if (tee) return polygonCentroid(tee.coordinates[0]);
        // Also support old Tee Front points just in case
        const oldTee = allRowsData.find(r => r.poi === 'Tee Front' && r.coordinates?.length === 2);
        return oldTee?.coordinates || null;
    }

    function polygonCentroid(ring) {
        let sumLng = 0, sumLat = 0;
        // Exclude closing vertex if ring is closed
        const n = (ring[0][0] === ring[ring.length-1][0] && ring[0][1] === ring[ring.length-1][1]) ? ring.length - 1 : ring.length;
        for (let i = 0; i < n; i++) { sumLng += ring[i][0]; sumLat += ring[i][1]; }
        return [parseFloat((sumLng / n).toFixed(7)), parseFloat((sumLat / n).toFixed(7))];
    }

    function rowDataToHoleFeatures(rd, courseId, hole, allRowsData) {
        const { poi, location, sideOfFairway, geometryType, coordinates, label, teeIds } = rd;
        const base = { featureScope: 'hole', courseId, hole, poi, sideOfFairway, label };
        if (teeIds && teeIds.length > 0) base.teeIds = teeIds;

        // Green polygon → Front, Center, Back points
        if (poi === 'Green' && geometryType === 'Polygon' && coordinates) {
            const ref = findReferencePoint(allRowsData);
            const ring = coordinates[0];
            const center = polygonCentroid(ring);
            let frontPt = ring[0], backPt = ring[Math.floor(ring.length / 2)];
            if (ref) {
                const [rlng, rlat] = ref;
                let minD = Infinity, maxD = -Infinity;
                ring.forEach(pt => {
                    const d = (pt[0]-rlng)**2 + (pt[1]-rlat)**2;
                    if (d < minD) { minD = d; frontPt = pt; }
                    if (d > maxD) { maxD = d; backPt = pt; }
                });
            }
            return [
                { type: 'Feature', geometry: { type: 'Point', coordinates: frontPt }, properties: { ...base, location: 'F' } },
                { type: 'Feature', geometry: { type: 'Point', coordinates: center  }, properties: { ...base, location: 'C' } },
                { type: 'Feature', geometry: { type: 'Point', coordinates: backPt  }, properties: { ...base, location: 'B' } },
            ];
        }

        // Bunker polygon → Front, Back points
        const isBunkerLike = poi === 'Green Bunker' || poi === 'Fairway Bunker';
        if (isBunkerLike && geometryType === 'Polygon' && coordinates) {
            const ref = findReferencePoint(allRowsData);
            const ring = coordinates[0];
            let frontPt = ring[0], backPt = ring[Math.floor(ring.length / 2)];
            if (ref) {
                const [rlng, rlat] = ref;
                let minD = Infinity, maxD = -Infinity;
                ring.forEach(pt => {
                    const d = (pt[0]-rlng)**2 + (pt[1]-rlat)**2;
                    if (d < minD) { minD = d; frontPt = pt; }
                    if (d > maxD) { maxD = d; backPt = pt; }
                });
            }
            return [
                { type: 'Feature', geometry: { type: 'Point', coordinates: frontPt }, properties: { ...base, location: 'F' } },
                { type: 'Feature', geometry: { type: 'Point', coordinates: backPt  }, properties: { ...base, location: 'B' } },
            ];
        }

        return [{ type: 'Feature', geometry: coordinates ? { type: geometryType, coordinates } : null, properties: { ...base, location } }];
    }

    function rowDataToCourseFeature(rd, courseId) {
        const { poi, sideOfFairway, geometryType, coordinates, label, teeIds } = rd;
        const properties = {
            featureScope: 'course',
            courseId,
            poi,
            sideOfFairway,
            label
        };
        if (teeIds && teeIds.length > 0) properties.teeIds = teeIds;
        return {
            type: 'Feature',
            geometry: coordinates ? { type: geometryType, coordinates } : null,
            properties
        };
    }

    // ================================================================
    // ROW CREATION
    // ================================================================
    function opts(list, sel) {
        return list.map(v => `<option value="${v}"${v === sel ? ' selected' : ''}>${v}</option>`).join('');
    }

    function coordLabel(geoType, coords) {
        if (!coords) return '—';
        if (geoType === 'Point' && coords.length === 2) return `${+coords[1].toFixed(5)}, ${+coords[0].toFixed(5)}`;
        const pts = geoType === 'Polygon' ? coords[0] : coords;
        return `[${pts?.length || 0} pts]`;
    }

    function poiColor(poi) { return POI_COLORS[poi] || '#888'; }
    function leafletColor(color) { return color === '#e2e8f0' ? '#f8fafc' : color; }

    function getTeeBadgesHTML(teeIds = []) {
        if (!appState.courseId) return '<span style="font-size:10px; color:#888;">Select course first</span>';
        const courseTees = teesData.filter(t => t.CourseID === String(appState.courseId)).sort((a,b) => parseInt(b.Length18 || 0) - parseInt(a.Length18 || 0));
        if (courseTees.length === 0) return '<span style="font-size:10px; color:#888;">No tees found on course</span>';
        
        const arrIds = teeIds || [];
        const badges = courseTees.map(t => {
            const isActive = arrIds.includes(parseInt(t.TeeID, 10)) ? ' active' : '';
            return `<div class="tee-badge${isActive}" data-teeid="${t.TeeID}" style="--tee-color: ${t.TeeColor || '#ccc'}">${t.TeeName}</div>`;
        }).join('');
        return `<div class="tee-badges-container">${badges}</div>`;
    }

    function refreshRowTees(row) {
        const teeGrp = row.querySelector('.tee-field-group');
        if (!teeGrp) return;
        
        // Temporarily get current selected IDs if any
        const currentIds = [...row.querySelectorAll('.tee-badge.active')].map(b => parseInt(b.dataset.teeid, 10));
        
        const label = teeGrp.querySelector('label');
        teeGrp.innerHTML = '';
        if (label) teeGrp.appendChild(label);
        
        const container = document.createElement('div');
        container.innerHTML = getTeeBadgesHTML(currentIds);
        const badgeList = container.querySelectorAll('.tee-badge');
        teeGrp.appendChild(container.firstElementChild);
        
        // Re-attach listeners to the previously captured badges
        badgeList.forEach(badge => {
            badge.addEventListener('click', () => {
                badge.classList.toggle('active');
                saveState();
            });
        });
    }

    function addRow(poi = 'Green', location = 'C', sideOfFairway = 'C', geometryType = null, coordinates = null, scope = null, prependToTop = false, label = '', teeIds = []) {
        if (!scope) scope = COURSE_SCOPED_POIS.has(poi) ? 'course' : 'hole';
        if (!geometryType) geometryType = POI_GEO_DEFAULT[poi] || 'Point';
        const color = poiColor(poi);
        const isMulti = geometryType !== 'Point';
        const isCourseScope = scope === 'course';
        const poiList = isCourseScope ? COURSE_POI_LIST : HOLE_POI_LIST;
        const container = isCourseScope ? courseFieldsContainer : holeFieldsContainer;

        const row = document.createElement('div');
        row.className = 'poi-row';
        row.dataset.coordinates = JSON.stringify(coordinates);
        row.dataset.scope = scope;
        row.style.setProperty('--row-color', color);

        const teeBadgesHTML = getTeeBadgesHTML(teeIds);

        let middleFieldsHTML = '';
        const displayLabel = poi === 'Tee' ? 'none' : 'flex';
        const displayTees = poi === 'Tee' ? 'flex' : 'none';

        if (!isCourseScope) {
            middleFieldsHTML = `
                <div class="field-group">
                    <label>Location</label>
                    <select name="location">
                        <option value="F"${location==='F'?' selected':''}>Front</option>
                        <option value="C"${location==='C'?' selected':''}>Middle</option>
                        <option value="B"${location==='B'?' selected':''}>Back</option>
                    </select>
                </div>
                <div class="field-group field-group--wide label-field-group" style="display: ${displayLabel}; padding-top: 4px;">
                    <label>Tee/Label Name</label>
                    <input type="text" name="label" value="${label}" placeholder="e.g. 58 or Mens">
                </div>
                <div class="field-group field-group--wide tee-field-group" style="display: ${displayTees}; padding-top: 4px;">
                    <label>Select Tees</label>
                    ${teeBadgesHTML}
                </div>`;
        } else {
            middleFieldsHTML = `
                <div class="field-group field-group--wide label-field-group" style="display: ${displayLabel}; padding-top: 4px;">
                    <label>Tee/Label Name</label>
                    <input type="text" name="label" value="${label}" placeholder="e.g. 58 or Mens">
                </div>
                <div class="field-group field-group--wide tee-field-group" style="display: ${displayTees}; padding-top: 4px;">
                    <label>Select Tees</label>
                    ${teeBadgesHTML}
                </div>`;
        }

        row.innerHTML = `
            <div class="row-header">
                <span class="poi-badge">${poi}</span>
                ${isCourseScope ? '<span class="scope-tag">COURSE</span>' : ''}
                <div class="row-header-actions">
                    <button class="icon-btn toggle-btn" title="Toggle distance rings">◎</button>
                    <button class="icon-btn delete-btn" title="Delete">✕</button>
                </div>
            </div>
            <div class="row-fields">
                <div class="field-group">
                    <label>POI</label>
                    <select name="poi">${opts(poiList, poi)}</select>
                </div>
                ${middleFieldsHTML}
                <div class="field-group">
                    <label>Side</label>
                    <select name="sideOfFairway">
                        <option value="L"${sideOfFairway==='L'?' selected':''}>Left</option>
                        <option value="C"${sideOfFairway==='C'?' selected':''}>Center</option>
                        <option value="R"${sideOfFairway==='R'?' selected':''}>Right</option>
                    </select>
                </div>
                <div class="field-group">
                    <label>Geometry</label>
                    <select name="geometryType">${opts(GEO_LIST, geometryType)}</select>
                </div>
            </div>
            <div class="row-footer">
                <span class="coord-label">${coordLabel(geometryType, coordinates)}</span>
                <button class="locate-btn${isMulti ? ' draw-mode' : ''}">${isMulti ? '✏️ Draw' : '📍 Pick'}</button>
            </div>`;

        if (prependToTop) {
            container.prepend(row);
        } else {
            container.appendChild(row);
        }
        if (coordinates) restoreLayer(row, geometryType, coordinates, color, scope);
        initRowEvents(row, scope);
        requestAnimationFrame(() => row.classList.add('poi-row--in'));
        return row;
    }

    function restoreLayer(row, geoType, coords, color, scope) {
        const lc = leafletColor(color);
        let layer;
        if (geoType === 'Point') {
            layer = L.circleMarker([coords[1], coords[0]], { radius: 8, fillColor: lc, color: '#1e293b', weight: 2, fillOpacity: 0.9 }).addTo(map);
        } else if (geoType === 'LineString') {
            layer = L.polyline(coords.map(c => [c[1], c[0]]), { color: lc, weight: 3 }).addTo(map);
        } else if (geoType === 'Polygon') {
            layer = L.polygon(coords[0].map(c => [c[1], c[0]]), { color: lc, fillColor: lc, fillOpacity: 0.2, weight: 2 }).addTo(map);
        }
        if (layer) mapLayers.push({ row, layer, circles: [], geometryType: geoType, scope });
    }

    function initRowEvents(row, scope) {
        const poiSel = row.querySelector('[name="poi"]');
        const geoSel = row.querySelector('[name="geometryType"]');
        const coordSpan = row.querySelector('.coord-label');
        const locateBtn = row.querySelector('.locate-btn');
        const badge = row.querySelector('.poi-badge');

        function syncStyle() {
            const color = poiColor(poiSel.value);
            row.style.setProperty('--row-color', color);
            badge.textContent = poiSel.value;
            const isMulti = geoSel.value !== 'Point';
            locateBtn.textContent = isMulti ? '✏️ Draw' : '📍 Pick';
            locateBtn.className = `locate-btn${isMulti ? ' draw-mode' : ''}`;
        }

        function updateLayerStyle() {
            const entry = mapLayers.find(m => m.row === row);
            if (entry && map.hasLayer(entry.layer)) {
                const lc = leafletColor(poiColor(poiSel.value));
                if (entry.geometryType === 'Point') {
                    entry.layer.setStyle({ fillColor: lc });
                } else {
                    entry.layer.setStyle({ color: lc, fillColor: lc });
                }
            }
        }

        poiSel.addEventListener('change', () => {
            const oldGeo = geoSel.value;
            geoSel.value = POI_GEO_DEFAULT[poiSel.value] || 'Point';
            syncStyle();

            const lblGrp = row.querySelector('.label-field-group');
            const teeGrp = row.querySelector('.tee-field-group');
            if (lblGrp && teeGrp) {
                lblGrp.style.display = poiSel.value === 'Tee' ? 'none' : 'flex';
                teeGrp.style.display = poiSel.value === 'Tee' ? 'flex' : 'none';
                if (poiSel.value === 'Tee') refreshRowTees(row);
            }
            
            const entry = mapLayers.find(m => m.row === row);
            if (entry) {
                if (oldGeo !== geoSel.value) {
                    // Geometry mismatch, coordinates are invalid, need to redraw
                    map.hasLayer(entry.layer) && map.removeLayer(entry.layer);
                    entry.circles.forEach(c => map.hasLayer(c) && map.removeLayer(c));
                    mapLayers.splice(mapLayers.indexOf(entry), 1);
                    row.dataset.coordinates = '';
                    coordSpan.textContent = '—';
                } else {
                    updateLayerStyle();
                }
            }
            saveState();
        });
        
        geoSel.addEventListener('change', () => { 
            syncStyle(); 
            const entry = mapLayers.find(m => m.row === row);
            if (entry && entry.geometryType !== geoSel.value) {
                map.hasLayer(entry.layer) && map.removeLayer(entry.layer);
                entry.circles.forEach(c => map.hasLayer(c) && map.removeLayer(c));
                mapLayers.splice(mapLayers.indexOf(entry), 1);
                row.dataset.coordinates = '';
                coordSpan.textContent = '—';
            }
            saveState(); 
        });
        row.querySelectorAll('select, input').forEach(s => s.addEventListener('change', saveState));

        locateBtn.addEventListener('click', () => {
            geoSel.value === 'Point' ? startPointPick(row, coordSpan) : startDrawing(row, geoSel.value, coordSpan);
        });

        row.querySelector('.toggle-btn').addEventListener('click', () => {
            const entry = mapLayers.find(m => m.row === row);
            if (!entry || entry.geometryType !== 'Point') return;
            if (!entry.circles.length) {
                const latlng = entry.layer.getLatLng();
                [{ r: 100, c: '#3b82f6' }, { r: 150, c: '#22c55e' }, { r: 200, c: '#ef4444' }].forEach(({ r, c }) => {
                    entry.circles.push(L.circle(latlng, { radius: r, color: c, weight: 1.5, fillOpacity: 0.04 }).addTo(map));
                });
            } else {
                entry.circles.forEach(c => map.hasLayer(c) ? map.removeLayer(c) : map.addLayer(c));
            }
        });

        // Initialize tee interaction
        refreshRowTees(row);

        row.querySelector('.delete-btn').addEventListener('click', () => {
            const idx = mapLayers.findIndex(m => m.row === row);
            if (idx !== -1) {
                map.hasLayer(mapLayers[idx].layer) && map.removeLayer(mapLayers[idx].layer);
                mapLayers[idx].circles.forEach(c => map.hasLayer(c) && map.removeLayer(c));
                mapLayers.splice(idx, 1);
            }
            row.remove(); saveState();
        });
    }

    // ================================================================
    // POINT PICK
    // ================================================================
    let pickCancel = null;

    function startPointPick(row, coordSpan) {
        if (pickCancel) pickCancel();
        if (drawSession) cancelDrawing();

        if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
        map.getContainer().style.cursor = 'crosshair';

        const onMove = e => {
            if (tempMarker) tempMarker.setLatLng(e.latlng);
            else tempMarker = L.circleMarker(e.latlng, { radius: 8, fillColor: '#60a5fa', color: '#000', weight: 1, fillOpacity: 0.7 }).addTo(map);
        };
        const onClick = e => {
            pickCancel = null;
            map.off('mousemove', onMove);
            if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
            map.getContainer().style.cursor = '';

            const coords = [parseFloat(e.latlng.lng.toFixed(7)), parseFloat(e.latlng.lat.toFixed(7))];
            row.dataset.coordinates = JSON.stringify(coords);
            coordSpan.textContent = coordLabel('Point', coords);

            const scope = row.dataset.scope || 'hole';
            const idx = mapLayers.findIndex(m => m.row === row);
            if (idx !== -1) {
                map.hasLayer(mapLayers[idx].layer) && map.removeLayer(mapLayers[idx].layer);
                mapLayers[idx].circles.forEach(c => map.hasLayer(c) && map.removeLayer(c));
                mapLayers.splice(idx, 1);
            }
            const poi = row.querySelector('[name="poi"]').value;
            const lc = leafletColor(poiColor(poi));
            const layer = L.circleMarker([coords[1], coords[0]], { radius: 8, fillColor: lc, color: '#1e293b', weight: 2, fillOpacity: 0.9 }).addTo(map);
            mapLayers.push({ row, layer, circles: [], geometryType: 'Point', scope });
            saveState();
        };

        pickCancel = () => {
            map.off('mousemove', onMove);
            map.off('click', onClick);
            if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
            map.getContainer().style.cursor = '';
            pickCancel = null;
        };

        map.on('mousemove', onMove);
        map.once('click', onClick);
    }

    // ================================================================
    // DRAWING MODE
    // ================================================================
    let drawType = 'click';

    function setDrawType(type) {
        drawType = type;
        $('modeClickBtn').classList.toggle('mode-btn--active', type === 'click');
        $('modeFreehandBtn').classList.toggle('mode-btn--active', type === 'freehand');
        // Show/hide undo based on mode
        $('undoDrawBtn').style.display = type === 'freehand' ? 'none' : '';
        if (!drawSession) return;
        updateDrawInfoText();
        if (type === 'freehand') {
            map.off('click', onDrawClick);
            map.off('dblclick', onDrawDblClick);
            map.on('mousedown', onFreehandStart);
        } else {
            map.off('mousedown', onFreehandStart);
            map.on('click', onDrawClick);
            map.on('dblclick', onDrawDblClick);
        }
    }

    function updateDrawInfoText() {
        if (!drawSession) return;
        const { geoType } = drawSession;
        if (drawType === 'freehand') {
            drawingInfoText.textContent = 'Hold mouse button and drag to draw. Then click Finish or Clear to redraw.';
        } else {
            drawingInfoText.textContent = geoType === 'Polygon'
                ? 'Click to add points. Click near start or Finish to close.'
                : 'Click to add points. Double-click or Finish to complete.';
        }
    }

    function startDrawing(row, geoType, coordSpan) {
        if (pickCancel) pickCancel();
        if (drawSession) cancelDrawing();
        drawSession = { row, geoType, coordSpan, points: [], previewLayer: null, vertexMarkers: [] };
        
        // Hide existing mapLayer to avoid duplicate visual and prepare for editing
        const idx = mapLayers.findIndex(m => m.row === row);
        if (idx !== -1) {
            if (map.hasLayer(mapLayers[idx].layer)) map.removeLayer(mapLayers[idx].layer);
            mapLayers[idx].circles.forEach(c => { if(map.hasLayer(c)) map.removeLayer(c); });
            mapLayers.splice(idx, 1);
        }

        // Load existing coordinates into the drawing session if they exist
        if (row.dataset.coordinates) {
            try {
                let coords = JSON.parse(row.dataset.coordinates);
                if (geoType === 'LineString' && Array.isArray(coords)) {
                    drawSession.points = coords;
                } else if (geoType === 'Polygon' && Array.isArray(coords) && coords[0]) {
                    drawSession.points = [...coords[0]];
                    // Pop redundant closing point so editing/freehand works naturally
                    const last = drawSession.points[drawSession.points.length - 1];
                    const first = drawSession.points[0];
                    if (drawSession.points.length > 2 && last[0] === first[0] && last[1] === first[1]) {
                        drawSession.points.pop();
                    }
                }
                
                // Render editable vertex markers
                drawSession.points.forEach(pt => {
                    const vm = L.circleMarker([pt[1], pt[0]], { radius: 4, fillColor: '#fff', color: '#3b82f6', weight: 2, fillOpacity: 1 }).addTo(map);
                    drawSession.vertexMarkers.push(vm);
                });
            } catch (e) {
                console.error("Failed to parse existing coords", e);
            }
        }

        map.getContainer().style.cursor = 'crosshair';
        drawingBanner.classList.remove('hidden');
        drawPointCount.textContent = `${drawSession.points.length} pts`;
        
        if (drawSession.points.length > 0) {
            updateDrawPreview();
        }
        
        updateDrawInfoText();
        if (drawType === 'freehand') {
            map.on('mousedown', onFreehandStart);
        } else {
            map.on('click', onDrawClick);
            map.on('dblclick', onDrawDblClick);
        }
    }

    function onDrawClick(e) {
        if (!drawSession) return;
        L.DomEvent.stopPropagation(e);
        const { points, vertexMarkers, geoType } = drawSession;

        if (geoType === 'Polygon' && points.length >= 3) {
            const fp = map.latLngToContainerPoint(L.latLng(points[0][1], points[0][0]));
            const cp = map.latLngToContainerPoint(e.latlng);
            if (Math.hypot(fp.x - cp.x, fp.y - cp.y) < 15) { finishDrawing(); return; }
        }

        const pt = [parseFloat(e.latlng.lng.toFixed(7)), parseFloat(e.latlng.lat.toFixed(7))];
        points.push(pt);
        vertexMarkers.push(L.circleMarker([pt[1], pt[0]], { radius: 4, fillColor: '#fff', color: '#3b82f6', weight: 2, fillOpacity: 1 }).addTo(map));
        updateDrawPreview();
        drawPointCount.textContent = `${points.length} pts`;
    }

    function onDrawDblClick(e) {
        L.DomEvent.stopPropagation(e);
        if (drawSession?.points.length >= 2) finishDrawing();
    }

    function updateDrawPreview() {
        const { points, geoType, previewLayer, row } = drawSession;
        if (previewLayer) map.removeLayer(previewLayer);
        if (points.length < 2) return;
        const lls = points.map(p => [p[1], p[0]]);
        const color = poiColor(row.querySelector('[name="poi"]').value);
        const lc = leafletColor(color);
        drawSession.previewLayer = geoType === 'LineString'
            ? L.polyline(lls, { color: lc, weight: 3, dashArray: '6 4' }).addTo(map)
            : L.polygon(lls, { color: lc, fillColor: lc, fillOpacity: 0.15, weight: 2, dashArray: '6 4' }).addTo(map);
    }

    function undoDrawPoint() {
        if (!drawSession?.points.length) return;
        drawSession.points.pop();
        const vm = drawSession.vertexMarkers.pop();
        vm && map.removeLayer(vm);
        updateDrawPreview();
        drawPointCount.textContent = `${drawSession.points.length} pts`;
    }

    function finishDrawing() {
        if (!drawSession) return;
        const { row, geoType, points, coordSpan, previewLayer, vertexMarkers } = drawSession;
        if (points.length < 2) { cancelDrawing(); return; }

        let coords;
        if (geoType === 'LineString') {
            coords = points;
        } else {
            const ring = [...points];
            if (ring[0][0] !== ring[ring.length-1][0] || ring[0][1] !== ring[ring.length-1][1]) ring.push(ring[0]);
            coords = [ring];
        }

        row.dataset.coordinates = JSON.stringify(coords);
        coordSpan.textContent = coordLabel(geoType, coords);

        if (previewLayer) map.removeLayer(previewLayer);
        vertexMarkers.forEach(vm => map.removeLayer(vm));

        const scope = row.dataset.scope || 'hole';
        const idx = mapLayers.findIndex(m => m.row === row);
        if (idx !== -1) {
            map.hasLayer(mapLayers[idx].layer) && map.removeLayer(mapLayers[idx].layer);
            mapLayers[idx].circles.forEach(c => map.hasLayer(c) && map.removeLayer(c));
            mapLayers.splice(idx, 1);
        }

        const poi = row.querySelector('[name="poi"]').value;
        const lc = leafletColor(poiColor(poi));
        let layer;
        if (geoType === 'LineString') {
            layer = L.polyline(coords.map(c => [c[1], c[0]]), { color: lc, weight: 3 }).addTo(map);
        } else {
            layer = L.polygon(coords[0].map(c => [c[1], c[0]]), { color: lc, fillColor: lc, fillOpacity: 0.2, weight: 2 }).addTo(map);
        }
        mapLayers.push({ row, layer, circles: [], geometryType: geoType, scope });

        map.off('click', onDrawClick);
        map.off('dblclick', onDrawDblClick);
        map.getContainer().style.cursor = '';
        drawingBanner.classList.add('hidden');
        drawSession = null;
        saveState();
    }

    // ── Freehand drawing ──────────────────────────────────────────
    const FREEHAND_MIN_PX = 15;
    let freehandActive = false;

    function onFreehandStart(e) {
        if (!drawSession) return;
        L.DomEvent.stopPropagation(e);
        freehandActive = true;
        map.dragging.disable();
        drawSession.points = [];
        drawSession.vertexMarkers.forEach(vm => map.removeLayer(vm));
        drawSession.vertexMarkers = [];
        if (drawSession.previewLayer) { map.removeLayer(drawSession.previewLayer); drawSession.previewLayer = null; }
        addFreehandPoint(e.latlng);
        map.on('mousemove', onFreehandMove);
        window.addEventListener('mouseup', onFreehandEnd, { once: true });
    }

    function onFreehandMove(e) {
        if (!freehandActive || !drawSession) return;
        const { points } = drawSession;
        if (points.length > 0) {
            const last = points[points.length - 1];
            const lastPx = map.latLngToContainerPoint(L.latLng(last[1], last[0]));
            const curPx  = map.latLngToContainerPoint(e.latlng);
            if (Math.hypot(lastPx.x - curPx.x, lastPx.y - curPx.y) < FREEHAND_MIN_PX) return;
        }
        addFreehandPoint(e.latlng);
    }

    function addFreehandPoint(latlng) {
        const pt = [parseFloat(latlng.lng.toFixed(7)), parseFloat(latlng.lat.toFixed(7))];
        drawSession.points.push(pt);
        updateDrawPreview();
        drawPointCount.textContent = `${drawSession.points.length} pts`;
    }

    function onFreehandEnd() {
        if (!freehandActive) return;
        freehandActive = false;
        map.off('mousemove', onFreehandMove);
        map.dragging.enable();
        // Don't auto-finish — let user review, then Finish or Clear
        if (!drawSession || drawSession.points.length < 2) {
            // Too few points, just reset for another try
            if (drawSession) {
                drawSession.points = [];
                if (drawSession.previewLayer) { map.removeLayer(drawSession.previewLayer); drawSession.previewLayer = null; }
                drawPointCount.textContent = '0 pts';
                drawingInfoText.textContent = 'Not enough points. Try again or Cancel.';
            }
            return;
        }
        // Show preview, update info, wait for user action
        drawingInfoText.textContent = `${drawSession.points.length} points drawn. Click Finish to keep, or Clear to redraw.`;
        map.getContainer().style.cursor = '';
    }

    function cancelDrawing() {
        if (!drawSession) return;
        const { previewLayer, vertexMarkers, row, geoType } = drawSession;
        if (previewLayer) map.removeLayer(previewLayer);
        vertexMarkers.forEach(vm => map.removeLayer(vm));
        map.off('click', onDrawClick);
        map.off('dblclick', onDrawDblClick);
        map.off('mousedown', onFreehandStart);
        map.off('mousemove', onFreehandMove);
        window.removeEventListener('mouseup', onFreehandEnd);
        if (freehandActive) { map.dragging.enable(); freehandActive = false; }
        map.getContainer().style.cursor = '';
        drawingBanner.classList.add('hidden');
        
        // Restore old visual layer if the row had valid coordinates unchanged
        if (row.dataset.coordinates) {
            try {
                const coords = JSON.parse(row.dataset.coordinates);
                const color = poiColor(row.querySelector('[name="poi"]').value);
                const scope = row.dataset.scope || 'hole';
                if (mapLayers.findIndex(m => m.row === row) === -1) {
                    restoreLayer(row, geoType, coords, color, scope);
                }
            } catch(e) {}
        }
        
        drawSession = null;
    }

    // ================================================================
    // IMPORT (drag & drop)
    // ================================================================
    function importGeoJSON(geojson) {
        if (geojson?.type !== 'FeatureCollection') { alert('Not a valid FeatureCollection.'); return; }
        let added = 0;
        geojson.features.forEach(f => {
            if (!f.properties) return;
            const key = JSON.stringify({ scope: f.properties.featureScope, courseId: f.properties.courseId,
                hole: f.properties.hole, poi: f.properties.poi, location: f.properties.location,
                side: f.properties.sideOfFairway });
            if (!allFeatures.some(x => JSON.stringify({ scope: x.properties.featureScope, courseId: x.properties.courseId,
                hole: x.properties.hole, poi: x.properties.poi, location: x.properties.location,
                side: x.properties.sideOfFairway }) === key)) {
                allFeatures.push(f); added++;
            }
        });
        saveState();
        alert(`Imported ${added} new features (${allFeatures.length} total).`);
    }

    document.addEventListener('dragover', e => { e.preventDefault(); dropOverlay.classList.remove('hidden'); });
    document.addEventListener('dragleave', e => { if (!e.relatedTarget) dropOverlay.classList.add('hidden'); });
    dropOverlay.addEventListener('dragover', e => e.preventDefault());
    dropOverlay.addEventListener('drop', e => {
        e.preventDefault(); dropOverlay.classList.add('hidden');
        const file = e.dataTransfer.files[0];
        if (!file?.name.match(/\.geojson$/)) { alert('Please drop a .geojson file.'); return; }
        const reader = new FileReader();
        reader.onload = ev => { try { importGeoJSON(JSON.parse(ev.target.result)); } catch { alert('Invalid JSON file.'); } };
        reader.readAsText(file);
    });

    // ================================================================
    // QUICK ADD
    // ================================================================
    const QUICK = {
        // Hole-scoped (using prependToTop = true)
        addGreenBunkerL:   () => addRow('Green Bunker',  'C', 'L', 'Polygon', null, 'hole', true),
        addGreenBunkerC:   () => addRow('Green Bunker',  'C', 'C', 'Polygon', null, 'hole', true),
        addGreenBunkerR:   () => addRow('Green Bunker',  'C', 'R', 'Polygon', null, 'hole', true),
        addFairwayBunkerL: () => addRow('Fairway Bunker','C', 'L', 'Polygon', null, 'hole', true),
        addFairwayBunkerC: () => addRow('Fairway Bunker','C', 'C', 'Polygon', null, 'hole', true),
        addFairwayBunkerR: () => addRow('Fairway Bunker','C', 'R', 'Polygon', null, 'hole', true),
        add100m:           () => addRow('100 Marker','C','C', null, null, 'hole', true),
        add150m:           () => addRow('150 Marker','C','C', null, null, 'hole', true),
        add200m:           () => addRow('200 Marker','C','C', null, null, 'hole', true),
        addDogled:         () => [addRow('Dogleg','B','C', null, null, 'hole', true), addRow('Dogleg','F','L', null, null, 'hole', true)],
        addTee:            () => addRow('Tee', 'C', 'C', 'Polygon', null, 'hole', true),
        // Course-scoped (using prependToTop = true)
        addWaterL:         () => addRow('Water','C','L','Polygon', null, 'course', true),
        addWaterC:         () => addRow('Water','C','C','Polygon', null, 'course', true),
        addWaterR:         () => addRow('Water','C','R','Polygon', null, 'course', true),
        addRoadL:          () => addRow('Road','C','L','LineString', null, 'course', true),
        addRoadC:          () => addRow('Road','C','C','LineString', null, 'course', true),
        addRoadR:          () => addRow('Road','C','R','LineString', null, 'course', true),
        addOOB:            () => addRow('Out of Bounds','C','C','LineString', null, 'course', true),
        addPenaltyYellow:  () => addRow('Penalty Area Yellow','C','C','Polygon', null, 'course', true),
        addPenaltyRed:     () => addRow('Penalty Area Red','C','C','Polygon', null, 'course', true),
        addTrees:          () => addRow('Trees','C','C', null, null, 'course', true),
    };

    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => { 
            const action = QUICK[btn.dataset.action];
            if (action) {
                const result = action();
                saveState();
                // If it's a single row, auto-click its locate button
                if (result && !Array.isArray(result) && result.querySelector) {
                    result.querySelector('.locate-btn').click();
                } else if (Array.isArray(result) && result[0] && result[0].querySelector) {
                    // For Dogleg (array of rows), auto-click the first one
                    result[0].querySelector('.locate-btn').click();
                }
            }
        });
    });

    // ================================================================
    // MAIN BUTTON EVENTS
    // ================================================================
    clubSelect.addEventListener('change', async () => {
        appState.clubId = clubSelect.value || null;
        appState.courseId = null; courseIdDisplay.textContent = '—';
        if (clubSelect.value) {
            await loadCourses(clubSelect.value);
            const club = clubsData.find(c => c.ClubID === clubSelect.value);
            if (club && club.Latitude && club.Longitude) {
                map.flyTo([parseFloat(club.Latitude), parseFloat(club.Longitude)], 16, { duration: 1.2 });
            }
        }
        saveState();
    });

    courseSelect.addEventListener('change', () => { updateCourseMeta(); loadCourseRows(); saveState(); });
    
    if ($('locateClubBtn')) {
        $('locateClubBtn').addEventListener('click', () => {
            const clubId = clubSelect.value;
            if (!clubId) return;
            const club = clubsData.find(c => c.ClubID === clubId);
            if (club && club.Latitude && club.Longitude) {
                map.flyTo([parseFloat(club.Latitude), parseFloat(club.Longitude)], 16, { duration: 1.2 });
            }
        });
    }

    holeInput.addEventListener('change', () => {
        let v = Math.max(1, Math.min(parseInt(holeInput.value) || 1, appState.totalHoles));
        switchHole(v);
    });

    $('prevHoleBtn').addEventListener('click', () => {
        if (appState.hole > 1) switchHole(appState.hole - 1);
    });

    $('nextHoleBtn').addEventListener('click', () => {
        if (appState.hole < appState.totalHoles) switchHole(appState.hole + 1);
    });

    const confirmModal = $('confirmModal');

    function doResetAll() {
        allFeatures = [];
        holeRowsCache = {};
        courseRowsCache = {};
        localStorage.removeItem(KEY_SESSION);
        localStorage.removeItem(KEY_HOLE_CACHE);
        localStorage.removeItem(KEY_COURSE_CACHE);
        localStorage.removeItem(KEY_ALL);
        clearHoleState();
        clearCourseState();
        appState = { clubId: null, courseId: null, courseName: '', hole: 1, totalHoles: 18 };
        clubSelect.value = '';
        courseSelect.innerHTML = '<option value="">Select club first</option>';
        courseSelect.disabled = true;
        holeInput.value = 1;
        holeTotalDisplay.textContent = '/ 18';
        courseIdDisplay.textContent = '—';
        totalFeatCount.textContent = '0';
        initDefaultRows();
        saveState();
    }

    $('resetAllBtn').addEventListener('click', () => {
        confirmModal.classList.remove('hidden');
    });

    $('confirmCancelBtn').addEventListener('click', () => {
        confirmModal.classList.add('hidden');
    });

    $('confirmOkBtn').addEventListener('click', () => {
        confirmModal.classList.add('hidden');
        doResetAll();
    });

    $('generateJSONBtn').addEventListener('click', () => {
        saveCurrentHoleRows();
        rebuildAllFeatures();
        const geojson = { type: 'FeatureCollection', features: allFeatures };
        jsonOutput.value = JSON.stringify(geojson, null, 2);
        $('popupFeatureCount').textContent = `${allFeatures.length} features`;
        popup.style.display = 'flex';
    });

    $('resetRowsBtn').addEventListener('click', () => {
        const next = appState.hole < appState.totalHoles ? appState.hole + 1 : appState.hole;
        switchHole(next);
    });

    $('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(jsonOutput.value).catch(() => { jsonOutput.select(); document.execCommand('copy'); });
    });

    $('downloadBtn').addEventListener('click', () => {
        const content = jsonOutput.value; if (!content) return;
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([content], { type: 'application/geo+json' })),
            download: `${appState.courseId || 'course'}_all_holes.geojson`
        });
        a.click(); URL.revokeObjectURL(a.href);
    });

    $('clearAllFeaturesBtn').addEventListener('click', () => {
        if (!confirm('Clear ALL features for ALL holes? Cannot be undone.')) return;
        allFeatures = [];
        holeRowsCache = {};
        courseRowsCache = {};
        localStorage.removeItem(KEY_HOLE_CACHE);
        localStorage.removeItem(KEY_COURSE_CACHE);
        localStorage.removeItem(KEY_ALL);
        clearHoleState();
        clearCourseState();
        initDefaultRows();
        saveState();
        popup.style.display = 'none';
    });

    $('closePopupBtn').addEventListener('click', () => { popup.style.display = 'none'; });
    $('undoDrawBtn').addEventListener('click', undoDrawPoint);
    $('clearDrawBtn').addEventListener('click', () => {
        if (!drawSession) return;
        // Remove all drawn points and preview
        drawSession.vertexMarkers.forEach(vm => map.removeLayer(vm));
        drawSession.vertexMarkers = [];
        drawSession.points = [];
        if (drawSession.previewLayer) { map.removeLayer(drawSession.previewLayer); drawSession.previewLayer = null; }
        drawPointCount.textContent = '0 pts';
        // Re-enable drawing so user can try again
        map.getContainer().style.cursor = 'crosshair';
        updateDrawInfoText();
        if (drawType === 'freehand') {
            map.on('mousedown', onFreehandStart);
        }
    });
    $('finishDrawBtn').addEventListener('click', finishDrawing);
    $('cancelDrawBtn').addEventListener('click', cancelDrawing);
    $('modeClickBtn').addEventListener('click', () => setDrawType('click'));
    $('modeFreehandBtn').addEventListener('click', () => setDrawType('freehand'));

    // ================================================================
    // INIT
    // ================================================================
    function initDefaultRows() {
        addRow('Green', 'C', 'C', 'Polygon', null, 'hole');
        addRow('Tee', 'C', 'C', 'Polygon', null, 'hole');
    }

    async function init() {
        const restored = loadStateFromStorage();
        if (!restored) initDefaultRows();
        await loadClubs();
    }

    init();
});
