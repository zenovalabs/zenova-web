# ZENOVA Labs - Cloud & Networking Platform

Official website for **ZENOVA Labs, s.r.o.** - specialists in cloud infrastructure, networking, and automation.

## 🚀 About

ZENOVA Labs provides:
- **Cloud Solutions**: Microsoft 365, cloud-native platforms
- **Networking**: Modern network architectures and solutions
- **Automation**: Infrastructure automation and CI/CD
- **Consulting**: Cloud migrations and audit services

## 📦 Tech Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Hosting**: Azure Static Web Apps
- **Build**: Node.js with Sirv dev server
- **Languages**: Bilingual (SK/EN)

## 🛠️ Development

This project uses a dev container for consistent development environment.

### Quick Start

```bash
# Install dependencies
npm ci

# Start development server (http://localhost:8000)
npm start

# Build for production
npm run build
```

### Dev Container

Open in:
- [GitHub Codespaces](https://github.com/features/codespaces)
- VS Code with [Remote Containers extension](https://code.visualstudio.com/docs/remote/containers)

## 📂 Project Structure

```
src/
├── index.html          # Main markup
├── script.js          # Navigation, certificates, language switching
├── styles.css         # Responsive design
└── assets/
    ├── zenova.png
    └── certificates/  # Certificate gallery
        ├── manifest.json
        └── ZENOVA-Labs-Cert*.webp

.devcontainer/         # Dev container config
.github/workflows/     # Azure Static Web Apps CI/CD
```

## 🌐 Deployment

Automatically deployed to Azure Static Web Apps on push to `main` branch via GitHub Actions.

## 📋 License

© ZENOVA Labs, s.r.o.