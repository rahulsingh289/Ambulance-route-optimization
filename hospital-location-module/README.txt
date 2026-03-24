================================================================
  HOSPITAL & LOCATION MANAGEMENT MODULE
  Team: Visitors | Developer: Rahul Singh
  Project: Ambulance Route Optimization in Remote Areas
================================================================

OVERVIEW
--------
This module manages hospital data and geographic locations for
the Ambulance Route Optimization system. It provides a REST API
backend and a full HTML dashboard UI for managing all data.

----------------------------------------------------------------

FOLDER STRUCTURE
----------------
hospital-location-module/
├── server.js                  -> Entry point, Express app setup
├── package.json               -> Dependencies
├── .env.example               -> Environment variable template
├── db/
│   ├── connection.js          -> MySQL connection pool
│   └── schema.sql             -> Database schema + sample data
├── hospital/                  -> Hospital Management
│   ├── controller.js          -> Hospital CRUD + search logic
│   ├── routes.js              -> Hospital API routes
│   └── utils.js               -> Binary Search + Haversine formula
├── location/                  -> Location Management
│   ├── controller.js          -> Location CRUD logic
│   └── routes.js              -> Location API routes
└── dashboard/                 -> Web Dashboard UI
    ├── index.html             -> Main dashboard page
    ├── style.css              -> Dark theme UI styles
    └── app.js                 -> Dashboard logic (API calls, rendering)

----------------------------------------------------------------

SETUP INSTRUCTIONS
------------------
1. Install Node.js (v16+) and MySQL.

2. Install dependencies:
      npm install

3. Setup the database:
      source db/schema.sql   (run inside MySQL)

4. Configure environment:
      cp .env.example .env
      (fill in your MySQL credentials)

5. Start the API server:
      npm start
      (or: npm run dev  for auto-reload with nodemon)

6. Open the Dashboard:
      Open dashboard/index.html in your browser
      (no build step needed — plain HTML/CSS/JS)

   Server runs at: http://localhost:3001

----------------------------------------------------------------

DASHBOARD FEATURES
------------------
The dashboard is a dark-themed single-page web app with:

  Overview
  - Stats cards: total hospitals, available beds, locations, remote areas
  - Recent hospitals and locations at a glance

  Hospital Module
  - View all hospitals in a searchable, filterable table
  - Add new hospital via form
  - Edit hospital details via modal popup
  - Soft-delete (deactivate) a hospital
  - Binary Search hospital by exact name
  - Find Nearest Hospital by GPS coordinates (with "Use My Location")

  Location Module
  - View all locations in a searchable table
  - Add new location via form
  - Edit / Delete locations via modal popup
  - Remote area tagging

  UX Features
  - Live API status indicator (online/offline)
  - Toast notifications for all actions
  - Animated page transitions
  - Responsive layout (works on tablet/mobile)
  - Loading spinners and skeleton screens

----------------------------------------------------------------

API ENDPOINTS
-------------

HOSPITALS:

  GET    /api/hospitals
         -> All active hospitals

  GET    /api/hospitals/:id
         -> Single hospital by ID

  GET    /api/hospitals/search?name=CityHospital
         -> Binary Search by exact name (O log n)

  GET    /api/hospitals/nearest?lat=30.31&lng=78.03
         -> Hospitals sorted by distance (Haversine formula)
            Only hospitals with available beds are returned

  POST   /api/hospitals
         Body: { name, address, latitude, longitude,
                 contact, specialization, available_beds }

  PUT    /api/hospitals/:id
         Body: same fields as POST + is_active (boolean)

  DELETE /api/hospitals/:id
         -> Soft delete (sets is_active = false)

LOCATIONS:

  GET    /api/locations
         -> All locations

  GET    /api/locations/:id
         -> Single location

  POST   /api/locations
         Body: { name, latitude, longitude, region, is_remote }

  PUT    /api/locations/:id
         Body: same fields as POST

  DELETE /api/locations/:id
         -> Hard delete

----------------------------------------------------------------

KEY ALGORITHMS
--------------
1. Binary Search  (hospital/utils.js)
   - Fast hospital lookup by name — O(log n)
   - Hospitals fetched sorted from DB, then binary searched

2. Haversine Formula  (hospital/utils.js)
   - Real-world distance (km) between two lat/lng points
   - Powers the "Find Nearest Hospital" feature

----------------------------------------------------------------

TECHNOLOGIES
------------
  Backend  : Node.js, Express.js
  Database : MySQL (mysql2 driver)
  Frontend : HTML5, CSS3, Vanilla JavaScript
  Fonts    : Inter (Google Fonts)
  Icons    : Font Awesome 6

----------------------------------------------------------------

INTEGRATION WITH OTHER MODULES
-------------------------------
  Rohit Kumar (Route Optimization)
    -> Calls GET /api/hospitals/nearest to get candidate hospitals
       before computing the optimal ambulance path

  Kabeer Kandari (Emergency Request Handling)
    -> Calls GET /api/hospitals/:id to check bed availability
       before dispatching an ambulance

  Karan Singh (Traffic & Road Condition)
    -> Road condition data influences which hospital is reachable;
       this module provides the hospital coordinates for routing

----------------------------------------------------------------

DEVELOPER
---------
  Name   : Rahul Singh
  Module : Hospital & Location Management Module
  Team   : Visitors

================================================================
