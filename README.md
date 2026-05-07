<div align="center">
  <h1>🔗 DUS: Distributed URL Shortener</h1>
  <p>A high-performance, analytics-rich URL shortener built for speed and scale.</p>

  [![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-blue?style=for-the-badge)](https://dus-web.vercel.app)
  [![Tech Stack](https://img.shields.io/badge/Stack-Next.js_|_Express_|_MongoDB_|_Redis-black?style=for-the-badge)](#)
</div>

---

## ⚡ Overview

DUS (Distributed URL Shortener) is a production-ready application designed to transform long, cumbersome links into concise, shareable URLs. It goes beyond simple redirection by offering a robust analytics suite, real-time dashboard, and tiered rate-limiting.

Built as a monorepo, it seamlessly connects a snappy, animated Next.js frontend with a highly optimized Express/Node.js backend, utilizing Redis for high-speed queues and rate limiting.

## ✨ Key Features

### 🚀 Lightning Fast Redirections
- **Sub-100ms Redirects**: The core redirection engine is optimized to fetch and redirect users instantly.
- **Asynchronous Analytics**: Click tracking and GeoIP resolution are offloaded to a Redis-backed BullMQ queue, ensuring that gathering data never slows down the user's redirect experience.

### 📊 Deep Analytics Dashboard
- **Geographic Tracking**: Built-in MaxMind GeoLite2 integration resolves IPs to countries instantly.
- **Device & Browser Insights**: Detailed breakdowns of what platforms your audience uses.
- **Interactive Visualizations**: Beautiful, animated charts powered by Recharts give you an at-a-glance understanding of your traffic.

### 🛡️ Enterprise-Grade Security & Abuse Prevention
- **Tiered Rate Limiting**: Intelligent rate limiting utilizing Redis token buckets. Protects against spam while offering different tiers (Anonymous, Free, Pro).
- **Asymmetric JWT Authentication**: Secure user sessions powered by RS256 keypairs.
- **Privacy-First**: IP addresses are uniquely hashed before storage, allowing for unique visitor tracking without storing raw PII.

### 🎨 "Pro-Max" Aesthetic Frontend
- **Fluid Animations**: Utilizing Framer Motion for highly polished micro-interactions and page transitions.
- **Responsive Data Tables**: Optimistic UI updates ensure that creating or deleting URLs feels instantaneous.

## 🛠️ Technology Stack

**Frontend (Client)**
* Next.js 15 (App Router)
* Tailwind CSS v4 & Radix UI
* React Query (Server State) & Zustand (Client State)
* Recharts & Framer Motion

**Backend (API)**
* Node.js & Express (TypeScript)
* MongoDB (Mongoose)
* Redis (Upstash) & BullMQ (Background Jobs)
* Zod (Schema Validation)
* Jest (Testing)

## 🚦 Usage

1. **Sign Up / Log In**: Create an account to access the dashboard.
2. **Shorten**: Paste any valid URL into the input field.
3. **Share**: Copy your new `dus.vercel.app/xxxxx` link.
4. **Track**: Monitor clicks, locations, and devices in real-time from your dashboard.

## 🏗️ Architecture Highlight: The "Fast Path"

The most critical component of a URL shortener is the redirect speed. DUS achieves this by separating the redirect from the analytics:

1. Request hits `/:shortCode`.
2. Database is queried for the original URL.
3. **API sends `302 Found` to the user immediately.**
4. *Simultaneously*, the API drops a payload (User-Agent, IP) into a Redis Queue.
5. A background worker picks up the job, resolves the GeoIP, and updates the analytics database.

This guarantees that complex data processing never blocks the user from reaching their destination.

---
<div align="center">
  <i>Built with focus on performance, aesthetics, and developer experience.</i>
</div>
