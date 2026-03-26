const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// JSON file helpers
const dataPath = (file) => path.join(__dirname, 'data', file);
const read = (file) => JSON.parse(fs.readFileSync(dataPath(file), 'utf8'));
const write = (file, data) => fs.writeFileSync(dataPath(file), JSON.stringify(data, null, 2));

// Haversine distance (km)
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371, toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Binary search by name (array must be sorted)
function binarySearch(arr, name) {
    let lo = 0, hi = arr.length - 1, key = name.toLowerCase();
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const n = arr[mid].name.toLowerCase();
        if (n === key) return arr[mid];
        n < key ? lo = mid + 1 : hi = mid - 1;
    }
    return null;
}

// Merge sort by distance_km
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const merge = (l, r) => {
        const res = []; let i = 0, j = 0;
        while (i < l.length && j < r.length)
            res.push(l[i].distance_km <= r[j].distance_km ? l[i++] : r[j++]);
        return res.concat(l.slice(i), r.slice(j));
    };
    return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}

// ===== HOSPITAL ROUTES =====
app.get('/api/hospitals', (req, res) => {
    const hospitals = read('hospitals.json').filter(h => h.is_active);
    res.json({ success: true, data: hospitals });
});

app.get('/api/hospitals/search', (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const sorted = read('hospitals.json').filter(h => h.is_active).sort((a, b) => a.name.localeCompare(b.name));
    const result = binarySearch(sorted, name);
    if (!result) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, data: result });
});

app.get('/api/hospitals/nearest', (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });
    const hospitals = read('hospitals.json').filter(h => h.is_active && h.available_beds > 0);
    if (!hospitals.length) return res.status(404).json({ success: false, message: 'No hospitals available' });
    const withDist = hospitals.map(h => ({ ...h, distance_km: haversine(+lat, +lng, h.latitude, h.longitude) }));
    res.json({ success: true, data: mergeSort(withDist) });
});

app.get('/api/hospitals/:id', (req, res) => {
    const h = read('hospitals.json').find(h => h.id === +req.params.id);
    if (!h) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, data: h });
});

app.post('/api/hospitals', (req, res) => {
    const { name, address, latitude, longitude, contact, specialization, available_beds } = req.body;
    if (!name || !address || !latitude || !longitude)
        return res.status(400).json({ success: false, message: 'name, address, latitude, longitude required' });
    const hospitals = read('hospitals.json');
    const newH = { id: Date.now(), name, address, latitude: +latitude, longitude: +longitude, contact, specialization, available_beds: +available_beds || 0, is_active: true };
    hospitals.push(newH);
    write('hospitals.json', hospitals);
    res.status(201).json({ success: true, message: 'Hospital added', id: newH.id });
});

// ===== LOCATION ROUTES =====
app.get('/api/locations', (req, res) => {
    res.json({ success: true, data: read('locations.json') });
});

app.post('/api/locations', (req, res) => {
    const { name, latitude, longitude, region, is_remote } = req.body;
    if (!name || !latitude || !longitude)
        return res.status(400).json({ success: false, message: 'name, latitude, longitude required' });
    const locations = read('locations.json');
    const newL = { id: Date.now(), name, latitude: +latitude, longitude: +longitude, region: region || null, is_remote: is_remote || false };
    locations.push(newL);
    write('locations.json', locations);
    res.status(201).json({ success: true, message: 'Location added', id: newL.id });
});

app.get('/', (req, res) => res.json({ message: 'Hospital & Location Module running' }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
