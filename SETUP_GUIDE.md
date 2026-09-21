# DocuCare — Complete Setup Guide (Beginner Friendly)

This walks through everything from a completely empty computer to a running app. Follow it top to bottom,
in order — don't skip ahead. Each step says exactly what to type and what you should see.

---

## Part 1 — Install the tools you need

You need three things installed on your computer before touching the project files.

### 1. Node.js (runs both the backend and frontend)

1. Go to **https://nodejs.org**.
2. Download the **LTS** version (not "Current") — as of now that's Node 20 or 22. Either works for this project.
3. Run the installer, click through with defaults.
4. Verify it worked — open a terminal (Command Prompt, PowerShell, or Terminal on Mac) and run:
   ```
   node -v
   npm -v
   ```
   You should see version numbers (e.g. `v20.11.0` and `10.2.4`). If you get "command not found", restart your
   terminal/computer and try again — Node adds itself to your system PATH during install but sometimes needs a
   restart to take effect.

### 2. MySQL Server (the actual database engine)

**Important distinction**: MySQL Workbench, which you already have, is just a *visual tool* for looking at and
querying a database — it is not the database itself. You also need **MySQL Server** running in the background.
If you installed MySQL via the normal MySQL Installer for Windows (or `brew install mysql` on Mac, or your
Linux package manager), the server was very likely installed alongside Workbench. If you're not sure:

1. Open MySQL Workbench.
2. Look at the home screen under "MySQL Connections". If you see an entry like "Local instance MySQL80" and
   double-clicking it successfully connects (asking for a password), the server is installed and running —
   skip to Part 2.
