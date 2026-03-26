# Hospital & Location Management Module

**Project:** Ambulance Route Optimization in Remote Areas
**Team:** Visitors
**Developer:** Rahul Singh

---

## Overview

This module manages hospital data and geographic locations for the Ambulance Route Optimization system. It provides a REST API backend and a dashboard UI for managing all data.

No database required — data is stored in JSON files.

**Algorithms implemented:**
- Binary Search — hospital name lookup, O(log n)
- Haversine Formula — real-world GPS distance in km
- Merge Sort — ranks hospitals by distance, O(n log n)

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | Node.js, Express.js     |
| Storage  | JSON files (no database)|
| Frontend | HTML, CSS, Vanilla JS   |

---

## Folder Structure

```
hospital-location-module/
├── server.js              → Express API + all logic (algorithms inline)
├── package.json
├── data/
│   ├── hospitals.json     → Hospital records (read/write)
│   └── locations.json     → Location records (read/write)
└── dashboard/
    ├── index.html         → Dashboard UI
    ├── style.css          → Dark theme styles
    └── app.js             → Dashboard logic
```

---

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3001`

Open `dashboard/index.html` in your browser.

---

## Data Files

All data is stored as plain JSON — no MySQL or any database needed.

`data/hospitals.json` — list of hospital objects:
```json
{
  "id": 1,
  "name": "City General Hospital",
  "address": "12 Main Road, District A",
  "latitude": 30.3165,
  "longitude": 78.0322,
  "contact": "01234567890",
  "specialization": "General",
  "available_beds": 20,
  "is_active": true
}
```

`data/locations.json` — list of location objects:
```json
{
  "id": 1,
  "name": "Remote Village B",
  "latitude": 30.1234,
  "longitude": 77.9876,
  "region": "Remote Area B",
  "is_remote": true
}
```

When you POST a new hospital or location via the API, it gets appended to the respective JSON file automatically.

---

## API Endpoints

### Hospitals

| Method | Endpoint                           | Description                        |
|--------|------------------------------------|------------------------------------|
| GET    | `/api/hospitals`                   | All active hospitals               |
| GET    | `/api/hospitals/:id`               | Single hospital by ID              |
| GET    | `/api/hospitals/search?name=`      | Binary Search by exact name        |
| GET    | `/api/hospitals/nearest?lat=&lng=` | Nearest hospitals (Haversine + Merge Sort) |
| POST   | `/api/hospitals`                   | Add new hospital                   |

### Locations

| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| GET    | `/api/locations`  | All locations      |
| POST   | `/api/locations`  | Add new location   |

---

## Algorithms

**Binary Search** — `server.js`
Hospitals fetched and sorted alphabetically, then binary searched by name.
Time: O(log n)

**Haversine Formula** — `server.js`
Calculates real-world distance in km between two GPS coordinates.

**Merge Sort** — `server.js`
Sorts hospitals by `distance_km` for the nearest hospital feature.
Time: O(n log n)

---

## Dashboard Features

- Stats: active hospitals, available beds, locations, remote areas
- Searchable hospital and location tables
- Add hospital / add location forms
- Binary search page
- Find nearest hospital with GPS auto-detect
- Live API status indicator

---

## Integration Points

| Module | Usage |
|--------|-------|
| Route Optimization (Rohit) | Calls `GET /api/hospitals/nearest` before computing optimal path |
| Emergency Handling (Kabeer) | Calls `GET /api/hospitals/:id` to check bed availability |
| Traffic & Roads (Karan) | Uses hospital coordinates for routing decisions |
