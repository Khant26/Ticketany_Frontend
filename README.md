# TicketsAnywhere Admin Dashboard

A dedicated admin dashboard for managing the TicketsAnywhere platform.

## Product repository

This application is also maintained as the [`admin`](https://github.com/Khant26/ticketsany/tree/admin) branch of the combined [TicketsAnywhere repository](https://github.com/Khant26/ticketsany). The original repository is preserved.

## Features

- Admin authentication and dashboard
- Event management (create, edit, delete)
- Category management
- Banner management
- Order and ticket management
- Customer management
- Status change for tickets

## Prerequisites

- Node.js (version 18 or higher)
- Running backend API (Django server at http://localhost:8000)

## Setup

1. Navigate to the admin dashboard directory:
   ```bash
   cd ticket_admin_dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The admin dashboard will run at `http://localhost:5173`

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Log in with admin credentials
3. Access various admin features through the sidebar navigation

## API Integration

The admin dashboard connects to the Django REST API at `http://localhost:8000/api/`

## Technologies Used

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- React Icons

## Project Structure

```
ticket_admin_dashboard/
├── src/
│   ├── admin/                 # Admin pages
│   ├── adminComponents/       # Admin-specific components
│   ├── components/            # Shared components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   ├── locales/               # Internationalization
│   ├── routes/                # Routing configuration
│   └── services/              # API services
├── public/
├── package.json
└── vite.config.js
```
