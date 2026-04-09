# ChainPulse Project Breakdown

## 1. High-Level Overview
**What the project does:**
ChainPulse is a supply chain intelligence platform designed for live shipment tracking, disruption simulation, risk scoring, and operational visibility across global movement.

**Its main purpose/use case:**
It provides logistics managers and operators an interactive dashboard to view where their shipments are on a map in real-time. Crucially, it evaluates the risk (like weather, port congestion) tied to every shipment and simulates how "disruptions" (e.g., storms, port closures) impact shipments nearby, pushing real-time alerts to mitigate delays.

**Key Technologies Used:**
- **Backend/API:** Python, FastAPI, SQLAlchemy (Async), Uvicorn, Socket.IO
- **Frontend/UI:** JavaScript, React, Vite, Tailwind CSS, built-in map utilities
- **Database Layer:** PostgreSQL, Redis (likely for Socket.IO message broking)
- **Machine Learning:** `scikit-learn`, `joblib` (for delay risk predictions via `.pkl` models)
- **Containerization:** Docker & Docker Compose 

---

## 2. Overall Architecture
The platform is structured as a real-time SPA (Single Page Application) backed by an asynchronous microservices-oriented monolithic backend. 
- **The Client (React):** Communicates with the FastAPI backend through two specific channels:
  1. Standard HTTP/REST calls (e.g., fetching lists of shipments, route data).
  2. WebSockets via Socket.IO (maintaining a persistent connection to receive live streaming updates on shipment coordinates, risk changes, and disruptions without reloading).
- **The Server (FastAPI):** Hosts a background async event loop that computes movement calculations. It artificially advances shipment coordinates across their routes, recalculates AI risk predictions, and broadcasts messages (updates) back to connected React clients.
- **Data Flow:**
  - *Input:* A disruption is simulated through the frontend UI `DisruptionSimulator`.
  - *Processing:* The backend HTTP endpoint creates the disruption in the DB, calculates proximity to all in-transit shipments using the Haversine distance formula, drastically pushes up their risk scores if they're in range, and commits these changes.
  - *Output:* Socket.IO instantly emits an `alert` and `risk_assessment` payload to the React frontend, updating the visualization on the map.

---

## 3. Folder Structure Breakdown
```text
ChainGuard/
│
├── chainpulse-backend/      # The Python FastAPI Engine
│   ├── app/                 # Main application source code
│   │   ├── ml/              # Machine Learning pipelines and trained models
│   │   ├── models/          # Pydantic schemas for data validation 
│   │   ├── routes/          # API endpoints (Controllers) organized by feature
│   │   ├── services/        # Business logic for integrations (weather, news)
│   │   ├── config.py        # Environmental variables & secrets mapping
│   │   ├── database.py      # SQLAlchemy DB connection & table models
│   │   └── main.py          # The core entry point unifying routes and WebSockets
│   ├── Dockerfile
│   └── requirements.txt
│
├── chainpulse-frontend/     # The React Web Application
│   ├── public/              # Static assets (images, icons)
│   ├── src/                 # Main React source code
│   │   ├── components/      # UI components (Map, Warnings, Charts)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API and Socket connection handlers
│   │   ├── App.jsx          # Root component wiring the layout
│   │   ├── main.jsx         # React application bootstrap
│   │   └── index.css        # Tailwind directives and global styles
│   ├── vite.config.js       # Vite bundler configuration
│   └── tailwind.config.js   # Tailwind styling theme configurations
│
└── docker-compose.yml       # Orchestrates the containers (Frontend, Backend, DB)
```

---

## 4. Key Files Explained

