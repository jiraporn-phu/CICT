# Deployment Guide (Docker)

This project runs with Docker Compose: Next.js (standalone, serves itself directly — no separate Nginx
container) + MySQL.

**2026-08-12 infra audit note**: this project was originally built without admin review and had several
issues since fixed — see `CLAUDE.md` for the full writeup. In short: `phpMyAdmin` used to be exposed
publicly here (removed — every other project in this org accesses its DB via DBeaver over an SSH tunnel,
this should too from now on), a `.env` with real credentials was committed to git (removed from tracking,
credentials rotated), and an unused `nginx.conf` from an earlier design has been deleted since nothing
referenced it.

## Prerequisites

- Docker and Docker Compose installed on your system.

### 🔒 Security Recommendations

- **Database access**: use DBeaver (or any MySQL client) over an SSH tunnel to the host — do not add a
  public database admin UI like phpMyAdmin. See the other projects on this Coolify instance for the
  established pattern.
- **Passwords**: never commit real credentials. Copy `.env.example` to `.env` locally and fill in real
  values there — `.env` is gitignored.

---

© 2025 ICTC-Asset Management System

## Getting Started

1. **Environment Variables**: copy `.env.example` to `.env` and fill in real values (or set them directly
   in Coolify's Environment Variables UI for production — that's the source of truth there, not this file).

2. **Run with Docker Compose**:

   ```bash
   docker-compose up --build -d
   ```

3. **Database Migration**:

   Once the containers are running, you need to run the Prisma migration to set up the database schema inside the container:

   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

## Accessing the services

- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **MySQL**: `127.0.0.1:3311` locally, or via SSH tunnel in production (see Security Recommendations above)

## Useful Commands

- **Stop containers**: `docker-compose down`
- **View logs**: `docker-compose logs -f app`
- **Restart app**: `docker-compose restart app`
