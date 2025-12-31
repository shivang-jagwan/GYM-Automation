# Backend Setup (Django)

## Requirements
- Python 3.10+
- Node.js 20 LTS (for frontend)
- PostgreSQL 16

## Environment Variables (.env)
Create a `.env` file in the `backend` folder with:

```
DB_NAME=gymdb
DB_USER=gymuser
DB_PASSWORD=shivang
DB_HOST=localhost
DB_PORT=5432
```

## Setup Steps
1. Create and activate a Python virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```
2. Install dependencies:
   ```
   pip install django djangorestframework psycopg2-binary python-dotenv django-crontab
   ```
3. Run migrations:
   ```
   python manage.py migrate
   ```
4. Create superuser (owner login):
   ```
   python manage.py createsuperuser
   ```
5. Start server:
   ```
   python manage.py runserver
   ```

## Notes
- All DB credentials are loaded from `.env` (never hardcoded).
- See code comments for SMS API integration and deployment notes.
