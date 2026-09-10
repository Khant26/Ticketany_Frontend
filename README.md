# TicketsAnywhere

Customer-facing event discovery and ticket-booking application for TicketsAnywhere.

**Live:** https://ticketsany.com/

## Product branches

| Branch | Application |
|---|---|
| [`main`](https://github.com/Khant26/ticketsany/tree/main) | Customer web application |
| [`admin`](https://github.com/Khant26/ticketsany/tree/admin) | Administrative dashboard |
| [`api`](https://github.com/Khant26/ticketsany/tree/api) | Django REST API |

The original component repositories remain available; these branches provide one professional product-level entry point without changing the applications' working directory structure.

## Features

- Event discovery, categories, featured events, and search
- Customer registration, authentication, and profile management
- Ticket ordering and downloadable ticket views
- English and Myanmar localization
- Responsive layouts and API-backed loading/error states

## Tech stack

- React 19 and Vite 7
- React Router
- Tailwind CSS
- Axios
- i18next

## Local development

```bash
npm ci
npm run dev
```

Set `VITE_API_BASE_URL` to the Django API base URL. Keep real credentials out of committed frontend configuration.

## Quality checks

```bash
npm run lint
npm run build
```

GitHub Actions runs lint and production-build checks on pushes and pull requests.

## License

No open-source license is currently declared. All rights are reserved unless a license is added by the repository owner.
