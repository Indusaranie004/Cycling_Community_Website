# 🚴 Eco-Friendly Community-Led Cycling Platform

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-In--Memory-blue)
![Testing](https://img.shields.io/badge/Testing-Jest-red)
![Mapbox](https://img.shields.io/badge/Mapbox-Enabled-blueviolet)
![License](https://img.shields.io/badge/license-MIT-blue)

A web-based platform designed to promote sustainable transportation by enabling users to map safe cycling routes, track their rides, calculate their environmental impact, participate in community challenges, and report road hazards in real-time.

## 📖 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Testing & Data Generation](#-testing--data-generation)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

## 🌟 Features

### 1. User Management & Authentication
- Secure **User Registration and Login**.
- **JWT (JSON Web Token)** based authentication.
- Input validation using **Express-Validator**.

### 2. Route Planning & Discovery
- **Mapbox Integration:** Route mapping with automatic distance, estimated time, and location name calculation. 
- **Geospatial Search:** Discover public cycling routes near any location using MongoDB geospatial indexing.
- **Public vs. Private:** Share routes with the community or keep them personal.

### 3. Ride Tracking & Eco-Impact
The Ride Tracking & Eco-Impact component is a core sustainability-focused module of the Cycling Community Platform. It enables users to log their cycling activities while transforming raw ride data into measurable environmental and health impact insights. This component not only records ride metrics but also converts cycling behavior into meaningful environmental contributions at both individual and community levels.

🎯Purpose of the Component

* The primary objective of this module is to:

* Encourage sustainable transportation habits

* Quantify environmental benefits of cycling

* Promote data-driven environmental awareness

* Provide motivation through measurable eco achievements

* Maintain real-time sustainability statistics for the community

By bridging personal fitness data with environmental analytics, the system reinforces the value of cycling as an eco-friendly alternative to motorized transport.

🚴Ride Tracking System

The ride tracking mechanism captures essential cycling metrics including:

* Distance traveled (km)

* Duration (minutes)

* Average speed (km/h)

* Start and end times

* Associated route (if applicable)

To ensure reliability and fairness, the system incorporates validation logic to prevent unrealistic or manipulated data submissions. For example:

* Distance must be greater than zero

* Speed must fall within realistic cycling limits

* Duration must correspond logically with distance traveled

These safeguards maintain the integrity of environmental statistics and prevent fraudulent eco-score inflation.

🌱 Eco-Impact Calculation Engine

Once a ride is validated and recorded, the system automatically calculates its environmental and health impact using predefined sustainability constants.

The calculation engine converts cycling distance into:

* CO₂ emissions saved (kg) – based on average car emissions per kilometer

* Fuel saved (liters) – calculated from average vehicle fuel consumption

* Calories burned (kcal) – estimated using standard cycling energy expenditure

* Eco Score – a gamified sustainability score combining environmental savings and ride effort

This real-time transformation of physical activity into environmental metrics allows users to see the tangible positive effects of choosing cycling over fossil-fuel-based transportation.

🌍 Community Environmental Analytics

Beyond individual tracking, the module maintains aggregated sustainability metrics at the platform level. These include:

* Total community cycling distance

* Total CO₂ emissions saved by all users

* Total number of rides recorded

Community statistics serve multiple purposes:

* Demonstrating collective environmental impact

* Encouraging social motivation

* Providing measurable sustainability insights

* Supporting environmental awareness campaigns

This transforms the platform from a personal fitness tracker into a community-driven environmental initiative.

### 4. Community Hub & Gamification
- **Events:** Users can create and join cycling meetups/events.
- **Challenges:** Participate in distance-based challenges (e.g., "May 30km Challenge").
- **Leaderboards:** Track progress against other participants in real-time.
- **Progress Tracking:** Updates user progress within active challenges.

### 5. Hazard Reporting & Notifications
- *Hazard Reporting:* Report potholes, accidents, or blocked paths with severity levels (low, medium, high).
- *Feedback Loop:* Rate routes (1–5) and provide feedback on road conditions.
- *Automatic Expiry System:* Hazards are automatically deactivated when their expiry time is reached via a scheduled background job (node-cron).
- *Push Notifications:* Integrated with *Firebase Cloud Messaging (FCM)* to notify users in real-time when their reported hazards expire.
- *Notification Logging:* All notification attempts (sent or failed) are stored in the database for auditing.

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Production) / In-Memory MongoDB (Testing)
- **Validation:** Express-Validator
- **Mapping:** Mapbox API / SDK
- **Email Service:** Resend
- **Testing:** Jest, Node-Mocks-HTTP, Postman
- **Push Notifications:** Firebase Cloud Messaging (FCM) via firebase-admin
- **Job Scheduling:** node-cron for automated hazard expiry checks

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v18 or higher)
*   NPM or Yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Indusaranie004/Cycling_Community_Website.git
    cd Cycling_Community_Website
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```
    *This installs core dependencies including `express`, `mongoose`, `mapbox`, `resend`, and `express-validator`.*

3.  **Start the server**
    ```bash
    # For development (with nodemon)
    npm run dev

    # For production
    npm start
    ```
    The server will start on `http://localhost:3001` (default).

## 🧪 Testing & Data Generation

This project utilizes **Jest** for the test runner and an **In-Memory MongoDB** approach for the testing environment.

### Testing Tools
*   **Jest:** The core testing framework.
*   **Node-Mocks-HTTP:** Used to mock Express request and response objects for unit testing controllers.
*   **MongoDB Memory Server:** Ensures a clean, isolated database for every test run.

### Running Tests
To execute the test suite:

```bash
npm test
```

*The system will automatically spin up the in-memory database, seed mock data (users, routes, events), execute the API tests via Jest, and teardown the database upon completion.*

## 📡 API Documentation

Below is a summary of the available API endpoints organized by functionality.

### 👤 User Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/users/register` | Register a new user |
| `POST` | `/api/users/login` | Authenticate user & receive Token |
| `GET` | `/api/users/profile` | Get current user profile |

### 🏆 Community Hub (Events & Challenges)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/community/events` | Get all community events |
| `POST` | `/api/community/events` | Create a new cycling event |
| `POST` | `/api/community/events/:id/join` | Join a specific event |
| `GET` | `/api/community/challenges` | List all active challenges |
| `POST` | `/api/community/challenges` | Create a new challenge |
| `PUT` | `/api/community/challenges/:id/progress` | Update user progress in a challenge |
| `GET` | `/api/community/challenges/:id/leaderboard` | Get challenge leaderboard |

### 🗺️ Route Planning & Discovery
All /api/routes/* endpoints require a valid JWT:
Authorization: Bearer <token>

POST /api/routes/newRoute
Creates a new cycling route. Distance, estimated time, and start/end location names are automatically calculated via Mapbox.
Request Body:
json{
  "name": "Morning Ride",
  "coordinates": [[80.63, 7.28], [80.64, 7.29]],
  "isPublic": true
}

Coordinates format: [longitude, latitude]. Minimum 2 points required.

Success — 201:
json{
  "message": "Route created successfully",
  "route": {
    "_id": "6996b49da1f12c1ffe1f3a9a",
    "userId": "69a0001c11a1...",
    "name": "Morning Ride",
    "coordinates": [[80.63, 7.28], [80.64, 7.29]],
    "startPoint": { "type": "Point", "coordinates": [80.63, 7.28] },
    "distance": 5000,
    "estimatedTime": 83.33,
    "startLocation": "Kandy, Sri Lanka",
    "endLocation": "Kandy, Sri Lanka",
    "isPublic": true,
    "createdAt": "2026-02-19T06:58:37.756Z",
    "updatedAt": "2026-02-19T06:58:37.756Z"
  }
}
Errors:

400 — Route name is required / At least 2 coordinates are required / Each coordinate must be a valid [longitude, latitude] pair / Visibility status is required
401 — Authentication required
409 — You already have a route with this name


GET /api/routes/viewRoutes
Retrieves routes based on query parameters.
Query Parameters:
ParameterTypeDescriptionuserIdstringOptional. Filter by user IDisPublicbooleanOptional. Filter by visibility (only applies to own routes)
Scenarios:
RequestResultNo paramsAll public routes?userId=<your_id>Your own public + private routes?userId=<your_id>&isPublic=falseYour own private routes only?userId=<other_id>Another user's public routes only
Success — 200:
json{
  "message": "Routes retrieved successfully",
  "count": 2,
  "routes": [...]
}
```

**Errors:**
- `401` — Authentication required

---

### GET /api/routes/nearby
Returns public routes whose start point falls within the specified radius, sorted by proximity.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | float | Yes | Latitude (-90 to 90) |
| `lng` | float | Yes | Longitude (-180 to 180) |
| `radius` | float | No | Radius in meters (default: 5000) |

**Example:**
```
GET /api/routes/nearby?lat=7.2906&lng=80.6337&radius=10000
Success — 200:
json{
  "message": "Nearby routes retrieved successfully",
  "count": 2,
  "routes": [...]
}
Errors:

400 — { "errors": ["Latitude (lat) is required"] } / { "errors": ["Longitude (lng) is required"] } / { "errors": ["Latitude must be a number between -90 and 90"] } / { "errors": ["Longitude must be a number between -180 and 180"] } / { "errors": ["Radius must be a positive number"] }
401 — Authentication required


PUT /api/routes/updateRoute/:id
Updates a route. Only the route owner or admin can update. If coordinates change, distance, time, and locations are recalculated via Mapbox.
URL Parameter: :id — MongoDB ObjectId of the route
Request Body (at least one field required):
json{
  "name": "Evening Ride",
  "isPublic": false,
  "coordinates": [[80.63, 7.28], [80.65, 7.30]]
}
Success — 200:
json{
  "message": "Route updated successfully",
  "route": {
    "_id": "6996b49da1f12c1ffe1f3a9a",
    "name": "Evening Ride",
    "isPublic": false,
    ...
  }
}
Errors:

400 — Invalid route ID format / At least one field must be provided for update / Validation errors
401 — Authentication required
403 — Forbidden: You do not have permission to modify this route
404 — Route not found
409 — You already have a route with this name


DELETE /api/routes/deleteRoute/:id
Deletes a route. Only the route owner or admin can delete.
URL Parameter: :id — MongoDB ObjectId of the route
Success — 200:
json{
  "message": "Route deleted successfully",
  "deletedRouteId": "6996b49da1f12c1ffe1f3a9a"
}
Errors:

400 — Invalid route ID format
401 — Authentication required
403 — Forbidden: You do not have permission to modify this route
404 — Route not found


Third-Party API Integrations
Mapbox APIs used internally:
PurposeEndpointCalculate distance & estimated timeGET https://api.mapbox.com/directions/v5/mapbox/cycling/{coordinates}Resolve start location nameGET https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.jsonResolve end location nameGET https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json
These are called automatically on route CREATE and when coordinates are updated on UPDATE. They are not exposed directly to the client.

MongoDB Geospatial — Nearby Routes
Routes are stored with a startPoint field in GeoJSON Point format:
json"startPoint": { "type": "Point", "coordinates": [80.63, 7.28] }
A 2dsphere index is applied on this field, enabling MongoDB's $near operator to efficiently find and return routes within a given radius sorted by proximity.

### 🚴 Rides & Impact
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/rides` | Get all rides |
| `POST` | `/api/rides` | Create a new ride |
| `PUT` | `/api/rides/:id` | Update a ride by ID |
| `DELETE` | `/api/rides/:id` | Delete a ride by ID |
| `GET` | `/api/rides/user/:userId` | Get all rides for a specific user |
| `GET` | `/api/community-stats` | Get aggregated community statistics |
| `GET` | `/api/impact/:rideId` | Get environmental impact for a specific ride |
| `GET` | `/api/impact/stats/:userId` | Get total impact statistics for a specific user |

### ⚠️ Hazards & Notifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/interactions` | Get all hazards/feedback (filter by userId, routeId, intType, isActive) |
| `POST` | `/api/interactions` | Report a hazard or submit feedback |
| `GET` | `/api/interactions/:id` | Get a single interaction |
| `PATCH` | `/api/interactions/:id` | Partially update an interaction |
| `PATCH` | `/api/interactions/:id/deactivate` | Deactivate a hazard (soft delete) |
| `DELETE` | `/api/interactions/:id` | Permanently delete an interaction |
| `GET` | `/api/notifications` | Get all notifications (filter by userId) |
| `POST` | `/api/notifications/trigger-expiry-check` | Manually trigger hazard expiry job |
| `PUT` | `/api/notifications/:id` | Update a notification record |
| `DELETE` | `/api/notifications/:id` | Delete a notification record |

## 🤝 Contributing

Contributions are always welcome!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ for a greener planet.*