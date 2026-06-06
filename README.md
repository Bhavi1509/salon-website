# Glow & Grace Salon — Full Stack Management System

A production-ready beauty salon management system with a luxury public website, user booking portal, and admin dashboard.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | HTML5, CSS3, JavaScript, Bootstrap 5 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Email | Nodemailer |
| Reports | PDFKit |

## Project Structure

```
salon website/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, upload, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── seed/            # Sample database seeder
│   ├── utils/           # Token, email utilities
│   ├── uploads/         # Uploaded gallery images
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── css/             # Main + dashboard styles
│   ├── js/              # API client, auth, dashboards
│   ├── user/            # User dashboard & booking
│   ├── admin/           # Admin panel pages
│   ├── index.html       # Public pages
│   ├── netlify.toml     # Netlify config
│   └── vercel.json      # Vercel config
└── README.md
```

## Features

### Public Website
- Luxury hero section with CTAs
- Featured services, testimonials carousel, gallery preview
- About page (story, mission, vision, team)
- Services page with filtering (8 services)
- Gallery with category filters
- Contact form with Google Maps

### User Module
- Registration & login with JWT
- Forgot / reset password
- Profile management
- Multi-step appointment booking
- Appointment history with search & filter
- Cancel appointments
- Real-time notifications
- Email confirmation on booking

### Admin Module
- Separate admin login
- Dashboard with stats & revenue
- Appointment management (approve, reject, reschedule)
- Service CRUD
- User management
- Gallery management
- CMS for home & contact content
- PDF appointment report download

### Security
- JWT authentication
- bcrypt password hashing (12 rounds)
- Role-based access control (user / admin / owner)
- Protected API routes
- Form validation
- Global error handling

### UI/UX
- Premium gold luxury theme
- Dark & light mode toggle
- Smooth scroll animations
- Fully responsive mobile-first design

---

## Step-by-Step Setup (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- A code editor (VS Code recommended)
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension (optional, for frontend)

### Step 1: Clone / Open Project

```bash
cd "salon website"
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/glow-grace-salon
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://127.0.0.1:5500
ADMIN_EMAIL=admin@glowgrace.com
ADMIN_PASSWORD=Admin@123456
```

> For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### Step 3: Seed Sample Data

```bash
npm run seed
```

This creates:
- **Admin account:** `admin@glowgrace.com` / `Admin@123456`
- 8 salon services
- 10 gallery images
- CMS content (home, about, contact)

### Step 4: Start Backend Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

API runs at: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

### Step 5: Start Frontend

Open the `frontend` folder with Live Server, or use any static file server:

```bash
# Option A: VS Code Live Server
# Right-click frontend/index.html → "Open with Live Server"

# Option B: npx serve
cd frontend
npx serve .
```

Frontend runs at: `http://127.0.0.1:5500` (or port shown by your server)

### Step 6: Verify Everything Works

1. Open `http://127.0.0.1:5500` — public website loads
2. Register a new user account
3. Book an appointment from the user dashboard
4. Login as admin at `/admin/login.html`
5. Approve the appointment from admin panel

---

## API Endpoints

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/admin/login` | Public |
| POST | `/api/auth/forgot-password` | Public |
| PUT | `/api/auth/reset-password/:token` | Public |
| GET | `/api/auth/me` | Private |

### Services
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/services` | Public |
| GET | `/api/services/:id` | Public |
| POST | `/api/services` | Admin |
| PUT | `/api/services/:id` | Admin |
| DELETE | `/api/services/:id` | Admin |

### Appointments
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/appointments/slots` | Public |
| POST | `/api/appointments` | User |
| GET | `/api/appointments/my` | User |
| PUT | `/api/appointments/:id/cancel` | User |
| GET | `/api/appointments` | Admin |
| GET | `/api/appointments/stats` | Admin |
| PUT | `/api/appointments/:id/status` | Admin |
| PUT | `/api/appointments/:id/reschedule` | Admin |
| GET | `/api/appointments/report/download` | Admin |

### Other
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/gallery` | Public |
| POST | `/api/content/contact` | Public |
| GET | `/api/content/:section` | Public |
| GET | `/api/notifications` | User |
| GET/PUT/DELETE | `/api/users/*` | Admin |

---

## Deployment

