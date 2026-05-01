# GRIND — Healthy Habit Tracker 🏋️

A competition-style habit tracker for you and your crew. Track daily habits, earn points, and compete on the leaderboard before your trip!

## What You're Tracking (1 point each, 5 max/day)
- 💧 Water Intake
- 🥩 Protein Intake
- 🏋️ Daily Workout
- 🏃 Daily Cardio
- 😴 7+ Hours of Sleep

---

## 🚀 Deploy in 4 Steps (all free!)

### Step 1: Set Up the Database (Turso — free tier)

1. Go to [turso.tech](https://turso.tech) and sign up (GitHub login works)
2. Install the Turso CLI:
   ```bash
   # Mac
   brew install tursodatabase/tap/turso

   # Windows/Linux
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
3. Log in: `turso auth login`
4. Create your database:
   ```bash
   turso db create habit-tracker
   ```
5. Get your credentials:
   ```bash
   # Get the URL
   turso db show habit-tracker --url

   # Create an auth token
   turso db tokens create habit-tracker
   ```
6. Save both values — you'll need them in Step 3.

### Step 2: Push Code to GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository (name it `habit-tracker`)
2. On your computer, open a terminal and run:
   ```bash
   cd habit-tracker
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/habit-tracker.git
   git push -u origin main
   ```

### Step 3: Deploy to Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **"Add New Project"** → Import your `habit-tracker` repo
3. Before clicking Deploy, expand **"Environment Variables"** and add:
   | Variable | Value |
   |---|---|
   | `TURSO_DATABASE_URL` | `libsql://your-db-name...` (from Step 1) |
   | `TURSO_AUTH_TOKEN` | `your-token...` (from Step 1) |
   | `JWT_SECRET` | Any random string (e.g. `my-super-secret-key-2025!`) |
4. Click **Deploy** — wait ~60 seconds

### Step 4: Set Up the Database Tables

After deploying, run this once from your local machine:
```bash
# Create a .env.local file with your Turso credentials
cp .env.example .env.local
# Edit .env.local and paste your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN

# Install dependencies and run setup
npm install
npm run db:setup
```

You should see "Database setup complete!" — that's it, you're live! 🎉

---

## 📱 How to Use

1. Share your Vercel URL with your crew (e.g., `habit-tracker-yourname.vercel.app`)
2. Each person creates an account (just username + password)
3. Every day, check off the habits you completed and hit **Submit**
4. Check the **Leaderboard** to see who's leading!

You can update your check-in at any time during the day — it overwrites your previous entry for that day.

---

## 🛠 Local Development

```bash
npm install
cp .env.example .env.local
# Fill in your Turso credentials in .env.local
npm run db:setup
npm run dev
```

Open [localhost:3000](http://localhost:3000) to see the app.

---

## 💰 Cost

**$0/month** for your group size:
- **Vercel** free tier: Handles hobby projects easily
- **Turso** free tier: 500 databases, 9GB storage, 25M row reads/month
- No credit card required for either

---

## Tech Stack
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Database**: Turso (SQLite on the edge)
- **Auth**: JWT tokens with bcrypt password hashing
- **Hosting**: Vercel
