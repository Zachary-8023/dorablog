# DoraBlog

DoraBlog is a full-stack personal blogging platform built with SvelteKit, Express, SQLite, and Java Swing. It was developed as a team capstone project and supports the complete workflow from account registration and article publishing to community interaction and administration.

## Features

- Account registration, login, logout, and JWT-based sessions using HttpOnly cookies
- Real-time username availability checks, password-strength feedback, and avatar selection or upload
- Rich-text article publishing with cover images, inline images, tags, editing, and deletion
- Article discovery with keyword search, tag filters, sorting, recommendations, and liked-post views
- Likes and threaded comments with author and administrator moderation controls
- User profiles with editable details, password changes, and account deletion
- Responsive light and dark themes
- Java Swing administration client for viewing and removing users

## Tech Stack

- **Frontend:** SvelteKit 2, Svelte 5, Vite 8, TinyMCE, Day.js
- **Backend:** Node.js, Express, SQLite, bcrypt, JSON Web Tokens, Multer
- **Admin client:** Java Swing, Java HTTP Client, Jackson

## My Contributions

- Implemented the login and registration flows across the Svelte frontend and Express API.
- Added password hashing, real-time username validation, password-strength feedback, and avatar upload and selection.
- Built the profile workflow for viewing and editing account details, changing passwords, and deleting accounts.
- Developed article search and sorting functionality for the article discovery page.
- Integrated and debugged authentication, database, API, logout, and Java administration workflows.
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

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp .env.example .env` if `cp` is unavailable.

### Java Administration Client

Start the backend first, then open `java-client` in a Java IDE. Add the Jackson JAR files from `java-client/lib` to the project classpath and run `pccit.finalproject.javaclient.Main`.

## Scripts

Run these commands inside either `backend` or `frontend`, as applicable:

```bash
npm run dev
npm run start
npm run build
npm run lint
npm run format
```

## Project Context

This was a collaborative University of Auckland project by Team Blue Cat Four: Leo Mo-yung, Yushun Shi, Xuan Zeng, and Zhongwei Zhang. The repository is a portfolio-oriented source copy and intentionally excludes coursework reports, presentations, design source files, local environment files, generated databases, build outputs, and uploaded user data.
