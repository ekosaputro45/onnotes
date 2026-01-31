# OnNotes (React + Firebase)

This folder contains the React frontend that replaces the Laravel Blade UI.

## Prerequisites

- Node.js 18+
- pnpm

## 1) Create Firebase project

In Firebase Console:

1. Create a project
2. **Authentication** → enable **Email/Password**
3. **Firestore Database** → create database
4. **Storage** → enable
5. Project Settings → **Your apps** → add a **Web app** and copy the config

## 2) Configure env

Copy the example env:

- `cp .env.example .env`

Fill values in `.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 3) Install & run

```bash
pnpm install
pnpm run dev --host 127.0.0.1 --port 5173
```

Open:

- http://127.0.0.1:5173

## Firestore structure

Collections:

- `categories`
  - `{ userId, name, createdAt, createdAtServer }`
- `notes`
  - `{ userId, title, content, categoryId, image, createdAt, updatedAt }`

`image` shape:

- Storage upload: `{ kind: 'storage', url, storagePath }`
- External URL: `{ kind: 'external', url }`

## Security rules

Recommended rules (copy to Firebase console):

- `firestore.rules`
- `storage.rules`

## Notes

- This is a client-only app. The old Laravel backend is still present in the repo but is no longer required once you fully move to Firebase.
