# 🚴 Cycling Community Website

A community platform for cycling enthusiasts — built with React.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v14+
- npm v6+ _(comes with Node.js)_
- [Git](https://git-scm.com/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Indusaranie004/Cycling_Community_Website.git
cd Cycling_Community_Website
```

### 2. Switch to the development branch

```bash
git checkout dev2
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

### 5. Start the development server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |

---

## Project Structure

```
Cycling_Community_Website/
├── public/               # Static assets
└── src/
    ├── components/       # Reusable React components
    ├── pages/            # Page-level components
    ├── styles/           # CSS/SCSS files
    ├── App.js            # Root component
    └── index.js          # Entry point
```

---

## Troubleshooting

**Port 3000 already in use**
```bash
npm start -- --port 3001
```

**Dependencies not installing**
```bash
npm cache clean --force
npm install
```

**Module not found errors**
```bash
rm -rf node_modules
npm install
```

---

## Contributing

1. Branch off from `dev2`: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m "Add your feature"`
3. Push and open a PR targeting `dev2`

---

## Support

Open an issue in the repository or reach out to the project maintainers.

---

## Deployment
 
### Live URLs
 
| Service | URL |
|---|---|
| Backend | https://routify-t9s0.onrender.com |
| Frontend | https://cycling-community-website.vercel.app/auth |
 
### Backend — Railway
 
1. Push your backend code to GitHub
2. Go to [railway.app](https://railway.app) and create a new project → **Deploy from GitHub repo**
3. Select the repository and the correct branch (`dev2`)
4. Add your environment variables under **Variables** (same as your `.env`)
5. Railway will auto-deploy on every push — grab the generated URL from the **Settings** tab
 
### Frontend — Vercel
 
1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Set the root directory to your frontend folder if needed
3. Add environment variables under **Settings → Environment Variables**:
   ```env
   REACT_APP_API_URL=https://your-railway-url.up.railway.app/api
   REACT_APP_ENV=production
   ```
4. Vercel auto-deploys on every push to `dev2` — your live URL is shown on the dashboard
 
> Make sure `REACT_APP_API_URL` points to your Railway backend URL, not `localhost`.
 
---

## API Integration Testing (Postman)

### Environment Setup

Update your existing Postman environment with the live Render URL. All other variables are auto-filled when you run Login.

| Variable | Value |
|---|---|
| `baseURL` | `https://your-render-url.onrender.com` |
| `token` | _(auto-filled on Login)_ |
| `userId` | _(auto-filled on Login)_ |
| `RideToken` | _(auto-filled on Login)_ |
| `adminToken` | _(auto-filled on Login)_ |
| `routeId` | _(auto-filled on create route)_ |
| `rideId` | _(auto-filled on create ride)_ |
| `interactionId` | _(auto-filled on create hazard)_ |
| `eventId` | _(auto-filled on create event)_ |

To update: click the eye icon → **Edit** → update `baseURL` → add any missing empty variables → **Save**.

---

### Step 1: Fix Hardcoded `localhost` URLs

Several requests still use `http://localhost:3001`. Replace them with `{{baseURL}}`:

- **user-management** — Register, Login, User Register
- **Notifications** — all 4 requests
- **community-hub** — all requests
- **hazard-and-feedback** — all requests
- **ride-and-eco-impact** — Get all rides, Get Ride by ID

---

### Step 2: Fix Hardcoded Tokens in `community-hub`

Several requests have expired hardcoded JWT tokens. For each affected request: open it → **Authorization** tab → replace the token value with `{{token}}` → **Save**.

Requests to fix: Create Event, Join Event, Withdraw from Event, Update Event, Create Challenge, Join Challenge, Update Progress, Check Challenge Ended (use `{{adminToken}}`).

---

### Step 3: Add Post-Response Test Scripts

For each request below, go to **Scripts → Post-res** and paste the corresponding script.

<details>
<summary><strong>Collection 1: user-management</strong></summary>

**Login**
```js
const response = pm.response.json();
if (response.token) {
  pm.environment.set('token', response.token);
  pm.environment.set('userId', response.user.id);
  pm.environment.set('RideToken', response.token);
  pm.environment.set('adminToken', response.token);
  console.log('Token saved!');
}
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Response has token", () => {
  pm.expect(response).to.have.property("token");
  pm.expect(response.token).to.be.a("string");
});
```

**User Register / Admin Register**
```js
pm.test("Status is 201 or 409", () => pm.expect(pm.response.code).to.be.oneOf([201, 409]));
pm.test("If 201, response has token", () => {
  if (pm.response.code === 201) pm.expect(pm.response.json()).to.have.property("token");
});
pm.test("If 409, error message returned", () => {
  if (pm.response.code === 409) pm.expect(pm.response.json()).to.have.property("error");
});
```

**GetProfile**
```js
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Response has user data", () => {
  const r = pm.response.json();
  pm.expect(r).to.have.property("name");
  pm.expect(r).to.have.property("email");
});
```
</details>

<details>
<summary><strong>Collection 2: route-planning & discovery</strong></summary>

**create**
```js
pm.test("Status is 201", () => pm.response.to.have.status(201));
pm.test("Response has route data", () => {
  const r = pm.response.json();
  pm.expect(r).to.have.property("route");
  pm.expect(r.route).to.have.property("_id");
  pm.expect(r.route).to.have.property("name");
  pm.expect(r.route).to.have.property("distance");
});
const response = pm.response.json();
if (response.route?._id) pm.environment.set("routeId", response.route._id);
```

**getPublicRoutes**
```js
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Response has routes array", () => {
  const r = pm.response.json();
  pm.expect(r).to.have.property("routes");
  pm.expect(r.routes).to.be.an("array");
  pm.expect(r).to.have.property("count");
});
```

**getOtherPublicRoutes**
```js
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("All returned routes are public", () => {
  pm.response.json().routes.forEach(route => pm.expect(route.isPublic).to.be.true);
});
```

**getUserRoutes / getNearbyRoutes** — same pattern as `getPublicRoutes`, check for `routes` array.

**update**
```js
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Route was updated", () => {
  const r = pm.response.json();
  pm.expect(r).to.have.property("route");
  pm.expect(r.message).to.equal("Route updated successfully");
});
```

**delete**
```js
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Delete confirmation returned", () => {
  const r = pm.response.json();
  pm.expect(r.message).to.equal("Route deleted successfully");
  pm.expect(r).to.have.property("deletedRouteId");
});
```

**AddToFav / RemoveFromFav / getFavRoutes**
```js
pm.test("Status is 200 or 201", () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));
pm.test("Response has message", () => pm.expect(pm.response.json()).to.have.property("message"));
```
</details>

<details>
<summary><strong>Collection 3: ride-and-eco-impact</strong></summary>

**Create a ride**
```js
pm.test("Status is 201", () => pm.response.to.have.status(201));
pm.test("Response has ride data", () => {
  const r = pm.response.json();
  pm.expect(r).to.have.property("_id");
  pm.expect(r).to.have.property("distance_km");
});
const response = pm.response.json();
if (response._id) pm.environment.set("rideId", response._id);
```

**Get all rides / Get Ride by ID / Get a ride by user**
```js
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Response is an array or object", () => {
  const r = pm.response.json();
  pm.expect(r).to.satisfy(r => Array.isArray(r) || typeof r === "object");
});
```

**Update a ride / Delete a ride** — check for status 200 and `message` or `_id` in response.

**EcoImpact endpoints** — check for status 200 and array or object response.
</details>

<details>
<summary><strong>Collection 4: community-hub</strong></summary>

**Create Event**
```js
pm.test("Status is 201", () => pm.response.to.have.status(201));
pm.test("Event has expected fields", () => {
  const r = pm.response.json();
  pm.expect(r).to.have.property("eventId").or.to.have.property("_id");
});
const response = pm.response.json();
const eventId = response.eventId || response._id;
if (eventId) pm.environment.set("eventId", eventId);
```

**GET All Events / GET Single Event / GET Participants** — check for status 200 and array or object.

**Join/Withdraw Event, Join Challenge, Update Progress**
```js
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Response has success message", () => pm.expect(pm.response.json()).to.have.property("message"));
```

**Create Challenge** — check for status 201 and `title`, `challengeId`, or `_id` in response.

**Get Leaderboard / All Challenges / Single Challenge** — check for status 200 and data.

**Update Event / Delete Event / Check Challenge Ended** — check for status 200 and `message`.
</details>

<details>
<summary><strong>Collection 5: hazard-and-feedback</strong></summary>

**Create hazard**
```js
pm.test("Status is 201", () => pm.response.to.have.status(201));
pm.test("Interaction was created", () => {
  const r = pm.response.json();
  pm.expect(r).to.have.property("_id");
  pm.expect(r).to.have.property("intType");
});
const response = pm.response.json();
if (response._id) pm.environment.set("interactionId", response._id);
```

**Get all interactions / Filter endpoints** — check for status 200 and array or `interactions` object.

**Get interaction by ID** — check for `intType` and `_id` in response.

**Partial Update / Deactivate** — check for status 200 and `_id` or `message`.

**Active Hazards / Get Route Feedback / Trigger expiry job** — check for status 200 and data.

> ⚠️ **Note:** `Create Feedback` uses GET instead of POST — skip until fixed.
</details>

<details>
<summary><strong>Collection 6: Notifications</strong></summary>

**Get all / Filter by userId** — check for status 200 and array or `notifications` object.

**Full update notification** — check for status 200 and `_id` in response.

**Delete notification** — check for status 200 and `message` in response.
</details>

---

### Step 4: Collection Runner — Run Order

Always run **Login first** so the token is available for all other requests.

1. user-management → Login _(saves token, userId, RideToken, adminToken)_
2. user-management → GetProfile
3. user-management → Register
4. route-planning → create _(saves routeId)_
5. route-planning → getPublicRoutes, getUserRoutes, getOtherPublicRoutes, getNearbyRoutes
6. route-planning → AddToFav, getFavRoutes, RemoveFromFav
7. route-planning → update, delete
8. ride-and-eco-impact → Create a ride _(saves rideId)_
9. ride-and-eco-impact → Get all rides, Get Ride by ID, Get a ride by user
10. ride-and-eco-impact → EcoImpact endpoints
11. ride-and-eco-impact → Update a ride, Delete a ride
12. hazard-and-feedback → Create hazard _(saves interactionId)_
13. hazard-and-feedback → All filter/get, Partial Update, Deactivate
14. community-hub → Create Event _(saves eventId)_
15. community-hub → All event and challenge endpoints
16. Notifications → All endpoints

To run: click **⋯** next to a collection → **Run collection** → select your environment → set run order → **Run**. Green = pass, red = fail.

---

### Known Issues

| Issue | Status |
|---|---|
| `Check Challenge Ended` returns 404 | Route `/api/community/challenges/:id/check-ended` not implemented on backend |
| `Create Feedback` uses GET instead of POST | Bug in the collection — skip until fixed |

# Backend API Documentation

This document describes the REST API exposed by the `backend` service of the Cycling Community Website. It covers authentication, route endpoints, request payloads, query parameters, and required environment configuration.

---

## Base Information

- Base URL: `http://localhost:3001/api`
- Server entrypoint: `backend/server.js`
- Express app configuration: `backend/app.js`
- Database: MongoDB
- Authentication: JWT via `Authorization: Bearer <token>` header
- Content type:
  - `application/json` for JSON requests
  - `multipart/form-data` for interactions with image uploads

---

## Environment Variables

The backend requires the following environment variables in `.env`:

- `MONGODB_URI` - MongoDB connection string
- `PORT` - HTTP port (example: `3001`)
- `JWT_SECRET` - secret used to sign JWTs
- `JWT_EXPIRES_IN` - token lifetime (example: `1d`)
- `ADMIN_CREATION_SECRET` - admin creation secret
- `RESEND_API_KEY` - Resend email service API key
- `MAPBOX_TOKEN` - Mapbox API token for route geometry and geocoding
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

---

## Setup

```bash
cd backend
npm install
npm run dev
```

If using production mode:

```bash
npm start
```

---

## Authentication

### Register

- URL: `POST /api/users/register`
- Body:
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
- Response: JWT token, user object

### Login

- URL: `POST /api/users/login`
- Body:
  - `email` (string, required)
  - `password` (string, required)
- Response: JWT token, user object

### Protected endpoints

Protected endpoints require the header:

```http
Authorization: Bearer <token>
```

---

## Users

### Get profile

- URL: `GET /api/users/profile`
- Auth: required
- Response: user object

### Get community profile

- URL: `GET /api/users/profile/community`
- Auth: required
- Response: community summary and participation statistics for the authenticated user

---

## Routes

### Create a route

- URL: `POST /api/routes/newRoute`
- Auth: required
- Body:
  - `name` (string, required)
  - `coordinates` (array, required)
    - Example: `[[lng, lat], [lng, lat], ...]`
    - Minimum 2 coordinate pairs
  - `isPublic` (boolean, required)
- Response: created route object

### Get routes

- URL: `GET /api/routes/viewRoutes`
- Auth: required
- Query parameters:
  - `userId` (string, optional) - filter by user
  - `isPublic` (boolean as string, optional) - `true` or `false`
- Notes:
  - If `userId` is provided and the caller is not the same user, only public routes are returned.
  - If no `userId` is provided, public routes are returned.

### Get nearby routes

- URL: `GET /api/routes/nearby`
- Auth: required
- Query parameters:
  - `lat` (number, required)
  - `lng` (number, required)
  - `radius` (number, optional, meters)
- Response: public routes near the requested location

### Update a route

- URL: `PUT /api/routes/updateRoute/:id`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)
- Body fields (at least one required):
  - `name` (string)
  - `coordinates` (array of coordinate pairs)
  - `isPublic` (boolean)
