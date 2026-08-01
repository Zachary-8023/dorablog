# DoraBlog

DoraBlog is a full-stack personal blogging platform built with SvelteKit, Express, SQLite-compatible storage, and Java Swing. It was developed as a team capstone project and supports the complete workflow from account registration and article publishing to community interaction and administration. Local development uses SQLite, while the production deployment uses Turso/libSQL for durable serverless storage.

## Live Demo

The production deployment is available at [dorablog-dun.vercel.app](https://dorablog-dun.vercel.app).

Use `demo / 123456` to try authenticated features. The seeded administrator login is available only in local development and is intentionally disabled in the public database.

## Features

- Account registration, login, logout, and JWT-based sessions using HttpOnly cookies
- Real-time username availability checks, password-strength feedback, and avatar selection or upload
- Rich-text article publishing with cover images, inline images, tags, editing, and deletion
- Article discovery with keyword search, tag filters, sorting, recommendations, and liked-post views
- Likes and threaded comments with author and administrator moderation controls
- User profiles with editable details, password changes, and account deletion
- Responsive light and dark themes
- Java Swing administration client for viewing and removing users in local development

## Tech Stack

- **Frontend:** SvelteKit 2, Svelte 5, Vite 8, TinyMCE, Day.js
- **Backend:** Node.js, Express, SQLite locally, Turso/libSQL in production, bcrypt, JSON Web Tokens, Multer
- **Hosting and storage:** Vercel Services, Vercel Blob
- **Admin client:** Java Swing, Java HTTP Client, Jackson

## My Contributions

- Implemented the login and registration flows across the Svelte frontend and Express API.
- Added password hashing, real-time username validation, password-strength feedback, and avatar upload and selection.
- Built the profile workflow for viewing and editing account details, changing passwords, and deleting accounts.
- Developed article search and sorting functionality for the article discovery page.
- Integrated and debugged authentication, database, API, logout, and Java administration workflows.
- Deployed the application to Vercel by configuring frontend and backend services, Turso/libSQL persistence, Vercel Blob uploads, production environment variables, same-origin API routing, and post-deployment regression checks.
- Collaborated through feature branches, pull requests, reviews, and integration fixes.

## Getting Started

### Prerequisites

- Node.js 20.19 or later
- npm
- Java 11 or later, only if you want to run the administration client

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API runs at `http://localhost:3000`. On first start, SQLite creates and seeds the local database. The seed data includes development-only accounts `admin / 123456` and `demo / 123456`.

### Frontend

Open another terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

`VITE_API_URL` is used only by the local Vite development server. Production browser requests use the same origin as the frontend and are routed through `/api`, so no frontend API URL is needed on Vercel.

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp .env.example .env` if `cp` is unavailable.

### Java Administration Client

Start the backend first, then open `java-client` in a Java IDE. Add the Jackson JAR files from `java-client/lib` to the project classpath and run `pccit.finalproject.javaclient.Main`.

## Production Deployment

The repository deploys as one Vercel project with two services behind the same domain:

| Path            | Service            | Runtime                  |
| --------------- | ------------------ | ------------------------ |
| `/api/*`        | Express backend    | Vercel Functions         |
| All other paths | SvelteKit frontend | Static Vercel deployment |

This layout requires Vercel Services access for the account that owns the project.

Production data is stored in Turso because Vercel Functions do not provide a persistent local filesystem for SQLite. Uploaded avatars and article images are stored in a public Vercel Blob store. Local development continues to use the SQLite file and local upload directories.

The Turso integration injects these database variables:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Connecting a Vercel Blob store supplies its required Blob/OIDC credentials automatically. Depending on the store configuration, these can include `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`, and Vercel's short-lived OIDC token. `JWT_SECRET` must also be configured for the Production, Preview, and Development environments. Do not commit or paste any credential values into the repository.

To create an equivalent deployment from a fork:

```bash
npx vercel@latest link
npx vercel@latest integration add tursocloud/database --plan starter --metadata region=hnd1
npx vercel@latest blob create-store dorablog-images --region hnd1 --access public --yes
npx vercel@latest env add JWT_SECRET production,preview
npx vercel@latest env add JWT_SECRET development
npx vercel@latest deploy --prod
```

The committed `vercel.json` builds both services, routes `/api/*` before the frontend catch-all, and provides the SPA fallback required for direct visits to nested frontend routes. The committed `.vercelignore` also prevents local environment files and build artifacts from entering deployment uploads.

## Scripts

Run frontend commands from `frontend`:

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

Run backend commands from `backend`:

```bash
npm run dev
npm run start
npm run format
```

## Project Context

This was a collaborative University of Auckland project by Team Blue Cat Four: Leo Mo-yung, Yushun Shi, Xuan Zeng, and Zhongwei Zhang. The repository is a portfolio-oriented source copy and intentionally excludes coursework reports, presentations, design source files, local environment files, generated databases, build outputs, and uploaded user data.
