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