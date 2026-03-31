# CodeBird

CodeBird is a local AI-assisted app builder with:

- a React + Vite frontend in `ide_frontend`
- an Express backend in `ide_backend`
- a sample generated project in `generated-app/project_1`

## Requirements

- Node.js `20.19.0` or newer
- npm `10+` recommended

## Setup

From the repo root:

```bash
npm run install:all
```

## Run

Start the backend in one terminal:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Then open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5050
```

## Project Structure

```text
CodeBird/
  ide_frontend/   React + Vite app
  ide_backend/    Express API and sandbox launcher
  generated-app/  Sample generated app used by the IDE
```

## Notes

- `dist/`, `build/`, and `node_modules/` are gitignored.
- If `npm run dev:frontend` fails, check your Node version first with `node -v`.
- The frontend expects the backend to be running locally on port `5050`.
