# Cloud Nexus Landing Page

A simple Node.js application with a Cloud Nexus landing page and modern design theme.

## Features

- Cloud and tech visual identity with dark charcoal, sky blue, and neon cyan accents
- Hero section, services grid, about section, careers hub, and contact details
- Glassmorphism panels, hover interactions, and a live tech stack marquee
- Fresher application form with resume upload UI
- Docker-ready for GitHub Actions deployment

## Run locally

1. Install Node.js 20 or later
2. Run:

```bash
npm install
npm start
```

3. Open `http://localhost:3000`

## Docker

Build and run with Docker:

```bash
docker build -t cloud-nexus-welcome .
docker run -p 3000:3000 cloud-nexus-welcome
```

## GitHub Actions

A workflow is included to build and push a Docker image automatically when code is pushed to `main`.
