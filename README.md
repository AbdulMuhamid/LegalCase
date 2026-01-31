# LegalEase AI

LegalEase AI is a lightweight React + Vite application that helps small business owners understand legal documents by uploading a PDF and asking questions. The UI is built with Tailwind CSS and icons from `lucide-react`. The app uses the Anthropic API to analyze documents and generate plain-language summaries and references.

Repository structure

- `index.html` — Vite entry HTML
- `package.json` — project scripts and dependencies
- `src/` — application source
	- `src/main.jsx` — React entry
	- `src/App.jsx` — main application shell
	- `src/index.css` — Tailwind entry + small helper styles
	- `src/components/` — React components (Header, UploadPanel, ChatPanel, Alert)
	- `src/lib/` — project libraries and API helpers (`anthropic.js`)
	- `src/api/` — compatibility re-exports (kept for backwards compatibility)

Getting started (Windows PowerShell)

1. Install dependencies

```powershell
npm install
```

2. Add your Anthropic API key

Create a `.env` file in the project root and add your key:

```
VITE_ANTHROPIC_API_KEY=sk-<your-anthropic-key>
```

3. Start the dev server

```powershell
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

Build for production

```powershell
npm run build
npm run preview
```

Environment variables

- `VITE_ANTHROPIC_API_KEY` — your Anthropic API key. This file is read via `import.meta.env`.

Project notes

- The Anthropic helper lives in `src/lib/anthropic.js`. If your Anthropic endpoint or request/response format differs from the current implementation, update that file.
- The old `src/api/anthropic.js` is a compatibility re-export. New code should import from `src/lib/anthropic`.
- Tailwind is configured with `tailwind.config.cjs` and `postcss.config.cjs` and used via `src/index.css`.

Troubleshooting

- If `npm install` fails because of a package version, try clearing the npm cache or using the official registry:

```powershell
npm cache clean --force
npm install --registry=https://registry.npmjs.org/
```

- If the dev server does not start, confirm `vite` is installed and check the terminal output for the URL and any errors.

Contributing

- Feel free to open issues or PRs. For changes to API calls or environment handling, update `src/lib/anthropic.js` and the README accordingly.

License

Add a license if you plan to distribute the project.

