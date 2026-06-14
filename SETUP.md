# How to Run DocuMind AI (Super Simple)

## You only need to do 2 things:

---

## Step 1 — Install Node.js

1. Go to: **https://nodejs.org**
2. Click the big green **"LTS"** button to download
3. Run the installer (just click Next → Next → Install)
4. Restart your computer after installing

---

## Step 2 — Double-click START.bat

Find the file called **`START.bat`** in this folder and double-click it.

It will:
- ✅ Install all packages automatically
- ✅ Start the backend server
- ✅ Start the frontend
- ✅ Open the app in your browser

**That's it! The app will open at http://localhost:5173**

---

## Using the App

1. **Register** — Create a free account
2. **Upload PDF** — Drag & drop any PDF file
3. **Wait** — Green "Ready" status appears (takes ~10 seconds)
4. **Click Chat** — Start asking questions!

---

## If something goes wrong

**"Node.js not found"** → Install Node.js from nodejs.org and restart PC

**App doesn't open** → Manually go to http://localhost:5173 in your browser

**"AI error"** → Check that your Gemini API key is correct in `backend/.env`

---

## Note
Data is stored in memory — it resets when you close the server.
This is the simple version. For permanent storage, MongoDB can be added later.
