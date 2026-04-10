# DeepResearchFrontEnd

A React + Vite frontend for a deep research assistant powered by Gemini and Firebase.

The app lets users sign in with Google, create research sessions, store session history in Firestore, and step through a simulated research workflow in a clean dashboard UI.

## Features

- Google sign-in with Firebase Authentication
- Session storage with Firestore
- Research timeline with step-by-step updates
- Clean dashboard interface built with React, Tailwind, and shadcn/ui
- Local development with Vite

## Tech Stack

- React
- TypeScript
- Vite
- Firebase Authentication
- Firestore
- Tailwind CSS
- shadcn/ui
- Gemini API

## Project Structure

```text
src/
  App.tsx
  main.tsx
  index.css
  lib/
    auth-context.tsx
    firebase.ts
    research-service.ts
components/
  ui/
firebase-applet-config.json
firestore.rules
vite.config.ts
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your local environment file

Create `.env.local` in the project root and add your Gemini API key:

```env
GEMINI_API_KEY="your_gemini_api_key"
APP_URL="http://localhost:3000"
```

You can use [.env.example](./.env.example) as a reference.

### 3. Configure Firebase

Make sure your Firebase project is set up with:

- a web app configuration in [firebase-applet-config.json](./firebase-applet-config.json)
- Google sign-in enabled in Firebase Authentication
- `localhost` added in `Authentication > Settings > Authorized domains`
- Firestore Database created
- rules deployed from [firestore.rules](./firestore.rules)

### 4. Run the app

```bash
npm run dev
```

By default, the app runs locally at `http://localhost:3000`.

## Firebase Setup Notes

This app uses Firebase for:

- user authentication
- user profile storage
- research session storage
- per-user access control through Firestore rules

Important files:

- [src/lib/firebase.ts](./src/lib/firebase.ts): initializes Firebase, Auth, and Firestore
- [src/lib/auth-context.tsx](./src/lib/auth-context.tsx): listens for auth state changes
- [firestore.rules](./firestore.rules): restricts access to signed-in users and their own data

## Build

```bash
npm run build
```

## Common Issues

### Google sign-in says domain not authorized

Add `localhost` in Firebase Console:

`Authentication > Settings > Authorized domains`

### Gemini requests fail

Check that `GEMINI_API_KEY` is set correctly in `.env.local`.

## Repository

GitHub: [R-World007/DeepResearchFrontEnd](https://github.com/R-World007/DeepResearchFrontEnd)
