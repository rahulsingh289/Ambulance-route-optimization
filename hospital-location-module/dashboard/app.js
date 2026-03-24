// ===== CONFIG =====
const API = 'http://localhost:3001/api';

// ===== STATE =====
let allHospitals = [];
let allLocations = [];

// ===== NAVIGATION =====
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    const navEl = document.querySelector(`[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');

    const meta = {
        'dashboard':        { title: 'Dashboard',              sub: 'Hospital & Location Management Module' },
        'hospitals':        { title: 'All Hospitals',          sub: 'View, edit and manage hospital records' },
        'add-hospital':     { title: 'Add Hospital',           sub: 'Register a new hospital in the system' },
        'search-hospital':  { title: 'Search Hospital',        sub: 'Binary search by exact hospital name' },
        'nearest-hospital': { title: 'Find Nearest Hospital',  sub: 'Haversine distance + Merge Sort ranking' },
        'locations':        { title: 'All Locations',          sub: 'Tracked geographic points for dispatch' },
        'add-location':     { title: 'Add Location',           sub: 'Register a new location or remote area' },
    };
    const m = meta[page] || { title: page, sub: '' };
    document.getElementById('pageTitle').textContent = m.title;
    document.getElementById('pageSubtitle').textContent = m.sub;

    if (page === 'hospitals') loadHospitals();
    if (page === 'locations') loadLocations();
    if (page === 'dashboard') loadDashboard();
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        navigate(item.dataset.page);
    });
});

// ===== API HELPERS =====
async function apiFetch(path, options = {}) {
    try {
        const res = await fetch(`${API}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        return await res.json();
    } catch (err) {
        return { success: false, message: 'Cannot connect to server. Is it running?' };
    }
}

// ===== API STATUS CHECK =====
async function checkApiStatus() {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('apiStatusText');
    try {
        const res = await fetch('http://localhost:3001/');
        if (res.ok) {
            dot.className = 'status-dot online';
            text.textContent = 'API Online';
        } else throw new Error();
    } catch {
        dot.className = 'status-dot offline';
        text.textContent = 'API Offline';
    }
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.getElementById('toast');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== MODAL =====
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

// ===== DASHBOARD =====
async function loadDashboard() {
    const [hRes, lRes] = await Promise.all([
        apiFetch('/hospitals'),
        apiFetch('/locations')
    ]);

    const hospitals = hRes.success ? hRes.data : [];
    const locations = lRes.success ? lRes.data : [];

    document.getElementById('statHospitals').textContent = hospitals.length;
    document.getElementById('statBeds').textContent = hospitals.reduce((s, h) => s + (h.available_beds || 0), 0);
    document.getElementById('statLocations').textContent = locations.length;
    document.getElementById('statRemote').textContent = locations.filter(l => l.is_remote).length;

    // Recent hospitals
    const hList = document.getElementById('dashHospitalList');
    if (!hospitals.length) {
        hList.innerHTML = `<div class="empty-state"><i class="fas fa-hospital"></i><p>No hospitals yet</p></div>`;
    } else {
        hList.innerHTML = hospitals.slice(0, 5).map(h => `
            <div class="mini-list-item">
                <div>
                    <div class="item-name">${h.name}</div>
                    <div class="item-sub">${h.specialization || 'General'}</div>
                </div>
                <span class="badge ${h.is_active ? 'badge-success' : 'badge-danger'}">
                    ${h.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>`).join('');
    }

    // Recent locations
    const lList = document.getElementById('dashLocationList');
    if (!locations.length) {
        lList.innerHTML = `<div class="empty-state"><i class="fas fa-map"></i><p>No locations yet</p></div>`;
    } else {
        lList.innerHTML = locations.slice(0, 5).map(l => `
            <div class="mini-list-item">
                <div>
                    <div class="item-name">${l.name}</div>
                    <div class="item-sub">${l.region || 'No region'}</div>
                </div>
                ${l.is_remote ? '<span class="badge badge-warning">Remote</span>' : '<span class="badge badge-info">Urban</span>'}
            </div>`).join('');
    }
}

// ===== HOSPITALS =====
async function loadHospitals() {
    const tbody = document.getElementById('hospitalTableBody');
    tbody.innerHTML = `<tr><td colspan="7" class="loading-cell"><div class="spinner"></div></td></tr>`;
    const res = await apiFetch('/hospitals');
    if (!res.success) {
        tbody.innerHTML = `<tr><td colspan="7" class="loading-cell" style="color:var(--danger)">${res.message}</td></tr>`;
        return;
    }
    allHospitals = res.data;
    renderHospitalTable(allHospitals);
}

function renderHospitalTable(data) {
    const tbody = document.getElementById('hospitalTableBody');
    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-hospital"></i><p>No hospitals found</p><small>Try adjusting your filter or add a new hospital</small></div></td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(h => `
        <tr>
            <td><span class="cell-id">#${h.id}</span></td>
            <td>
                <div class="cell-primary">${h.name}</div>
                <div class="cell-sub">${h.address}</div>
            </td>
            <td>${h.specialization || '<span style="color:var(--text-muted)">—</span>'}</td>
            <td>
                <span class="badge ${h.available_beds > 0 ? 'badge-success' : 'badge-danger'}">
                    ${h.available_beds > 0 ? h.available_beds + ' beds' : 'No beds'}
                </span>
            </td>
            <td>${h.contact || '<span style="color:var(--text-muted)">—</span>'}</td>
            <td>
                <span class="badge ${h.is_active ? 'badge-success' : 'badge-danger'}">
                    ${h.is_active ? '● Active' : '● Inactive'}
                </span>
            </td>
            <td style="display:flex;gap:4px">
                <button class="btn btn-sm btn-ghost btn-icon" title="Edit hospital"
                    onclick="openEditHospital(${JSON.stringify(h).replace(/"/g, '&quot;')})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-icon" title="Deactivate hospital"
                    onclick="deleteHospital(${h.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`).join('');
}

