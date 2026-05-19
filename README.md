# FeiControl

> 💖 A cute mission control for your [OpenClaw](https://openclaw.ai) ~
> **v1.0.0** — 现已稳定发布

FeiControl is a real-time dashboard that sits alongside your OpenClaw installation. It reads agents, sessions, memory, and logs straight from the filesystem — no extra backend needed!

> Fork from [TenacitOS](https://github.com/carlosazaustre/tenacitOS) 🙏 — see [ATTRIBUTION.md](./ATTRIBUTION.md)

---

## ✨ Features

### 🖥️ Dashboard
Greeting, system health, agent team status & daily heartbeat — fully customizable with drag-and-drop widgets.

### 🤖 Multi-Agent Remote Management
Manage local and remote agents through a unified interface. Connect to ClawTeam instances, send tasks, monitor status.

### 💬 Agent Chat
Direct conversation interface with your agents. Stream responses, select agents, send tasks via chat.

### 📅 Calendar
Weekly, monthly, and yearly views with event drag-and-drop.

### 🏢 3D Office
Isometric office with cherry blossoms, agent desks & real-time activity feed.

### 📝 Doc Viewer
Browse & edit agent memory files (SOUL.md, TOOLS.md, etc.).

### ⏰ Cron Tasks
Manage scheduled jobs with run history & manual triggers.

### 💰 Cost Analysis
Daily cost trends, per-agent breakdown & budget tracking.

### 🔌 Plugin System
Hot-load third-party plugins. Plugin lifecycle hooks, permissions, and a management UI.

### 🌐 Multi-Language
Built-in support for **English**, **Chinese**, **Japanese**, **Korean**, and **Spanish**.

### 📱 PWA Ready
Install as a desktop app with offline support via Service Worker.

### 🎨 Multi-Theme
Light, dark, and custom themes with CSS variables.

### ⌨️ Keyboard Shortcuts
Global shortcuts for quick navigation.

---

## 🚀 Quick Start

### Local Development

```bash
git clone https://github.com/your-org/feicontrol.git
cd feicontrol
npm install
cp .env.example .env.local   # edit with your password & secrets ✏️
npm run dev                   # → http://localhost:3000
```

### Production Build

```bash
npm run build
npm start                     # → http://localhost:4730
```

### Docker (Recommended for Production)

```bash
docker compose up -d          # Build & start in background
docker compose logs -f        # Follow logs
```

Or build manually:

```bash
docker build -t feicontrol .
docker run -d \
  -p 4730:4730 \
  -e ADMIN_PASSWORD=your-strong-password \
  -e AUTH_SECRET=$(openssl rand -base64 32) \
  -v feicontrol_data:/app/data \
  feicontrol
```

> 💡 Set `OPENCLAIR_DIR` in `.env.local` if your OpenClaw isn't at the default `~/.openclaw`

---

## 📸 Screenshots

| Dashboard | Calendar | 3D Office |
|-----------|----------|-----------|
| ![Dashboard](./docs/screenshots/dashboard.png) | ![Calendar](./docs/screenshots/calendar.png) | ![3D Office](./docs/screenshots/office-3d.png) |

| Cost Analysis | Cron Tasks | Doc Viewer |
|---------------|------------|------------|
| ![Cost Analysis](./docs/screenshots/cost-analysis.png) | ![Cron Tasks](./docs/screenshots/cron-tasks.png) | ![Doc Viewer](./docs/screenshots/doc-viewer.png) |

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| 🧩 Framework | Next.js 15 (App Router) |
| 🎨 UI | React 19 + Tailwind CSS v4 |
| 🌸 3D | React Three Fiber + Drei + Rapier |
| 📊 Charts | Recharts |
| 🗄️ Database | SQLite (better-sqlite3) |
| 🌐 Languages | 5 (EN / ZH / JA / KO / ES) |
| 🧪 Testing | Vitest + React Testing Library |
| 🔄 CI/CD | GitHub Actions |
| 🐳 Deploy | Docker (multi-stage build) |

---

## 📋 Requirements

- **Node.js** 18+ (tested with v22)
- **[OpenClaw](https://openclaw.ai)** running on the same host
- **Docker** (optional, for containerized deployment)

---

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for:
- Strong password & secret generation
- HTTPS / reverse proxy setup
- Firewall recommendations
- Vulnerability reporting policy

---

## 👥 Contributing

1. Fork & create a feature branch
2. Keep secrets in `.env.local` (gitignored~)
3. Open a PR 💌

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on:
- Code style & conventions
- Commit message format
- PR process
- Testing checklist

---

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

## 🔗 Links

- [OpenClaw](https://openclaw.ai)
- [OpenClaw Docs](https://docs.openclaw.ai)
- [Changelog](./CHANGELOG.md)
- [Roadmap](./ROADMAP.md)
- [Issues](../../issues) — bugs & feature requests
- [ATTRIBUTION.md](./ATTRIBUTION.md) — upstream credits
