# Security Demonstration Instructions

This demonstrates the path traversal vulnerability in the documents API.

## Step 1: Get your credentials

1. Open your app in a browser (e.g. `https://app.loomora.ch`)
2. **Log in** as a user with document access
3. **Open DevTools** (F12) → **Application** tab → **Local Storage**
4. Copy the value of `auth_token` (your JWT)

## Step 2: Get a document ID

1. Go to **Documents** in the app
2. **Create a new document** (upload any file) — or open an existing one
3. When viewing the document, check the URL: `/documents/clxxxxxxxxxxxx` or similar
4. Copy the document ID (the part after `/documents/`)

## Step 3: Run the demo script

Open a terminal in the project folder and run:

```bash
node security-demo.js https://app.loomora.ch/api YOUR_JWT_TOKEN YOUR_DOCUMENT_ID
```

**Replace:**
- `https://app.loomora.ch/api` — your API base URL (no trailing slash)
- `YOUR_JWT_TOKEN` — the `auth_token` from Step 1
- `YOUR_DOCUMENT_ID` — the document ID from Step 2

### Example:

```bash
node security-demo.js https://app.loomora.ch/api eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... clx1abc2def3ghi4
```

## Step 4: Get database access

If the vulnerability works, the script will:

1. Print the contents of the server's `.env` file
2. Extract `DATABASE_URL`
3. Show you the `psql` command to connect

**Connect to the database:**

```bash
psql "postgresql://user:password@host:5432/database"
```

Use the exact `DATABASE_URL` value from the script output.

---

## For local testing

If testing against `localhost:3001`:

```bash
node security-demo.js http://localhost:3001/api YOUR_JWT YOUR_DOC_ID
```

The script tries several common paths; on localhost it may use `./backend/.env`.
