# Rahul Singh — Portfolio Website

Personal portfolio for **Rahul Singh**, B.Tech CSE 2nd Year student at Graphic Era Hill University, Dehradun.

---

## About

Second-year Computer Science Engineering student passionate about web development, DSA, Python automation, and emerging technologies like AI/ML and workflow automation. Active participant in workshops, hackathons, and community events.

---

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Font: Plus Jakarta Sans (Google Fonts)
- Icons: Simple Icons CDN, Devicons CDN

---

## Features

- Dark / light mode toggle
- Fully responsive (mobile, tablet, desktop)
- Sections: About, Projects, Skills, Education, Achievements, Certifications, Open Source, Coding Profiles, Events, Quick Access, Contact
- Contact form with MySQL backend + localStorage fallback
- Visit counter with MySQL backend + page view analytics
- Projects loaded dynamically from MySQL with emoji reactions (🔥 👍 💡)
- CV download tracker (privacy-safe, hashed IPs)
- Excel export of all DB data (`/api/export`)
- QR code generator (auto-generates from current URL)
- Gallery / Events lightbox with keyboard navigation and category filter
- ORCID, GitHub, LinkedIn, Email profile chips

---

## Workshops & Training

- **Machine Learning Workshops** — Attended multiple ML workshops covering supervised/unsupervised learning, model training, and real-world applications
- **n8n Automation Workshops** — Hands-on sessions on building no-code/low-code automation workflows using n8n, including API integrations and scheduled pipelines
- **AWS JAM 2026** — Cloud-based competitive challenge event
- **NSS (National Service Scheme)** — Active volunteer at GEHU

---

## Certifications

- Meta Front-End Developer Professional Certificate (Coursera)
- Meta Back-End Developer Professional Certificate (Coursera)
- AI & Prompt Engineering Fundamentals — Anthropic / Claude AI
- Problem Solving (Intermediate) — HackerRank
- Python (Basic) — HackerRank
- JavaScript (Basic) — HackerRank

---

## Coding Profiles

| Platform | Handle |
|----------|--------|
| LeetCode | @rahulsingh |
| GeeksForGeeks | @rahulsingh |
| GitHub | @rahulsingh |
| HackerRank | @rahulsingh |

---

## Project Structure

```
├── index.html
├── assets/
│   ├── css/style.css
│   ├── js/script.js
│   ├── images/
│   └── mines/
├── backend/
│   ├── server.js
│   ├── schema.sql
│   ├── package.json
│   ├── .env.example
│   └── .env
└── assignments/
    └── rahulsingh50.pdf
```

---

## Database Tables

| Table | Description |
|-------|-------------|
| `messages` | Contact form submissions |
| `visits` | Total visit counter |
| `page_views` | Per-visit referrer + timestamp |
| `projects` | Portfolio projects (dynamic) |
| `reactions` | Emoji reactions per project |
| `cv_downloads` | CV download tracker (hashed IPs) |

---

## Setup

### Frontend only

Open `index.html` in a browser — no build step required.

### Full stack (with backend)

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Copy and configure environment:
   ```bash
   cp .env.example .env
   ```

3. Create database and tables:
   ```bash
   /usr/local/mysql/bin/mysql -u root -pYOUR_PASSWORD < backend/schema.sql
   ```

4. Start the server:
   ```bash
   node server.js
   ```

Portfolio runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/visits` | — | Increment visit count |
| GET | `/api/visits` | — | Get visit count |
| POST | `/api/contact` | — | Save contact message |
| GET | `/api/messages` | Admin | View all messages |
| GET | `/api/projects` | — | Get all projects with reactions |
| POST | `/api/reactions` | — | Add emoji reaction |
| POST | `/api/cv-download` | — | Log CV download |
| GET | `/api/cv-downloads` | Admin | Download stats |
| GET | `/api/export` | Admin | Download Excel report |
| GET | `/api/health` | — | Health check |

Admin endpoints use HTTP Basic Auth (`admin` / `admin123` by default — change in `.env`).

---

## Environment Variables

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=portfolio_db
ALLOWED_ORIGIN=http://localhost:3000
ADMIN_USER=admin
ADMIN_PASS=change_this_password
IP_SALT=random_string_for_hashing
```

---

## License

MIT