### Backend Files
- **`app/main.py`**: The absolute heart of the backend. It spins up the FastAPI app, attaches the Socket.IO server, and kicks off an infinite async `background_tasks()` loop that updates shipment locations every 5 seconds, recalculates risk every 15 seconds, and creates random supply chain disruptions every 30 seconds.
- **`app/database.py`**: Contains the SQLAlchemy Declarative models (`Shipment`, `Disruption`, `Alert`). It maps Python class representations to the actual PostgreSQL database tables and provides the `AsyncSessionLocal` engine configuration.
- **`app/routes/shipments.py`**: An API router storing HTTP logic to fetch shipments, update statuses, calculate shipment routes, and even seeds sample data when the server boots.
- **`app/routes/predictions.py`**: A complex router for the `assess` endpoint. It intercepts a shipment, mocks weather/news features, sends them into the ML models to predict a "risk capability," generates human-readable risk factors (like "temperature-sensitive cargo"), and decides whether a reroute is needed.
- **`app/ml/predictor.py`**: Acts as an interface to the Machine Learning `.pkl` files (Model and Feature Scaler). It accepts 10 different supply chain variables, scales them, and safely runs `.predict_proba()` to estimate delay risk percentages.

### Frontend Files
- **`src/App.jsx`**: The main orchestrator of the frontend. Sets up real-time event listeners across Socket.IO (e.g., `onShipmentUpdate()`, `onNewDisruption()`), updates the local map state, and delegates data heavily downstream to children components like `ShipmentMap` and `DisruptionFeed`.
- **`src/services/socket.js`**: Contains the boilerplate client-side Socket.IO hooks allowing the UI to handshake cleanly with the FastAPI server connection logic. Allows UI binding of specific socket event emissions cleanly.

---

## 5. Execution Flow Step-by-Step

1. **System Boot:** Docker Compose spins up the React Server, the Uvicorn/FastAPI Server, and PostgreSQL. FastAPI triggers `startup_event()` (`main.py`) which instantiates the database schema and injects 5 dummy shipments (from Shanghai to Rotterdam, Dubai to NY, etc.).
2. **Client Load:** A user opens the browser at `localhost:3000`. React fetches the current initial state of active shipments efficiently via the `/api/shipments` REST endpoint.
3. **Establishing Real-time Comm:** Simultaneously, `src/App.jsx` establishes an asynchronous WebSocket linkage using `initSocket()`.
4. **The Live Heartbeat:**
   - Every 5 seconds, the FastAPI loop uses Haversine calculations to gently move active shipments closer to their destinations. It updates the Postgres DB with new Lat/Lon parameters and directly broadcasts the shift via WebSockets.
   - The React App dynamically repaints the `ShipmentMap` reflecting the new live GPS tracking.
5. **Simulated Action:** If the user selects a "Flood" in Hong Kong using the `DisruptionSimulator` component, a POST request to `/api/disruptions/simulate` fires off.
6. **Risk Logic Checks In:** The backend computes what shipments are within the radius of that flood. For affected shipments, the `risk_score` rockets up. The backend commits this and immediately shoots a Socket.IO high-priority 'Alert' broadcast. React receives this, slides in a high-priority Toast alert, and pulses the map UI over the affected shipment.

---

## 6. Important Concepts and Nuances

- **Async Monolith Pattern:** The backend uses lightweight asynchronous loops (`asyncio`) alongside normal API HTTP calls explicitly within the same physical deployment pattern. This maintains very low memory footprints compared to splitting out dedicated Celery/Redis workers just for small movements.
- **Haversine Distance Mapping:** Realism is handled securely mathematically using `calculate_distance()` to approximate GPS curvature, ensuring generated routes genuinely map to realistic shipping distances and disruption impact radii interact cleanly with ships passing near.
- **Graceful ML Failarounds:** In `predictor.py`, if the actual `.pkl` models aren't successfully mounted, it fails gracefully without throwing 500 server errors, defaulting safely to a flat `0.0` risk model so the rest of the application remains operable.

## 7. Simple Analogy
Think of ChainPulse like **Waze or Google Maps, but for heavy global logistics**. 
If you use Waze, you see your car moving down a route. Sometimes, a crash is reported ahead, and Waze flags your route red and sends an alert. 
- **FastAPI** is the GPS engine pretending to drive the trucks and watching the weather. It physically calls the "Waze" servers to log that a storm happened.
- **Socket.IO** is the push notification system that makes your app ping immediately when the storm is logged.
- **The React Frontend** is your screen, taking that message, turning the road red, and recommending a detour without you ever refreshing the webpage.
