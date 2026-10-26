# Adji Cash — Financial Intelligence & Expense Management
by ADROPH TECH · React + Vite + Tailwind (frontend) · Node.js + Express (backend)

## Folder structure
```
adji-cash/
├─ package.json            root scripts (setup / dev / build / start)
├─ frontend/               React app (Vite + Tailwind)
│  ├─ index.html · vite.config.js · tailwind.config.js
│  └─ src/
│     ├─ pages/            Landing, Auth, Overview, Transactions, Budgets, ...
│     ├─ components/       ui, motion, extras, Assistant (Adji AI)
│     ├─ i18n/             eng.js · sw.js · index.js  → all Swahili/English text
│     ├─ services/api.js   calls to the backend
│     ├─ data/             brand, contact, images, mock data
│     └─ assets/           photos
└─ backend/                Express API
   ├─ .env.example         copy to .env
   ├─ data/                db.json is created here
   └─ src/
      ├─ server.js · app.js · config.js · db.js
      ├─ routes/           auth · contact (+newsletter) · transactions · assistant · admin
      ├─ middleware/       auth (JWT) · limits (rate limiting)
      └─ lib/              mailer · assistant · validate
```

## Run
    npm run setup                  # installs root + frontend + backend
    # backend/.env is configured for local development; change JWT_SECRET before deployment
    npm run dev                    # site → http://localhost:5173 , API → http://localhost:5000

The frontend API proxy reads `PORT` and `API_PROXY_TARGET` from `backend/.env`. If a port is already in use, change `PORT`, `API_PROXY_TARGET`, and `CLIENT_URL` there.

To use MongoDB Atlas, set `MONGODB_URI` and `DB_NAME` in `backend/.env`. URL-encode reserved characters in the database user's password. On first connection, existing `backend/data/db.json` data is copied into the MongoDB `app_state` collection; subsequent writes are saved there. Without `MONGODB_URI`, the API explicitly uses the local JSON database.

Production on one server: `npm run build` then `npm start` (Express serves frontend/dist).

## Language (SW / ENG)
The switch is on the landing page, the sign-in page and the dashboard header (and in Settings → Regional).
The choice is remembered. Landing, sign-in, the dashboard menus, header, search and "Add transaction"
are fully translated; add more text by adding the same key to `frontend/src/i18n/eng.js` and `sw.js`.

## Adji AI assistant
The floating AI button on the landing page talks to `POST /api/assistant`.
- Without a key it answers from a built-in Swahili/English knowledge base.
- With `ANTHROPIC_API_KEY` in `backend/.env` it gives real AI answers (model set by `ASSISTANT_MODEL`).

## API
`POST /api/auth/register · login · forgot · reset`, `GET /api/auth/me` · `POST /api/contact` · `POST /api/newsletter`
`POST /api/assistant` · `GET/POST/PUT/DELETE /api/transactions`, `GET /api/summary` (sign-in required)
`GET /api/admin/stats · messages` (only the account whose email = OWNER_EMAIL)
