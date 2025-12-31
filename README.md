# 🏋️ GymPro - Gym Management System

A modern, full-stack gym management system designed for gym owners and administrators. Features member management, automated expiry notifications, broadcast messaging, and a responsive dashboard.

![Tech Stack](https://img.shields.io/badge/Django-6.0-green?logo=django)
![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Tailwind-3.4-cyan?logo=tailwindcss)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [License](#-license)

---

## ✨ Features

- **🔐 Admin Authentication** - Secure owner-only access
- **👥 Member Management** - Full CRUD for gym members
- **📊 Dashboard** - Real-time statistics and insights
- **🔔 Smart Notifications** - Automated membership expiry alerts
- **📱 Broadcast Messaging** - Send announcements to all members
- **📲 Responsive Design** - Works on mobile, tablet, and desktop
- **🌙 Modern UI** - Clean, professional interface with animations

---

## 🛠 Tech Stack

### Backend
- **Framework:** Django 6.0, Django REST Framework
- **Database:** PostgreSQL (Supabase cloud)
- **Authentication:** Token-based auth
- **CORS:** django-cors-headers
- **Scheduling:** django-crontab

### Frontend
- **Framework:** React 19 (Create React App)
- **Styling:** Tailwind CSS 3.4
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

---

## 📁 Project Structure

```
gym-management/
├── backend/                  # Django backend
│   ├── gymbackend/          # Django project settings
│   │   ├── settings.py      # Main configuration
│   │   ├── urls.py          # Root URL routing
│   │   └── wsgi.py          # WSGI application
│   ├── members/             # Members app (CRUD, API)
│   ├── notifications/       # Notification system
│   ├── manage.py            # Django CLI
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
├── frontend/                 # React frontend
│   ├── public/              # Static assets
│   │   └── _redirects       # Netlify SPA routing
│   ├── src/
│   │   ├── api/             # Axios configuration
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   └── App.js           # Root component
│   ├── package.json         # Node dependencies
│   ├── netlify.toml         # Netlify configuration
│   └── .env.example         # Environment template
│
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

---

## 📦 Prerequisites

- **Node.js** 20 LTS or higher
- **Python** 3.10 or higher
- **PostgreSQL** 16 (or Supabase account)
- **Git**

---

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gym-management.git
cd gym-management
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run at: `http://127.0.0.1:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env if needed (default points to localhost:8000)

# Start development server
npm start
```

Frontend will run at: `http://localhost:3000`

### 4. Login

Default admin credentials (if you used the provided seed data):
- **Username:** admin
- **Password:** admin123

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_NAME` | Database name | `postgres` |
| `DB_USER` | Database user | `postgres.xxxxx` |
| `DB_PASSWORD` | Database password | `your_password` |
| `DB_HOST` | Database host | `db.xxxxx.supabase.co` |
| `DB_PORT` | Database port | `5432` |
| `DB_SSL_MODE` | SSL mode | `require` |
| `DJANGO_SECRET_KEY` | Django secret key | `random-string` |
| `DEBUG` | Debug mode | `True` or `False` |
| `ALLOWED_HOSTS` | Allowed domains | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` |
| `NOTIFICATION_PROVIDER` | SMS provider | `mock` |
| `GYM_NAME` | Gym name | `FitZone Gym` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `http://127.0.0.1:8000/` |

---

## 🌐 Deployment

### Frontend (Netlify)

1. **Push to GitHub**
2. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   
3. **Configure Build Settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
   
4. **Set Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add: `REACT_APP_API_BASE_URL` = `https://your-backend-url.com/`

5. **Deploy!**

### Backend

The backend can be deployed to:
- **Railway** (recommended)
- **Render**
- **Heroku**
- **DigitalOcean App Platform**
- **AWS/GCP/Azure**

Remember to:
1. Set all environment variables
2. Update `ALLOWED_HOSTS` with your domain
3. Update `CORS_ALLOWED_ORIGINS` with your Netlify URL
4. Set `DEBUG=False` in production
5. Generate a new `DJANGO_SECRET_KEY`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/login/` | Admin login |
| `POST` | `/api/logout/` | Admin logout |
| `GET` | `/api/csrf/` | Get CSRF token |
| `GET` | `/api/dashboard/` | Dashboard stats |
| `GET` | `/api/members/` | List all members |
| `POST` | `/api/members/` | Create member |
| `GET` | `/api/members/{id}/` | Get member |
| `PUT` | `/api/members/{id}/` | Update member |
| `DELETE` | `/api/members/{id}/` | Delete member |
| `POST` | `/api/broadcast/` | Send broadcast |
| `GET` | `/api/notifications/expiring/` | Expiring members |
| `POST` | `/api/notifications/send-reminder/` | Send reminder |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built with ❤️ for gym owners who want a simple, modern management solution.

---

<p align="center">
  <strong>⭐ Star this repo if you find it helpful!</strong>
</p>
