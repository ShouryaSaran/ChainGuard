# ChainPulse

Predict. Prevent. Deliver.

ChainPulse is a supply chain intelligence platform for live shipment tracking, disruption simulation, risk scoring, and operational visibility across the full stack.

## Quick Start

```bash
git clone <your-repo-url>
cd ChainGuard
cp .env.example .env
docker-compose up --build
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Architecture

```text
                        +----------------------+
                        |   React Frontend     |
                        |  (Nginx on :3000)    |
                        +----------+-----------+
                                   |
                     /api          |          /socket.io
                                   v
                        +----------+-----------+
                        |   FastAPI Backend    |
                        |    (Uvicorn :8000)   |
                        +----+-----------+-----+
                             |           |
                             v           v
                   +---------+--+   +---+---------+
                   | PostgreSQL |   |   Redis     |
                   |   :5432    |   |   :6379     |
                   +------------+   +-------------+
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Health check for the API |
| GET | `/api/shipments` | List shipments |
| POST | `/api/shipments` | Create a shipment |
| GET | `/api/shipments/{tracking_id}` | Get shipment by tracking ID |
| PUT | `/api/shipments/{tracking_id}/status` | Update shipment status |
| DELETE | `/api/shipments/{tracking_id}` | Delete a shipment |
| GET | `/api/shipments/{tracking_id}/route` | Get current and alternate routes |
| POST | `/api/predictions/assess` | Assess shipment risk |
| GET | `/api/predictions/dashboard-stats` | Dashboard metrics |
| GET | `/api/alerts` | List alerts |
| POST | `/api/disruptions/simulate` | Simulate a disruption |

## Screenshots

Add screenshots of the dashboard, map, disruption simulator, and live alerts here.