3. If there's no connection, or it fails to connect, you need to install MySQL Server:
   - **Windows**: download the "MySQL Installer" from https://dev.mysql.com/downloads/installer/, run it, and
     choose the "Server only" or "Full" setup type. During setup it will ask you to set a **root password** —
     write this down, you'll need it.
   - **Mac**: `brew install mysql` then `brew services start mysql` (requires Homebrew — https://brew.sh).
   - **Linux**: `sudo apt install mysql-server` (Ubuntu/Debian) then `sudo systemctl start mysql`.
4. Once installed, open MySQL Workbench again and connect using the root password you set. You should land on
   a screen with a SQL editor and a "SCHEMAS" panel on the left.

### 3. A code editor (optional but recommended)

Not strictly required — you can edit `.env` files with Notepad — but **VS Code** (https://code.visualstudio.com)
makes everything easier if you want to look at any file.

---

## Part 2 — Get the project files ready

1. Unzip the `docucare.zip` file you downloaded somewhere easy to find, e.g. your Desktop or Documents folder.
   You'll end up with a `docucare` folder containing two subfolders: `backend` and `frontend`.
2. Open a terminal and navigate into it. Example (adjust the path to wherever you unzipped it):
   ```
   cd Desktop/docucare
   ```
   From here on, "the project folder" means this `docucare` folder.

---

## Part 3 — Set up the database in MySQL Workbench

1. Open MySQL Workbench, connect to your local server (double-click your connection, enter the root password).
2. In the left "Navigator" panel, right-click under **SCHEMAS** → **Create Schema**.
3. Name it `docucare`, leave the charset as the default (`utf8mb4`), click **Apply**, then **Apply** again on
   the confirmation screen, then **Finish**.
4. You now have an empty database named `docucare`. You don't need to create any tables by hand — the backend
   will do that automatically in Part 5.
5. (Optional, recommended for real use, skippable while you're just trying things out) Create a dedicated
   database user instead of using root everywhere: go to the **Administration** tab → **Users and Privileges**
   → **Add Account**. Set a username (e.g. `docucare_app`) and password, then under **Schema Privileges** click
   **Add Entry**, select the `docucare` schema, and check **Select All** to grant it full access. Click
   **Apply**. If you skip this, you'll just use `root` and its password instead.

---

## Part 4 — Backend: install dependencies

The backend is a NestJS (Node.js) application. Everything it needs is listed in `backend/package.json` and
gets installed with one command.

1. In your terminal, move into the backend folder:
   ```
   cd backend
   ```
2. Install everything:
   ```
   npm install
   ```
   This downloads every package listed below into a `node_modules` folder. It can take a minute or two the
   first time.

### What gets installed and why (backend)

| Package | What it's for |
|---|---|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | The NestJS framework itself — routing, dependency injection, the HTTP server |
| `@nestjs/config` | Loads your `.env` file into the app |
| `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` | Login tokens (JWT) — how the app knows who's logged in |
| `@prisma/client`, `prisma` | Talks to the MySQL database using the schema in `prisma/schema.prisma`, without you writing raw SQL |
| `groq-sdk` | Talks to Groq's AI API for the symptom-checker chat |
| `bcrypt` | Securely hashes passwords (so plain-text passwords are never stored) |
| `class-validator`, `class-transformer` | Validates incoming API request data (e.g. rejects a signup with no email) |
| `reflect-metadata`, `rxjs` | Internal plumbing NestJS needs to function |
| `ts-node`, `typescript` | Lets the project run/compile TypeScript code |
| `@nestjs/cli` | Command-line tool used to build/run the Nest app |

You don't need to install these one by one — `npm install` reads `package.json` and gets all of them
automatically. The table is just so you know what's actually running under the hood.

---

## Part 5 — Backend: configure and connect to the database

1. Still inside the `backend` folder, make a copy of the example environment file:
   - **Mac/Linux**: `cp .env.example .env`
   - **Windows (PowerShell)**: `copy .env.example .env`
2. Open the new `.env` file in a text editor. You'll see:
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/docucare"
   JWT_SECRET="change-me"
   JWT_EXPIRES_IN="1d"
   ENCRYPTION_KEY="replace-with-64-char-hex-string"
   PORT=4000
   CORS_ORIGIN="http://localhost:5173"
   ```
3. **Fix `DATABASE_URL`** — replace `user`, `password`, and confirm the database name matches what you created:
   ```
   DATABASE_URL="mysql://root:YOUR_ROOT_PASSWORD@localhost:3306/docucare"
   ```
   (Or use `docucare_app` and its password if you made a dedicated user in Part 3.) If your password contains
   special characters like `@`, `#`, or `:`, they need to be URL-encoded (e.g. `@` becomes `%40`) — simplest fix
   is to just use a password without special characters for this local setup.
4. **Fix `JWT_SECRET`** — replace `"change-me"` with any long random string, e.g. `"a-random-string-nobody-will-guess-12345"`.
5. **Fix `ENCRYPTION_KEY`** — this must be exactly a 64-character hex string. Generate one:
   - **Mac/Linux**: run `openssl rand -hex 32` in your terminal and paste the output.
   - **Windows without openssl**: run this instead in PowerShell:
     ```
     -join ((1..64) | ForEach-Object { '0123456789abcdef'[(Get-Random -Maximum 16)] })
     ```
   Paste whichever result you get in place of `replace-with-64-char-hex-string`.
6. Leave `PORT` and `CORS_ORIGIN` as they are.
7. Save the file.

### Create the actual database tables

Prisma reads `prisma/schema.prisma` and creates every table for you — you never write `CREATE TABLE` yourself.

```
npm run prisma:migrate
```

It will ask you to name the migration — type something like `init` and press Enter. If this succeeds, go back
to MySQL Workbench, right-click the `docucare` schema → **Refresh All**, and you'll see a full list of tables
(`User`, `Appointment`, `CmsPage`, etc.) that appeared automatically.

**If this step fails** with a network/checksum error, it usually means Prisma couldn't download its internal
engine binary — check your internet connection and try again. If it fails with an access-denied error, your
`DATABASE_URL` username/password is wrong — double check Part 3 and step 3 above.

### Fill in starter content

```
npm run prisma:seed
```

This creates:
- One **admin account**: `admin@docucare.local` / `ChangeMe123!` (change this password after logging in, via
  the Account page — see Part 8).
- Starter text for the Home, About, and Contact pages, so the site isn't blank on first load.

---

## Part 6 — Backend: start the server

```
npm run dev
```

You should see:
```
DocuCare API running on http://localhost:4000
```

Leave this terminal window open and running. Open a **second** terminal for the frontend — don't close this one.

---

## Part 7 — Frontend: install and configure

1. Open a new terminal window/tab. Navigate to the frontend folder (adjust the path):
   ```
   cd Desktop/docucare/frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```

### What gets installed and why (frontend)

| Package | What it's for |
|---|---|
| `react`, `react-dom` | The React library itself |
| `react-router-dom` | Handles page navigation (`/`, `/login`, `/patient`, etc.) without full page reloads |
| `lucide-react` | The icon set used throughout the design (buttons, badges, etc.) |
| `framer-motion` | Available for animations (included per the original design brief) |
| `@jitsi/react-sdk` | Embeds the video call widget for consultations |
| `vite`, `@vitejs/plugin-react` | The build tool that runs the dev server and bundles the app |
| `typescript` | Type-checking during development |
| `tailwindcss`, `postcss`, `autoprefixer` | The styling system — this is where the custom color palette lives |

3. Set up the environment file:
   - **Mac/Linux**: `cp .env.example .env`
   - **Windows**: `copy .env.example .env`
   The default value (`VITE_API_URL=/api`) is already correct — the frontend automatically forwards API
   requests to your backend on port 4000. You don't need to change anything here.

---

## Part 8 — Frontend: run it and try the app

```
npm run dev
```

You'll see something like:
```
Local:   http://localhost:5173/
```

Open that URL in your browser. With the backend still running in the other terminal, you should see the real
Home page (hero, features, testimonials, FAQ) instead of a blank loading screen.

### A sensible first walkthrough

1. Click **Log in**, sign in with `admin@docucare.local` / `ChangeMe123!`.
2. Go to your **Account** page (gear icon in the nav bar) and change that password immediately.
3. Go to the **Admin dashboard** → **AI Settings** tab. Paste in a Groq API key if you have one (free ones are
   available at **https://console.groq.com** → API Keys) and click **Test Connection**. Without this key, the
   AI symptom-checker chat won't work, but everything else will.
4. Log out, click **Register**, create a test **Patient** account — you're logged in immediately.
5. Try the AI Triage chat on the Patient dashboard (needs the Groq key from step 3).
6. Log out, register a test **Doctor** account (you'll need to make up a specialty and license number) — note
   it says your account is pending approval and does **not** log you in.
7. Log back in as admin, go to **Doctor Approvals**, approve that doctor.
8. Log in as the doctor, add an availability slot under **My Availability**.
9. Log back in as the patient, book that slot, then log in as the doctor again to accept it from the
   **Appointment Queue**.

That exercises essentially the entire application end to end.

---

## Troubleshooting quick reference

| Problem | Likely cause |
|---|---|
| `npm install` fails | Check your internet connection; try deleting `node_modules` and `package-lock.json` and running it again |
| Backend won't start, mentions `DATABASE_URL` | Your `.env` file is missing or the connection string is wrong — recheck Part 5 |
| `prisma:migrate` fails with access denied | Wrong MySQL username/password in `DATABASE_URL` |
| Frontend loads but Home page spins forever | Backend isn't running, or crashed — check its terminal window for errors |
| "Port already in use" | Something else is using port 4000 or 5173 — close other terminal windows running this project, or restart your computer |
| AI chat says "not configured" | You haven't added a Groq API key yet — see step 3 of the walkthrough above |