- Notes: if coordinates change, the backend refreshes the snapped route geometry via Mapbox

### Delete a route

- URL: `DELETE /api/routes/deleteRoute/:id`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)

---

## Rides

### Create a ride

- URL: `POST /api/rides`
- Auth: required
- Body:
  - `distance_km` (number, required)
  - `duration_minutes` (number, required)
  - `route_id` (MongoDB ObjectId, optional)
  - `start_time` (ISO 8601 string, optional)
  - `end_time` (ISO 8601 string, optional)

### List all rides

- URL: `GET /api/rides`
- Auth: not required
- Response: all ride records

### List my rides

- URL: `GET /api/rides/me`
- Auth: required
- Response: rides for the authenticated user

### Get my ride stats

- URL: `GET /api/rides/stats/me`
- Auth: required
- Response: personal ride statistics

### Get ride by ID

- URL: `GET /api/rides/:id`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)

### Update a ride

- URL: `PUT /api/rides/:id`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)
- Body fields (at least one required):
  - `distance_km` (number)
  - `duration_minutes` (number)
  - `start_time` (ISO 8601 string)
  - `end_time` (ISO 8601 string)

### Delete a ride

- URL: `DELETE /api/rides/:id`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)

---

## Interactions

### Get interactions

- URL: `GET /api/interactions`
- Auth: required
- Query parameters:
  - `intType` (optional, `hazard` or `feedback`)
  - `isActive` (optional, `true` or `false`)

