# DriveLine Dealer Network

DriveLine is a full-stack car dealership review platform. Users can create an account, browse dealership locations, open dealer profiles, and post purchase reviews with sentiment analysis.

This project started as a capstone scaffold and has been upgraded into a containerized multi-service application with a React frontend, Django authentication/admin, a Node/MongoDB API, and a Flask sentiment microservice.

## Features

- User registration, login, logout, and protected dealership routes
- Dealership directory with state filtering
- Dealer profile pages with customer reviews
- Review submission with car make/model selection
- Sentiment analysis for review text
- Django admin for car makes and models
- Docker Compose setup for local full-stack development
- Health checks for all core services
- Nginx-based frontend proxy so API routes work from the app URL

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, React Router, CSS |
| Auth/Admin | Django, SQLite |
| Dealer API | Node.js, Express, Mongoose |
| Database | MongoDB |
| Sentiment Service | Flask, NLTK Vader |
| Infrastructure | Docker, Docker Compose, Nginx |
| CI/CD | GitHub Actions |

## Architecture

```text
Browser
  |
  | http://localhost:3000
  v
React frontend container
  |-- /djangoapp/* -> Django backend
  |-- /api/*       -> Node API
  |-- /sentiment/* -> Flask sentiment service

Django backend
  |-- authentication
  |-- admin site
  |-- car make/model data
  |-- delegates dealer/review data to Node API

Node API
  |-- dealership data
  |-- review data
  v
MongoDB
```

## Quick Start

Prerequisite: Docker Desktop must be installed and running.

```powershell
copy .env.example .env
docker compose up -d --build
docker compose ps
```

Open the app:

```text
http://localhost:3000
```

Open Django admin:

```text
http://localhost:8000/admin/
```

Create an admin user:

```powershell
docker compose exec django python manage.py createsuperuser
```

## Common Commands

```powershell
docker compose ps
docker compose logs -f
docker compose down
docker compose down -v
docker compose up -d --build
```

## App Walkthrough

1. Open `http://localhost:3000`.
2. Create an account or log in.
3. Go to `Dealerships`.
4. Filter dealerships by state.
5. Open a dealer profile.
6. Post a review and choose a car make/model.
7. Return to the dealer profile to see the review with sentiment.

## API Endpoints

### Django

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/djangoapp/register` | Create user |
| POST | `/djangoapp/login` | Log in |
| GET | `/djangoapp/logout` | Log out |
| GET | `/djangoapp/get_dealers` | Get all dealers |
| GET | `/djangoapp/get_dealers/<state>` | Filter dealers by state |
| GET | `/djangoapp/dealer/<id>` | Get dealer details |
| GET | `/djangoapp/reviews/dealer/<id>` | Get dealer reviews |
| POST | `/djangoapp/add_review` | Add review |
| GET | `/djangoapp/get_cars` | Get car makes/models |

### Node API

Open the browser-friendly API index:

```text
http://localhost:3030/api/
http://localhost:3000/api/
```

The first URL talks directly to the Express container. The second goes through the React/Nginx frontend proxy, so the API is visible from the same browser origin as the app.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/` | API index with clickable endpoint links |
| GET | `/api/health` | API health check |
| GET | `/fetchDealers` | Get all dealers |
| GET | `/fetchDealers/:state` | Get dealers by state |
| GET | `/fetchDealer/:id` | Get dealer by ID |
| GET | `/fetchReviews` | Get all reviews |
| GET | `/fetchReviews/dealer/:id` | Get reviews by dealer |
| POST | `/insert_review` | Insert review |

Examples to paste directly into the browser address bar:

```text
http://localhost:3030/api/fetchDealers
http://localhost:3030/api/fetchDealers/Texas
http://localhost:3030/api/fetchDealer/1
http://localhost:3030/api/fetchReviews/dealer/1
```

## Portfolio Notes

This project demonstrates:

- Multi-service backend design
- Containerized local deployment
- Frontend route protection
- API integration across React, Django, Node, Flask, and MongoDB
- Admin tooling with Django
- Debugging and hardening a real capstone codebase

Recommended screenshots for a portfolio:

- Home page
- Login/register
- Dealership directory
- Dealer profile with reviews
- Post review form
- Django admin

## Known Development Warnings

The React build currently compiles with non-blocking warnings:

- stale Browserslist data
- an autoprefixer deprecation warning
- React hook dependency warnings in dealer/review components

These do not stop the app from running, but they are good cleanup items before a production deployment.
