# TicketsAnywhere Backend

Django REST API for the TicketsAnywhere event-discovery and ticket-ordering platform. It serves the public event catalogue, authenticates customers with JWT, creates ticket orders, and provides staff-only management operations for events, banners, categories, orders, and ticket fulfilment.

## Core capabilities

- Customer registration, email verification, login, and password reset using one-time codes
- JWT access and refresh tokens
- Public event, category, and banner endpoints
- Authenticated ticket and order creation
- Customer-scoped order and ticket access
- Staff-only content management and ticket status transitions
- Cloudinary-backed media storage
- SQLite for local development and PostgreSQL through `DATABASE_URL`

## Tech stack

- Python 3.12+
- Django 5.2
- Django REST Framework
- Simple JWT
- PostgreSQL / SQLite
- Cloudinary
- Gunicorn

## Local setup

```bash
git clone https://github.com/Khant26/TicketsAnywhere_Backend.git
cd TicketsAnywhere_Backend
python -m venv .venv
```

Activate the virtual environment, then run:

```bash
python -m pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Generate a unique `DJANGO_SECRET_KEY` before deploying. Leaving `DATABASE_URL` empty uses a local SQLite database.

## Verification

```bash
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

The test suite covers customer creation and password hashing, OTP validity and expiry, ticket/order creation, staff status rules, object permissions, and model defaults. GitHub Actions runs these checks for pushes and pull requests.

## Main API groups

The API router exposes resources under `/api/` for customers, banners, categories, events, orders, and tickets. Authentication endpoints cover registration, login, OTP verification/resending, and password recovery. See `ticketapp/urls.py` for the authoritative route list.

## Environment

Copy `.env.example` and configure:

- Django security and debug settings
- Optional PostgreSQL connection URL
- Allowed frontend/admin origins
- Email delivery settings
- Cloudinary account settings

Never commit `.env`, database credentials, email passwords, or Cloudinary secrets.

## Deployment notes

- Apply migrations before starting Gunicorn.
- Use `DEBUG=False` and a strong secret key in production.
- Provide origins without trailing slashes.
- Configure the frontend and admin domains explicitly; review the preview-domain regex before using this service for sensitive production data.

## License

No open-source license is currently declared. All rights are reserved unless a license is added by the repository owner.
