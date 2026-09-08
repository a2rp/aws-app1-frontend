# AWS App Frontend - Technical Documentation

## 1. Purpose

This project is a lightweight React frontend that monitors connectivity with the AWS App backend. It performs a backend request, presents the returned message, exposes the current service state, and keeps a local clock visible to the user.

The frontend is a static client application. It does not contain a database, authentication flow, server-side rendering, or backend business logic.

## 2. Runtime architecture

```text
Browser
  |
  | GET /api/v1/a2rp
  v
Backend API
  |
  | { success: boolean, message: string }
  v
React status dashboard
```

### Main modules

| File | Responsibility |
| --- | --- |
| `src/index.js` | Creates the React root and mounts `App` into `#root` |
| `src/App.js` | API client, state management, polling-free clock, and page markup |
| `src/index.css` | Global box sizing, margin reset, font stack, and minimum body width |
| `src/styles.module.scss` | Scoped responsive dashboard styles |
| `public/index.html` | HTML shell, metadata, favicon, and web manifest reference |
| `package.json` | Dependencies and development/build scripts |

## 3. Request lifecycle

When `App` mounts, `fetchMessage` sends a `GET` request to `/a2rp` using the configured Axios instance.

The UI starts in the `loading` state. A successful response must contain `success: true`; the returned `message` is then displayed and the state becomes `online`.

If the request fails, times out, or returns `success: false`, the state becomes `offline`, a user-facing error message is displayed, and React Toastify shows an error toast. The `Check again` button invokes the same request manually.

The request timeout is 10 seconds. Axios errors are intentionally presented as generic connectivity/timeout messages rather than exposing the complete raw error object to users.

## 4. Backend contract

The frontend expects the backend route at:

```text
GET {REACT_APP_API_BASE_URL}/a2rp
```

Minimum successful response:

```json
{
  "success": true,
  "message": "Backend is online"
}
```

If `success` is false, the optional `message` is used as the error description. If no message is returned, the frontend uses a default description.

The backend must:

- Allow the frontend origin through CORS.
- Return valid JSON.
- Be reachable from the user's browser, not only from the frontend server.
- Use HTTPS when the frontend itself is served over HTTPS.

## 5. API configuration

The application first reads `REACT_APP_API_BASE_URL` at build time.

Example `.env.local`:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:1198/api/v1
```

When the variable is absent, the source currently uses these host-based fallbacks:

| Browser hostname | Base URL |
| --- | --- |
| `localhost` or `127.0.0.1` | `http://127.0.0.1:1198/api/v1` |
| Any other hostname | `http://3.111.215.242:1198/api/v1` |

CRA embeds environment variables during `npm run build`; changing a `.env` file after building does not change an already-generated bundle. Rebuild after configuration changes.

## 6. Local development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The default development URL is `http://localhost:3000`. Ensure that the backend is running on the configured host and port before testing the status request.

## 7. Production build

```bash
npm run build
```

The optimized static output is written to `build/`. It can be served by an object-storage website, CDN, reverse proxy, or any static hosting provider.

On Windows, the project also provides:

```bash
npm run winBuild
```

This sets `GENERATE_SOURCEMAP=false` before running the CRA build.

## 8. Available scripts

| Script | Description |
| --- | --- |
| `npm start` | Starts the CRA development server |
| `npm run build` | Generates the production bundle |
| `npm run winBuild` | Generates a Windows build without source maps |
| `npm test` | Starts the CRA test runner |
| `npm run eject` | Ejects CRA configuration; irreversible for this project |

## 9. UI state model

The dashboard maintains three service states:

```text
loading  -> Checking service
online   -> Service online
offline  -> Service unavailable
```

The timestamp is stored as a `Date` object and refreshed once per second. The interval is cleared when the component unmounts.

## 10. Troubleshooting

### "Unable to reach the backend"

Check that the backend is running, the configured URL is correct, the port is reachable from the browser, and the backend's CORS policy includes the frontend origin.

### Request works locally but not after deployment

Set `REACT_APP_API_BASE_URL` to a publicly reachable API URL before running the production build. A `localhost` API URL only works on the same user's machine.

### Mixed-content error in the browser

An HTTPS page cannot safely call an HTTP API. Configure an HTTPS backend endpoint or place the API behind an HTTPS reverse proxy, then rebuild the frontend.

### Frontend loads but routes return 404

This application currently uses no client-side router. If a hosting setup adds routes later, configure its fallback behavior to serve `index.html` for application URLs.

## 11. Current limitations

- The default non-local fallback is an HTTP IP address and should be replaced with an HTTPS domain for production.
- The app performs a request on initial load and on button press; it does not continuously poll backend health.
- There is no authentication or authorization layer.
- No application-specific automated tests are currently included.
- The API base URL is a build-time setting rather than a runtime configuration file.

## 12. Maintenance guidance

Keep API configuration outside source code for each deployment environment. When changing the backend response shape, update the validation in `src/App.js` and this contract document together. Before release, run `npm run build` and verify the deployed bundle can reach the configured API from the target browser origin.
