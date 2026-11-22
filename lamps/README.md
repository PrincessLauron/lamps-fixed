# LAMS — Laboratory Asset Management System

This project keeps the supplied LAMS interface and its browser interactions in `public/index.html`, adds a Node.js/Express backend with SQLite persistence and administrator sessions, and provides a Python/FastAPI analytics service.

## Requirements

- Node.js 20 or newer
- Python 3.10 or newer
- npm

## Configure and run

1. Copy `.env.example` to `.env`. Set a unique `SESSION_SECRET` (at least 32 characters) and a strong `ADMIN_PASSWORD` (at least 12 characters). The initial administrator is created from these values the first time the server starts.
2. Install Node dependencies and start Express:

   ```powershell
   npm install
   npm start
   ```

3. In a separate PowerShell window, install and start the analytics service:

   ```powershell
   py -m venv python_service\.venv
   .\python_service\.venv\Scripts\Activate.ps1
   pip install -r python_service\requirements.txt
   Set-Location python_service
   uvicorn main:app --host 127.0.0.1 --port 8000
   ```

4. Open `http://localhost:3000` and sign in with the configured administrator credentials.

The Node service creates `database/lams.sqlite` and a separate SQLite session store automatically. Set `DATABASE_PATH` to use another database file. The Python service is called by the authenticated Node endpoint `GET /api/reports/summary`; configure `PYTHON_SERVICE_URL` if it runs elsewhere.

## Data and APIs

- `GET /api/health`: Node service health.
- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`: administrator session.
- `GET /api/auth/profile`, `PUT /api/auth/profile`: administrator profile and password update.
- `GET /api/state`, `PUT /api/state`: load/save the app's complete state document. Updates use `If-Match` with the version returned by `GET`; stale writes are rejected with HTTP 409.
- `GET /api/reports/summary`: Node-to-Python inventory, booking, and lost-alert analytics.
- Python `GET /health` and `POST /analytics/summary` are service endpoints; keep the Python listener on localhost or a trusted private network.

The app's state document retains the original assets, bookings, alerts, schedules, room layouts, lab names, room dimensions, custom types, and activity log. The complete JSON document is stored transactionally in SQLite, retaining the existing nested room-layout shape. On first use, existing `lams_v2` browser data is migrated to the server. A browser-side copy is kept as an offline recovery backup; server write failures are reported in the interface instead of being silently ignored.

## Open the HTML directly

Opening `public/index.html` as a local file runs the original frontend in standalone mode. Its existing dashboard, inventory, room builder, bookings, schedule, alerts, and CSV export work with data saved in that browser's local storage. Standalone mode does not provide server authentication or shared SQLite storage; administrator password changes and Python analytics require the Node.js server. For the full application, start the services above and use `http://localhost:3000`.

## Tests

Run the Node state-validation tests from the project root with `npm test`. Run the analytics tests from `python_service` with `py -m unittest discover -s tests -v`.

## Security notes

- Passwords are hashed with bcrypt; session cookies are HTTP-only and same-site, and sign-in attempts are rate-limited.
- Use HTTPS and set `NODE_ENV=production` in production (secure cookies are enabled then).
- Configure a strong, private `SESSION_SECRET`; do not commit `.env` or database files.
- The original HTML app did not implement sign-in or role-based accounts. This conversion adds one configured administrator account, not a multi-user/role management system.