### Get active hazards

- URL: `GET /api/interactions/active-hazards`
- Auth: required
- Response: active hazard reports with location metadata

### Get route feedback

- URL: `GET /api/interactions/route/:routeId/feedback`
- Auth: required
- Path parameters:
  - `routeId` (MongoDB ObjectId)

### Get interaction by ID

- URL: `GET /api/interactions/:id`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)

### Create an interaction

- URL: `POST /api/interactions`
- Auth: required
- Content-Type: `multipart/form-data`
- Fields:
  - `routeId` (MongoDB ObjectId, optional)
  - `intType` (string, required) - either `hazard` or `feedback`
  - `intDescription` (string, optional)
  - `intRating` (integer 1-5, required for `feedback`)
  - `severityLevel` (`low`, `medium`, `high`, required for `hazard`)
  - `intLatitude` (number, optional)
  - `intLongitude` (number, optional)
  - `expiryTime` (ISO 8601 string, optional)
  - `fcmToken` (string, optional)
  - `image` (file, optional)

### Update an interaction

- URL: `PATCH /api/interactions/:id`
- Auth: required
- Content-Type: `multipart/form-data`
- Path parameters:
  - `id` (MongoDB ObjectId)
- Body fields: any subset of the fields used for creation

### Deactivate an interaction