function filterHospitals() {
    const q = document.getElementById('hospitalFilter').value.toLowerCase();
    renderHospitalTable(allHospitals.filter(h =>
        h.name.toLowerCase().includes(q) ||
        (h.specialization || '').toLowerCase().includes(q) ||
        (h.address || '').toLowerCase().includes(q)
    ));
}

async function submitAddHospital(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    data.available_beds = parseInt(data.available_beds) || 0;
    data.latitude = parseFloat(data.latitude);
    data.longitude = parseFloat(data.longitude);

    const res = await apiFetch('/hospitals', { method: 'POST', body: JSON.stringify(data) });
    if (res.success) {
        showToast('Hospital added successfully', 'success');
        form.reset();
        navigate('hospitals');
    } else {
        showToast(res.message || 'Failed to add hospital', 'error');
    }
}

function openEditHospital(h) {
    const form = document.getElementById('editHospitalForm');
    form.id_field = h.id;
    form.querySelector('[name="id"]').value = h.id;
    form.querySelector('[name="name"]').value = h.name;
    form.querySelector('[name="address"]').value = h.address;
    form.querySelector('[name="latitude"]').value = h.latitude;
    form.querySelector('[name="longitude"]').value = h.longitude;
    form.querySelector('[name="contact"]').value = h.contact || '';
    form.querySelector('[name="specialization"]').value = h.specialization || '';
    form.querySelector('[name="available_beds"]').value = h.available_beds || 0;
    form.querySelector('[name="is_active"]').value = h.is_active ? '1' : '0';
    openModal('editHospitalModal');
}

