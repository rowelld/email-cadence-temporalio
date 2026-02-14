# Email Cadence - Temporalio

Small demo app that creates an email cadence, enrolls a contact, runs the cadence via Temporal workflows, and supports live cadence updates while the workflow is running.

**Monorepo layout**
`apps/web` Next.js frontend
`apps/api` NestJS API
`apps/worker` Temporal.io worker

## Requirements
Node.js 18+
Temporal Server available in the environment

## Setup
```bash
npm install
```

## Configuration
Environment variables (placeholders):
`TEMPORAL_ADDRESS` default `localhost:7233`
`TEMPORAL_NAMESPACE` default `default`
`TEMPORAL_TASK_QUEUE` default `email-cadence`
`PORT` default `3000` (API)
`NEXT_PUBLIC_API_URL` default `http://localhost:3000` (Web)

## Run
Run everything:
```bash
npm run dev
```

Run individually:
```bash
npm run dev:api
npm run dev:worker
npm run dev:web
```

The web app runs on `http://localhost:3001` by default.

## API Endpoints
Cadences:
`POST /cadences` Create cadence
`GET /cadences/:id` Get cadence
`PUT /cadences/:id` Update cadence definition

Enrollments:
`POST /enrollments` Body `{ cadenceId, contactEmail }` Starts workflow
`GET /enrollments/:id` Returns current status
`POST /enrollments/:id/update-cadence` Body `{ steps }` Sends signal to running workflow

## API Examples
Create cadence:
```bash
curl -X POST http://localhost:3000/cadences \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cad_123",
    "name": "Welcome Flow",
    "steps": [
      { "id": "1", "type": "SEND_EMAIL", "subject": "Welcome", "body": "Hello there" },
      { "id": "2", "type": "WAIT", "seconds": 10 },
      { "id": "3", "type": "SEND_EMAIL", "subject": "Follow up", "body": "Checking in" }
    ]
  }'
```

Get cadence:
```bash
curl http://localhost:3000/cadences/cad_123
```

Update cadence definition:
```bash
curl -X PUT http://localhost:3000/cadences/cad_123 \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cad_123",
    "name": "Welcome Flow v2",
    "steps": [
      { "id": "1", "type": "SEND_EMAIL", "subject": "Updated", "body": "New copy" }
    ]
  }'
```

Enroll contact:
```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{ "cadenceId": "cad_123", "contactEmail": "person@example.com" }'
```

Get workflow state:
```bash
curl http://localhost:3000/enrollments/<enrollmentId>
```

Update running cadence steps:
```bash
curl -X POST http://localhost:3000/enrollments/<enrollmentId>/update-cadence \
  -H "Content-Type: application/json" \
  -d '{ "steps": [ { "id": "1", "type": "SEND_EMAIL", "subject": "Updated", "body": "New copy" } ] }'
```
