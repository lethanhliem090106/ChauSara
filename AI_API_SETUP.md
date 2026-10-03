# Gemini API setup

The meal planner uses the Gemini API through the Express backend. The API key
stays on the server and is not included in the Vite frontend bundle.

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Copy `.env.example` to `.env` in the project root and set `GEMINI_API_KEY`.
   Do not commit `.env`.
3. Run `npm install` if dependencies have not been installed, then run
   `npm run dev`.
4. Open the Vite URL printed in the terminal. The development server starts
   both the frontend and the API backend.

For a production server outside Vercel, run `npm run build`, set the
environment variables on the host, then run `npm start`. Set `GEMINI_MODEL`
to change the default model (`gemini-3.8-flash`) and `PORT` to change the
server port. If the host requires an explicit bind address, set
`HOST=0.0.0.0`.

## Deploying to Vercel

1. Push the project to GitHub without committing `.env`.
2. In Vercel, import the GitHub repository and set the project root to
   `cleanbite-app` if the repository contains more than this app.
3. Keep the build command as `npm run build` and output directory as `dist`;
   these are also set in `vercel.json`.
4. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` with
   your key. Add `GEMINI_MODEL` as `gemini-3.8-flash` if you want to pin the
   model. Select the deployment environments you need and redeploy after
   changing variables.
5. Open the deployment and try the meal-planning button. Vercel serves the Vite
   frontend and runs `api/generate-plan.js` as the backend function; the
   browser never receives the Gemini key.

Do not add the Gemini key as a `VITE_*` variable or put it in `.env.example`.
If a key has been shared or exposed, revoke it and create a replacement before
deploying.

The API request contains only the selected health conditions, the user's
dietary preferences, and the calorie target. Gemini-generated nutrition values
are estimates and should not be treated as medical advice. The free-tier terms
may allow Google to use submitted content to improve its products; review the
current [Gemini API terms](https://ai.google.dev/gemini-api/terms) before use.