async function submitEditHospital(e) {
    e.preventDefault();
    const form = e.target;
    const id = form.querySelector('[name="id"]').value;
    const data = {
        name: form.querySelector('[name="name"]').value,
        address: form.querySelector('[name="address"]').value,
        latitude: parseFloat(form.querySelector('[name="latitude"]').value),
        longitude: parseFloat(form.querySelector('[name="longitude"]').value),
        contact: form.querySelector('[name="contact"]').value,
        specialization: form.querySelector('[name="specialization"]').value,
        available_beds: parseInt(form.querySelector('[name="available_beds"]').value) || 0,
        is_active: form.querySelector('[name="is_active"]').value === '1',
    };
    const res = await apiFetch(`/hospitals/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (res.success) {
        showToast('Hospital updated', 'success');
        closeModal('editHospitalModal');
        loadHospitals();
    } else {
        showToast(res.message || 'Update failed', 'error');
    }
}

async function deleteHospital(id) {
    if (!confirm('Deactivate this hospital?')) return;
    const res = await apiFetch(`/hospitals/${id}`, { method: 'DELETE' });
    if (res.success) { showToast('Hospital deactivated', 'success'); loadHospitals(); }
    else showToast(res.message || 'Delete failed', 'error');
}

// ===== SEARCH =====
async function searchHospital() {
    const name = document.getElementById('searchNameInput').value.trim();
    if (!name) { showToast('Enter a hospital name', 'info'); return; }
    const area = document.getElementById('searchResult');
    area.innerHTML = `<div class="spinner" style="margin-top:20px"></div>`;
    const res = await apiFetch(`/hospitals/search?name=${encodeURIComponent(name)}`);
    if (!res.success) {
        area.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><p>${res.message}</p></div>`;
        return;
    }
    const h = res.data;
    area.innerHTML = `
        <div class="result-card">
            <div class="result-title"><i class="fas fa-hospital"></i>${h.name}</div>
            <div class="result-field"><label>Address</label><p>${h.address}</p></div>
            <div class="result-field"><label>Specialization</label><p>${h.specialization || '—'}</p></div>
            <div class="result-field"><label>Contact</label><p>${h.contact || '—'}</p></div>
            <div class="result-field"><label>Available Beds</label><p>${h.available_beds}</p></div>
            <div class="result-field"><label>Coordinates</label><p>${h.latitude}, ${h.longitude}</p></div>
            <div class="result-field"><label>Status</label><p><span class="badge ${h.is_active ? 'badge-success' : 'badge-danger'}">${h.is_active ? 'Active' : 'Inactive'}</span></p></div>
        </div>`;
}

// ===== NEAREST =====
function useMyLocation() {
    if (!navigator.geolocation) { showToast('Geolocation not supported', 'error'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
        document.getElementById('nearLat').value = pos.coords.latitude.toFixed(6);
        document.getElementById('nearLng').value = pos.coords.longitude.toFixed(6);
        showToast('Location detected', 'success');
    }, () => showToast('Could not get location', 'error'));
}

async function findNearest() {
    const lat = document.getElementById('nearLat').value;
    const lng = document.getElementById('nearLng').value;
    if (!lat || !lng) { showToast('Enter coordinates first', 'info'); return; }
    const area = document.getElementById('nearestResult');
    area.innerHTML = `<div class="spinner" style="margin-top:20px"></div>`;
    const res = await apiFetch(`/hospitals/nearest?lat=${lat}&lng=${lng}`);
    if (!res.success) {
        area.innerHTML = `<div class="empty-state"><i class="fas fa-map-marker-alt"></i><p>${res.message}</p></div>`;
        return;
    }
    area.innerHTML = res.data.map((h, i) => `
        <div class="nearest-card ${i === 0 ? 'top' : ''}">
            <div class="nearest-rank">${i === 0 ? '★' : i + 1}</div>
            <div class="nearest-body">
                <div class="nearest-info">
                    <h4>${h.name}</h4>
                    <p>${h.specialization || 'General'} &nbsp;·&nbsp; ${h.available_beds} bed${h.available_beds !== 1 ? 's' : ''} available</p>
                    <p style="margin-top:3px;font-size:11px;color:var(--text-muted)">${h.address}</p>
                </div>
            </div>
            <div class="nearest-dist">
                ${h.distance_km.toFixed(2)}
                <span>km away</span>
            </div>
        </div>`).join('');
}