- URL: `PATCH /api/interactions/:id/deactivate`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)

### Delete an interaction

- URL: `DELETE /api/interactions/:id`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)

---

## Favorites

### Get favorites

- URL: `GET /api/favourites`
- Auth: required
- Response: list of favorite routes for the authenticated user

### Add favorite

- URL: `POST /api/favourites/:routeId`
- Auth: required
- Path parameters:
  - `routeId` (MongoDB ObjectId)

### Remove favorite

- URL: `DELETE /api/favourites/:routeId`
- Auth: required
- Path parameters:
  - `routeId` (MongoDB ObjectId)

---

## Notifications

### List notifications

- URL: `GET /api/notifications`
- Auth: required
- Query parameters:
  - `userId` (MongoDB ObjectId, optional)

### Trigger expiry check

- URL: `POST /api/notifications/trigger-expiry-check`
- Auth: required
- Notes: manually triggers hazard expiry processing

### Update notification

- URL: `PUT /api/notifications/:id`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)
- Body fields (at least one required):
  - `status` (`sent` or `failed`)
  - `title` (string)
  - `body` (string)
  - `fcmToken` (string)

### Delete notification

- URL: `DELETE /api/notifications/:id`
- Auth: required
- Path parameters:
  - `id` (MongoDB ObjectId)

