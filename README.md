# AI Decision Advisor

The React frontend sends the current situation and decision question to the
Express API. Hindsight recalls related past decisions and outcomes, Groq uses
those memories to generate advice, and Hindsight stores the new user context:

`Frontend -> POST /api/advisor/ask -> Hindsight recall -> Groq -> Hindsight retain -> Answer`

## Configure the backend

Copy `decision_advisor/backend/.env.example` to
`decision_advisor/backend/.env` and add your Groq and Hindsight API keys. The
Hindsight base URL defaults to Hindsight Cloud; set `HINDSIGHT_BANK_ID` if you
want a different memory bank. `GROQ_MODEL` can be set to another model available
to your Groq account.

Both keys stay on the backend; never put them in a `VITE_` variable or commit
the `.env` file. The advisor stores each question and provided current situation
in Hindsight. Use **Teach your advisor from past decisions** in the UI to save
decisions and their outcomes; relevant memories are recalled and displayed with
future answers.

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
