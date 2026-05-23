# Cravings Website

This project includes a static website with a simple Node.js backend API to receive form data.

## Setup

1. Open a terminal in `d:\Cravings\CravingWeb`
2. Run:
   ```bash
   npm install
   npm start
   ```
3. Open in browser:
   ```
   http://localhost:3000
   ```

## Features added

- `server.js` serves `home.html` and static files
- REST endpoints:
  - `POST /api/login`
  - `POST /api/register`
  - `POST /api/contact`
  - `POST /api/feedback`
  - `POST /api/support`
- `script.js` handles client-side form submission and messages
- `data/` folder stores submissions in JSON files

## Notes

- This is a demo backend. It stores data in files, not a database.
- If the server does not start, make sure Node.js is installed.
