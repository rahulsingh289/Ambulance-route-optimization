# Hospital & Location Management Module

**Project:** Ambulance Route Optimization in Remote Areas  
**Team:** Visitors  
**Developer:** Rahul Singh  

---

## Overview

This module manages hospital data and geographic locations for the Ambulance Route Optimization system. It exposes a REST API backend and a full dashboard UI for managing all data.

Key algorithms implemented:
- **Binary Search** — fast hospital lookup by name, O(log n)
- **Haversine Formula** — real-world distance (km) between two GPS coordinates
- **Merge Sort** — ranks hospitals by distance for the nearest hospital feature

---

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Backend  | Node.js, Express.js         |
| Database | MySQL (mysql2 driver)       |
| Frontend | HTML5, CSS3, Vanilla JS     |

---

## Folder Structure

```
hospital-location-module/
├── server.js                  → Express app entry point
├── package.json
├── .env.example               → Environment variable template
├── db/
│   ├── connection.js          → MySQL connection pool
│   └── schema.sql             → Tables + sample data
├── hospital/
│   ├── controller.js          → Hospital CRUD + search + nearest
│   ├── routes.js              → Hospital API routes
│   └── utils.js               → Binary Search, Haversine, Merge Sort
├── location/
│   ├── controller.js          → Location CRUD
│   └── routes.js              → Location API routes
└── dashboard/
    ├── index.html             → Dashboard UI
    ├── style.css              → Dark theme styles
    └── app.js                 → Dashboard logic
```

---

## Setup

**1. Install dependencies**
```bash
cd hospital-location-module
npm install
```

**2. Setup the database**

Run inside MySQL:
```sql
source db/schema.sql
```

**3. Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ambulance_system
```

**4. Start the server**
```bash
npm start
# or for auto-reload:
npm run dev
```

**5. Open the dashboard**

Open `dashboard/index.html` in your browser. Server runs at `http://localhost:3001`.

---

## API Endpoints

### Hospitals

| Method | Endpoint                          | Description                              |
|--------|-----------------------------------|------------------------------------------|
| GET    | `/api/hospitals`                  | Get all active hospitals                 |
| GET    | `/api/hospitals/:id`              | Get single hospital by ID                |
| GET    | `/api/hospitals/search?name=`     | Binary search by exact name              |
| GET    | `/api/hospitals/nearest?lat=&lng=`| Hospitals sorted by distance (Haversine) |
| POST   | `/api/hospitals`                  | Add a new hospital                       |
| PUT    | `/api/hospitals/:id`              | Update hospital details                  |
| DELETE | `/api/hospitals/:id`              | Soft delete (sets is_active = false)     |

### Locations

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | `/api/locations`       | Get all locations        |
| GET    | `/api/locations/:id`   | Get single location      |
| POST   | `/api/locations`       | Add a new location       |
| PUT    | `/api/locations/:id`   | Update location          |
| DELETE | `/api/locations/:id`   | Hard delete location     |

---

## Algorithms

### Binary Search — `hospital/utils.js`
Hospitals are fetched from the DB sorted alphabetically, then binary searched in JS.  
Time complexity: **O(log n)**

```js
binarySearchByName(hospitals, targetName)
```

### Haversine Formula — `hospital/utils.js`
Calculates the real-world distance in kilometres between two lat/lng points using the Earth's radius.

```js
haversineDistance(lat1, lon1, lat2, lon2) → km
```

### Merge Sort — `hospital/utils.js`
Sorts hospitals by `distance_km` ascending for the nearest hospital ranking.  
Time complexity: **O(n log n)**

```js
mergeSortByDistance(hospitalsWithDistance)
```

---

## Dashboard Features

- Stats overview — active hospitals, available beds, locations, remote areas
- Searchable and filterable hospital and location tables
- Add / Edit / Deactivate hospitals via forms and modals
- Binary search page with algorithm badge
- Find Nearest Hospital with GPS auto-detect and ranked results
- Live API status indicator
- Toast notifications for all actions

---

## Integration Points

| Module | How it uses this module |
|--------|------------------------|
| Route Optimization (Rohit) | Calls `GET /api/hospitals/nearest` to get candidate hospitals before computing the optimal path |
| Emergency Request Handling (Kabeer) | Calls `GET /api/hospitals/:id` to check bed availability before dispatching |
| Traffic & Road Condition (Karan) | Uses hospital coordinates from this module for routing decisions |

---

## Sample Data

The schema seeds the following on first run:

**Hospitals:** City General Hospital, Rural Health Center, Mountain Care Hospital, Valley Medical Center, Remote Aid Hospital

**Locations:** District A Center, Remote Village B, Hill Station C, Valley Town D, Forest Area E, Urban Zone F
