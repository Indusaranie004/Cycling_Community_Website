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
