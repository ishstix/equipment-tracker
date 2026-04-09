# Equipment Tracker — Setup Guide

## What you need before starting
- [Node.js](https://nodejs.org) (v18 or later) installed on your Mac
- A free [Supabase](https://supabase.com) account
- Your Ionos email address and password

---

## Step 1 — Set up Supabase (your cloud database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, give it a name (e.g. "equipment-tracker"), and create it
3. Once it loads, go to **SQL Editor** (left sidebar)
4. Open the file `supabase/schema.sql` from this project, paste the entire contents into the SQL editor, and click **Run**
5. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (click "Reveal" to see it)

---

## Step 2 — Configure environment variables

1. In the project folder, copy the example file:
   ```
   cp .env.local.example .env.local
   ```
2. Open `.env.local` in any text editor and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

EMAIL_USER=you@yourdomain.com        ← your Ionos email address
EMAIL_PASS=your-ionos-password       ← your Ionos email password
ADMIN_EMAIL=you@yourdomain.com       ← where to receive checkout notifications

ADMIN_SECRET=pick-any-password       ← password you'll use to log into /admin
```

---

## Step 3 — Install and run on your Mac

Open Terminal, navigate to this folder, and run:

```bash
cd ~/Documents/tracker
npm install
npm run dev
```

Then open your browser and go to:
- **Public page** (what your users see): http://localhost:3000
- **Admin dashboard**: http://localhost:3000/admin

---

## Step 4 — Add your inventory

1. Go to http://localhost:3000/admin
2. Log in with the `ADMIN_SECRET` password you set
3. Click **Add Equipment** and start adding your gear

---

## Step 5 — Deploy to your website (optional)

The easiest way is [Vercel](https://vercel.com) (free):

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com), connect your GitHub, and import the repo
3. In the Vercel project settings, go to **Environment Variables** and add all the same variables from your `.env.local` file
4. Click **Deploy** — your app will be live at a `.vercel.app` URL (you can also connect your own domain)

---

## Daily usage

### Running locally on your Mac
Each time you want to use the app on your Mac, open Terminal and run:
```bash
cd ~/Documents/tracker
npm run dev
```
Then go to http://localhost:3000/admin

To make this easier, you can create a simple shell script:
```bash
echo '#!/bin/bash\ncd ~/Documents/tracker && npm run dev' > ~/Desktop/StartTracker.command
chmod +x ~/Desktop/StartTracker.command
```
Then just double-click **StartTracker.command** on your Desktop.

### How checkout requests work
1. Someone visits your public URL, browses equipment, and adds items to their cart
2. They fill in their name, email, and due-back date, then submit
3. **You receive an email** at your admin address with the full list
4. **They receive a confirmation email** with their request summary
5. You go to `/admin` → **Checkout Requests** to manage active checkouts
6. When equipment comes back, click **Mark All Returned** (or mark individual items)

---

## Importing your existing inventory

If you have a spreadsheet of your equipment, you can either:
1. Add items one by one through the admin panel
2. Or share the file and we can write a quick import script

---

## Features summary

| Feature | Where |
|---|---|
| Browse available equipment | `/` (public) |
| Cart + checkout request form | `/` → Add to Cart → Submit |
| Confirmation emails (you + requester) | Automatic on submit |
| Add / edit / delete equipment | `/admin` → Equipment tab |
| Update condition (good/needs repair/out of service) | `/admin` → Equipment tab (dropdown) |
| View & manage checkout requests | `/admin` → Checkout Requests tab |
| Mark items returned | `/admin` → expand a request |
| Filter by status (active/overdue/returned) | `/admin` → Checkout Requests tab |
