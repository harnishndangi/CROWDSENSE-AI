# CrowdSense Deployment Guide

This guide provides instructions for deploying the **CrowdSense** platform to production using **Render** (Backend) and **Vercel** (Frontend).

---

## 🚀 Backend Deployment (Render)

The backend is a FastAPI application. We use `render.yaml` for automated configuration.

### 1. Source Control
Push your code to a GitHub/GitLab repository.

### 2. Connect to Render
1.  Go to [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** and select **Blueprint**.
3.  Connect your repository. Render will automatically detect `render.yaml`.
4.  It will identify two services (or just the `crowdsense-backend` if you only want the API).

### 3. Environment Variables (IMPORTANT)
Set the following in the Render dashboard:
- `SUPABASE_URL`: Your Supabase Project URL.
- `SUPABASE_KEY`: Your Supabase Service Role Key.
- `OPENROUTER_API_KEY`: For AI reasoning.
- `TIDE_API_KEY`: Storm Glass or similar.
- `WEATHER_API_KEY`: VisualCrossing or OpenWeather.
- `AQI_API_KEY`: WAQI/IQAir.
- `CROWDSENSE_ENTERPRISE_KEY_2026`: Standard API key (keep secure).

---

## 🎨 Frontend Deployment (Vercel)

The frontend is a Next.js application located in the `/frontend` directory.

### 1. Connect to Vercel
1.  Go to [Vercel](https://vercel.com/new).
2.  Import your repository.
3.  **Root Directory**: Change this to `frontend`.
4.  **Framework Preset**: Next.js.

### 2. Environment Variables
Add these in the Vercel project settings:
- `NEXT_PUBLIC_API_URL`: https://crowdsense-ai-es1r.onrender.com
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Required for the Live Map feature.

---

## 🛠 Project Structure Optimization

The project is structured as a clear mono-repo:

- `/frontend`: Next.js Web App.
- `/backend`: FastAPI API Server.
- `render.yaml`: Infrastructure as Code for Render.
- `DEPLOYMENT.md`: This guide.

---

## ✅ Deployment Checklist

- [ ] Backend is running and reachable via HTTPS.
- [ ] `NEXT_PUBLIC_API_URL` updated in Vercel to point to Render's URL.
- [ ] CORS in `backend/main.py` allows your Vercel domain.
- [ ] Supabase tables (`crowd_alerts`, `commuter_queries`) are initialized.
- [ ] Google Maps API has the "Maps JavaScript API" enabled and billing active.
