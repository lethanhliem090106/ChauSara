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

The production server serves the built frontend and API from one process:
run `npm run build`, then set the environment variables on the host and run
`npm start`. Set `GEMINI_MODEL` to change the default model
(`gemini-3.8-flash`) and `PORT` to change the server port. If the host requires
an explicit bind address, set `HOST=0.0.0.0`.

The API request contains only the selected health conditions, the user's
dietary preferences, and the calorie target. Gemini-generated nutrition values
are estimates and should not be treated as medical advice. The free-tier terms
may allow Google to use submitted content to improve its products; review the
current [Gemini API terms](https://ai.google.dev/gemini-api/terms) before use.
