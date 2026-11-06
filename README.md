# AI Decision Advisor

The React frontend sends a question to the Express API, which asks Groq for an
answer and returns it to the browser:

`Frontend -> POST /api/advisor/ask -> Backend -> Groq -> Answer`

## Configure the backend

Copy `decision_advisor/backend/.env.example` to
`decision_advisor/backend/.env` and set `GROQ_API_KEY` to your Groq API key.
The key stays on the backend; do not put it in a `VITE_` variable or commit the
`.env` file. `GROQ_MODEL` can be set to another model available to your Groq
account.

## Run locally

From the repository root, start the backend in one terminal:

```powershell
cd decision_advisor/backend
npm install
npm start
```

Then start the frontend from the repository root in another terminal:

```powershell
npm install
npm run dev
```

The frontend defaults to `http://localhost:5000` for the backend. To use a
different backend URL, set `VITE_API_BASE_URL` in a frontend `.env.local` file.