// ===== LOCATIONS =====
async function loadLocations() {
    const tbody = document.getElementById('locationTableBody');
    tbody.innerHTML = `<tr><td colspan="7" class="loading-cell"><div class="spinner"></div></td></tr>`;
    const res = await apiFetch('/locations');
    if (!res.success) {
        tbody.innerHTML = `<tr><td colspan="7" class="loading-cell" style="color:var(--danger)">${res.message}</td></tr>`;
        return;
    }
    allLocations = res.data;
    renderLocationTable(allLocations);
}

function renderLocationTable(data) {
    const tbody = document.getElementById('locationTableBody');
    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-map"></i><p>No locations found</p><small>Try adjusting your filter or add a new location</small></div></td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(l => `
        <tr>
            <td><span class="cell-id">#${l.id}</span></td>
            <td><div class="cell-primary">${l.name}</div></td>
            <td>${l.region || '<span style="color:var(--text-muted)">—</span>'}</td>
            <td><span style="font-family:monospace;font-size:12px">${parseFloat(l.latitude).toFixed(4)}</span></td>
            <td><span style="font-family:monospace;font-size:12px">${parseFloat(l.longitude).toFixed(4)}</span></td>
            <td>
                ${l.is_remote
                    ? '<span class="badge badge-warning"><i class="fas fa-wifi" style="font-size:9px"></i> Remote</span>'
                    : '<span class="badge badge-info"><i class="fas fa-city" style="font-size:9px"></i> Urban</span>'}
            </td>
            <td style="display:flex;gap:4px">
                <button class="btn btn-sm btn-ghost btn-icon" title="Edit location"
                    onclick="openEditLocation(${JSON.stringify(l).replace(/"/g, '&quot;')})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-icon" title="Delete location"
                    onclick="deleteLocation(${l.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`).join('');
}

function filterLocations() {
    const q = document.getElementById('locationFilter').value.toLowerCase();
    renderLocationTable(allLocations.filter(l =>
        l.name.toLowerCase().includes(q) ||
        (l.region || '').toLowerCase().includes(q)
    ));
}

async function submitAddLocation(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    data.latitude = parseFloat(data.latitude);
    data.longitude = parseFloat(data.longitude);
    data.is_remote = data.is_remote === 'true';

    const res = await apiFetch('/locations', { method: 'POST', body: JSON.stringify(data) });
    if (res.success) {
        showToast('Location added successfully', 'success');
        form.reset();
        navigate('locations');
    } else {
        showToast(res.message || 'Failed to add location', 'error');
    }
}

function openEditLocation(l) {
    const form = document.getElementById('editLocationForm');
    form.querySelector('[name="id"]').value = l.id;
    form.querySelector('[name="name"]').value = l.name;
    form.querySelector('[name="latitude"]').value = l.latitude;
    form.querySelector('[name="longitude"]').value = l.longitude;
    form.querySelector('[name="region"]').value = l.region || '';
    form.querySelector('[name="is_remote"]').value = l.is_remote ? 'true' : 'false';
    openModal('editLocationModal');
}

async function submitEditLocation(e) {
    e.preventDefault();
    const form = e.target;
    const id = form.querySelector('[name="id"]').value;
    const data = {
        name: form.querySelector('[name="name"]').value,
        latitude: parseFloat(form.querySelector('[name="latitude"]').value),
        longitude: parseFloat(form.querySelector('[name="longitude"]').value),
        region: form.querySelector('[name="region"]').value,
        is_remote: form.querySelector('[name="is_remote"]').value === 'true',
    };
    const res = await apiFetch(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (res.success) {
        showToast('Location updated', 'success');
        closeModal('editLocationModal');
        loadLocations();
    } else {
        showToast(res.message || 'Update failed', 'error');
    }
}

async function deleteLocation(id) {
    if (!confirm('Delete this location?')) return;
    const res = await apiFetch(`/locations/${id}`, { method: 'DELETE' });
    if (res.success) { showToast('Location deleted', 'success'); loadLocations(); }
    else showToast(res.message || 'Delete failed', 'error');
}

// ===== INIT =====
checkApiStatus();
setInterval(checkApiStatus, 15000);
loadDashboard();