### Backend — Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repository, set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables from `.env.example`
5. Set `MONGODB_URI` to your MongoDB Atlas connection string
6. Set `FRONTEND_URL` to your deployed frontend URL
7. Deploy and note your URL: `https://glow-grace-api.onrender.com`

After deploy, run seed once via Render Shell:
```bash
npm run seed
```

### Frontend — Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Set:
   - **Base directory:** `frontend`
   - **Publish directory:** `frontend` (or `.`)
3. Update `frontend/js/config.js`:
   ```javascript
   API_BASE_URL: 'https://your-backend.onrender.com/api'
   ```
4. Update `frontend/netlify.toml` redirect URL to your Render backend
5. Deploy

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → **Import Project**
2. Set **Root Directory** to `frontend`
3. Update `frontend/js/config.js` with your Render API URL
4. Update `frontend/vercel.json` rewrite destination
5. Deploy

### MongoDB Atlas (Production Database)

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user and whitelist IP `0.0.0.0/0` (all IPs)
3. Copy connection string → set as `MONGODB_URI` on Render
4. Run `npm run seed` to populate data

### Email Setup (Optional)

For booking confirmation emails, configure Gmail App Password:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=Glow & Grace Salon <noreply@glowgrace.com>
```

Without email config, the system logs emails to console (mock mode).

---

**Deployment — Vercel (frontend) + Render (backend) + MongoDB Atlas**

1. Push your repository to GitHub and ensure `main` (or chosen branch) is up to date.

2. MongoDB Atlas
- Create an Atlas cluster and a database user.
- Whitelist IPs (for testing you can add 0.0.0.0/0) and copy the connection string.
- Create a database named `glow-grace-salon` or use the connection string database segment.

3. Render — Backend
- Go to https://render.com and create a new **Web Service**.
- Connect your GitHub repo and choose branch `main`.
- Set **Root Directory** to `backend`.
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables (see list below). Use the Atlas connection string for `MONGODB_URI`.

4. Vercel — Frontend
- Go to https://vercel.com and import the project.
- Set the Root Directory to `frontend`.
- In Project Settings → Environment Variables add:
   - `BACKEND_URL` = `https://<your-render-service>.onrender.com` (no trailing `/`)
- Deploy. Vercel will run `npm run build` (configured by `frontend/package.json`) which injects `BACKEND_URL` into `dist/js/config.js`.

5. Seed data (once backend is deployed)
- Open the Render shell for your backend service or use a temporary local run with `MONGODB_URI` pointed at Atlas, then run:
   ```bash
   cd backend
   npm run seed
   ```

6. Verify
- Frontend: `https://<your-vercel-project>.vercel.app`
- Backend: `https://<your-render-service>.onrender.com`
- Confirm API calls work and the site can create appointments.

Recommended Environment Variables (set these on Render and Vercel as appropriate)

- Backend (`Render` service environment variables):
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — strong secret for JWT
   - `NODE_ENV` — `production`
   - `FRONTEND_URL` — your Vercel frontend URL
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` — SMTP settings (optional)

- Frontend (`Vercel` project environment variables):
   - `BACKEND_URL` — `https://<your-render-service>.onrender.com`

Notes
- The `frontend/build-script.js` replaces the placeholder backend URL in `js/config.js` during the Vercel build using the `BACKEND_URL` env var.
- If you prefer to proxy `/api` through Vercel, update `frontend/vercel.json` `routes` entry to point to your Render URL.


---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@glowgrace.com | Admin@123456 |

> Change admin password immediately in production.

---

## Database Collections

| Collection | Description |
|------------|-------------|
| `users` | Registered customers |
| `admins` | Admin/owner accounts |
| `services` | Salon services & pricing |
| `appointments` | Booking records |
| `galleries` | Gallery images |
| `notifications` | User notifications |
| `contents` | CMS page content |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure `FRONTEND_URL` in `.env` matches your frontend URL exactly |
| MongoDB connection failed | Check `MONGODB_URI`, ensure MongoDB is running or Atlas IP is whitelisted |
| Services not loading | Start backend server, run `npm run seed` |
| 401 Unauthorized | Token expired — log in again |
| Email not sending | Configure SMTP in `.env` or check console for mock logs |

---

## License

MIT License — Glow & Grace Salon © 2025
