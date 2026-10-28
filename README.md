# AuthUI

NifCash auth gateway UI (React + Vite). Talks to NifAuth through same-origin proxy (`/api`, `/connect`).

## Prerequisites

- Node.js 20+
- NifAuth API running on `http://localhost:5238`

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:7145`.

Bootstrap login (dev):

- Email: `superadmin@nifcash.local`
- Password: `ChangeMe!SuperAdmin1`

## Gateway calls

| UI action | Endpoint |
|-----------|----------|
| Login | `POST /api/auth/login` |
| Profile | `GET /api/auth/me` |
| Change password | `POST /api/auth/change-password` |
| Refresh token | `POST /connect/token` |

Vite proxies these to NifAuth. CORS is also enabled on the API for `:7145` if you call the API origin directly.
