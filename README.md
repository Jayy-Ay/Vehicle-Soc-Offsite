# Vehicle SOC Dashboard

## Project Description

Real-time security monitoring dashboard for connected vehicle fleet TEE (Trusted Execution Environment) anomaly detection.

## How to run the project locally

**Prerequisites**

- Node.js (recommended: install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Bun (this project uses Bun as package manager)

**Installation and Setup:**

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd Vehicle-Soc-Offsite/main

# Step 3: Install dependencies using Bun
bun install

# Step 4: Start the development server
bun run dev
```

The development server will start on http://localhost:8080/

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run build:dev` - Build in development mode
- `bun run lint` - Run ESLint
- `bun run preview` - Preview the built application

## Features

- Real-time vehicle security monitoring
- SOC (Security Operations Center) dashboard
- Threat visualization and analytics
- Vehicle status monitoring
- Alert management system

## Authentication and access control

- Supabase Auth backed sign-in with optional Google SSO (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- Demo-friendly fallback if Supabase/Google is not configured (no setup required)
- Roles: **Admin** (full access), **Manager** (limited management), **Viewer/Analyst** (read-only)
- Demo accounts ready to use:
  - Admin — `admin@soc.demo` / `admin123!`
  - Manager — `manager@soc.demo` / `manager123!`
  - Analyst — `analyst@soc.demo` / `analyst123!`

If you enable Google SSO in Supabase, the login screen will use it automatically; otherwise, the demo accounts remain available for the live walkthrough.
