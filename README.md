# NifAuthUI

NifCash auth gateway UI (React + Vite). Separate from the API repo ([NifAuthAPI](https://github.com/NifCash/NifAuthAPI)).

Talks to NifAuth through same-origin `/api` and `/connect` (Vite proxy in dev, nginx in production).

## Prerequisites

- Node.js 20+
- NifAuth API running on `http://localhost:5238` (local)

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:7145`.

## GitHub Actions deploy (UI only)

Workflow: `.github/workflows/deploy.yml`

SSH → pull `NifAuthUI` → `npm ci && npm run build` → sync to `/var/www/nifauth-ui`.

### Required secrets (this repo)

| Secret | Example |
|--------|---------|
| `SSH_HOST` | `188.132.198.146` |
| `SSH_USER` | `root` |
| `SSH_PASSWORD` | `***` |
| `GH_PAT` | `ghp_...` (`repo` scope) |

### Optional secrets

| Secret | Default |
|--------|---------|
| `DEPLOY_REPO_URL` | `https://github.com/NifCash/NifAuthUI.git` |
| `DEPLOY_REPO_DIR` | `/opt/nifauth-ui/src` |
| `DEPLOY_BRANCH` | `main` |

## Gateway calls

| UI action | Endpoint |
|-----------|----------|
| Login | `POST /api/auth/login` |
| Profile | `GET /api/auth/me` |
| Change password | `POST /api/auth/change-password` |
| Org request | `POST /api/organization-requests` |
| Branch request | `POST /api/branch-requests` |
| Refresh token | `POST /connect/token` |
