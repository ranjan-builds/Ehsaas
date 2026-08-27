# Ehsaas

Ehsaas is a responsive Shayari and expressive quotes web app for discovering, saving, searching, and sharing Hindi, Urdu, Hinglish, and English poetry.

## Features

- Browse poetry and quotes by category and language
- Search quote text, authors, categories, and tags
- Sort by latest, oldest, or most liked
- Save bookmarks locally in the browser
- Like quotes with local persistence
- Copy quotes to the clipboard
- Share quotes through WhatsApp
- Random quote and featured quote experiences
- Light and dark themes
- Responsive mobile navigation
- Admin interface for adding, editing, and deleting content
- Optional Google Sheets backend with local fallback data
- PWA manifest, responsive favicons, and social preview image

## Project Structure

```text
.
├── index.html                 # Main app, styles, markup, and browser logic
├── script.js                  # Seed data and standalone logic reference
├── og-image.png               # Open Graph and Twitter preview image
├── favicons/
│   ├── manifest.json          # Web app manifest
│   ├── favicon.ico
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── favicon-48.png
│   ├── favicon-96.png
│   ├── favicon-128.png
│   ├── favicon-256.png
│   ├── android-chrome-192.png
│   ├── android-chrome-512.png
│   ├── apple-touch-icon.png
│   └── mstile-150.png
└── README.md
```

## Run Locally

This is a static website and does not require a build step or package installation.

Because the app loads external resources and may call a Google Apps Script endpoint, use a local HTTP server instead of opening the file directly.

### VS Code Live Server

1. Install the Live Server extension.
2. Open the project folder in VS Code.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

### Python

```bash
python -m http.server 5500
```

Then open <http://localhost:5500>.

## Configuration

Application settings are defined in the `CONFIG` object near the top of `index.html`:

```javascript
const CONFIG = {
  GOOGLE_APPS_SCRIPT_URL: "",
  ADMIN_PIN: "change-this-pin",
  DEFAULT_PAGE_SIZE: 6,
  ENABLE_MOCK_FALLBACK: true,
};
```

- `GOOGLE_APPS_SCRIPT_URL`: Google Apps Script web app URL. Leave empty to use local seed data.
- `ADMIN_PIN`: PIN used by the browser-only admin screen. Change the default before publishing.
- `DEFAULT_PAGE_SIZE`: Number of quotes shown per page.
- `ENABLE_MOCK_FALLBACK`: Keeps the app usable when the backend is unavailable.

The app stores bookmarks, likes, and local content in `localStorage` under these keys:

- `ehsaas_bookmarks`
- `ehsaas_likes`
- `ehsaas_local_db`
- `theme`

## Google Sheets Backend

The app expects a Google Sheet with this header row:

```text
id, content, author, category, language, tags, likes, shares, featured, created_at, status
```

To connect a sheet:

1. Create a Google Sheet with the headers above.
2. Open **Extensions > Apps Script**.
3. Add the `doGet` and `doPost` handlers shown in the Admin dashboard setup tab.
4. Deploy the script as a web app.
5. Set access to allow the app to read and write as required.
6. Copy the deployment URL into `CONFIG.GOOGLE_APPS_SCRIPT_URL`.
7. Reload the app and verify that quotes load from the sheet.

Supported categories currently include:

```text
Love, Sad, Attitude, Life, Romantic, Friendship, Motivational
```

Supported languages currently include Hindi, Urdu, Hinglish, and English.

## Deployment

Deploy the project to any static hosting provider, including GitHub Pages, Netlify, Vercel, or Cloudflare Pages. Upload the complete project directory and preserve the `favicons/` folder structure.

The social preview image and favicon paths are relative, so the site can also be hosted from a project subdirectory.

## Security Notes

The admin PIN is checked in client-side JavaScript and is not a secure authentication system. Do not use it to protect sensitive data. For production administration, add authentication and authorization on the backend, validate all submitted data server-side, and restrict write access to the Google Apps Script endpoint.

## License

No license has been specified yet. Add a license before redistributing the project.

## Developer

Built by [Ranjan](https://github.com/ranjan-builds).