### Example FCM update route

- URL: `PATCH /api/notifications/update-fcm`
- Auth: required
- Body:
  - `fcmToken` (string)
- Notes: this route is included as an example backend utility endpoint

---

## Eco Impact

### List all impacts

- URL: `GET /api/impact`
- Auth: required

### List my impacts

- URL: `GET /api/impact/me`
- Auth: required

### Get my impact stats

- URL: `GET /api/impact/stats/me`
- Auth: required

### Get impact by ride

- URL: `GET /api/impact/:rideId`
- Auth: required
- Path parameters:
  - `rideId` (MongoDB ObjectId)

---

## Community Statistics

### Get community stats

- URL: `GET /api/community-stats`
- Auth: not required
- Response: aggregated community metrics

---

## Community Events

### Get all community events

- URL: `GET /api/community/events`
- Auth: not required
- Query parameters:
  - `status` (optional)

### Create a community event

- URL: `POST /api/community/events`
- Auth: required
- Admin only
- Body:
  - `title` (string, required)
  - `description` (string, optional)
  - `location` (string, required)
  - `eventDate` (ISO 8601 string, required)
  - `eventTime` (string, required)
  - `maxParticipants` (number, required)

### Get community event by ID

- URL: `GET /api/community/events/:id`
- Auth: not required
- Path parameters:
  - `id` (string)

### Get event participants

- URL: `GET /api/community/events/:id/participants`
- Auth: not required
- Path parameters:
  - `id` (string)

### Join a community event

- URL: `POST /api/community/events/:id/join`
- Auth: required
- Path parameters:
  - `id` (string)

### Withdraw from a community event

- URL: `POST /api/community/events/:id/withdraw`
- Auth: required
- Path parameters:
  - `id` (string)

### Update community event

- URL: `PATCH /api/community/events/:id`
- Auth: required
- Admin only
- Path parameters:
  - `id` (string)
- Body: any event fields to update

### Delete community event

- URL: `DELETE /api/community/events/:id`
- Auth: required
- Admin only
- Path parameters:
  - `id` (string)

---

## Community Challenges

### Get all community challenges

- URL: `GET /api/community/challenges`
- Auth: not required
- Query parameters:
  - `status` (optional)

### Create a community challenge

- URL: `POST /api/community/challenges`
- Auth: required
- Admin only
- Body:
  - `title` (string, required)
  - `description` (string, optional)
  - `targetDistance` (number, required)
  - `startDate` (ISO 8601 string, required)
  - `endDate` (ISO 8601 string, required)

### Get challenge by ID

- URL: `GET /api/community/challenges/:id`
- Auth: not required
- Path parameters:
  - `id` (string)

### Get challenge participants

- URL: `GET /api/community/challenges/:id/participants`
- Auth: not required
- Path parameters:
  - `id` (string)

### Get challenge leaderboard

- URL: `GET /api/community/challenges/:id/leaderboard`
- Auth: not required
- Path parameters:
  - `id` (string)

### Join a challenge

- URL: `POST /api/community/challenges/:id/join`
- Auth: required
- Path parameters:
  - `id` (string)

### Update challenge progress

- URL: `PUT /api/community/challenges/:id/progress`
- Auth: required
- Path parameters:
  - `id` (string)
- Body:
  - `distance` (number, required)

### Check challenge ended

- URL: `POST /api/community/challenges/:id/check-ended`
- Auth: required
- Admin only
- Path parameters:
  - `id` (string)

### Get user participation history

- URL: `GET /api/community/challenges/user/:userId`
- Auth: required
- Path parameters:
  - `userId` (MongoDB ObjectId)

---

## Error handling

Common HTTP status codes returned by the API:

- `200` - success
- `201` - created
- `400` - validation or request error
- `401` - authentication required or invalid token
- `403` - access denied
- `404` - resource not found
- `500` - server error

Validation failures return a JSON body with an `errors` array.

---

## Notes

- The backend schedules monthly email jobs when `NODE_ENV !== 'test'`.
- The hazard expiry job is started after MongoDB connects.
- Several routes require admin privileges via JWT claims.
- Interaction image uploads use `multipart/form-data` with field name `image`.
