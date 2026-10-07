# VulnGuard: Automated Vulnerability Scanner + Auto-Patch Suggestor

VulnGuard is a full-stack security testing platform that combines dynamic web application testing (DAST), static code security analysis (SAST), and actionable auto-patch suggestions with visual code diffs.

## Features

- **Dynamic Analysis (DAST)**:
  - Cross-Site Scripting (XSS) detection via query parameters and form injection.
  - SQL Injection (SQLi) checking error-based & time-based blind SQLi.
  - CSRF protection inspection (hidden token presence & SameSite cookie attributes).
  - Security header analysis (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
  - Server-Side Request Forgery (SSRF) checks against private IP ranges and internal metadata endpoints.
  - CORS misconfiguration scanning (reflection, wildcards with credentials, null origins).
  - Information disclosure probing sensitive paths (`.env`, `.git/HEAD`, backups, `robots.txt`).

- **Static Analysis (SAST)**:
  - Hardcoded secrets and credential detection (AWS keys, tokens, passwords, database strings, private keys).
  - Injection pattern detection (SQL concatenation/f-strings, OS command injection `os.system`/`subprocess`, `eval`/`exec`, direct DOM manipulations).
  - Insecure authentication checks (weak hashing algorithms like MD5/SHA1, hardcoded credentials, permissive CORS origins).
  - Security misconfiguration identification (`DEBUG = True`, weak secret keys, permissive host settings, insecure cookie flags).

- **Auto-Patch Engine**:
  - Automatically pairs detected vulnerabilities with recommended remediation steps.
  - Generates before-and-after code diffs with explanations and official OWASP/CWE references.

- **Interfaces**:
  - **Cyberpunk Dark UI Dashboard**: React + Vite + Tailwind CSS with real-time analysis, severity counts, and responsive layout.
  - **Interactive CLI Tool**: Standalone command-line client with color-coded ANSI terminal outputs and JSON export support.

---

## Architecture Overview

```
├── backend/
│   ├── api/routes.py            # FastAPI endpoints (/api/scan/dynamic, /api/scan/static, /api/health)
│   ├── patcher/engine.py        # Remediation & patch generation engine
│   ├── scanner/
│   │   ├── dynamic/             # DAST engines (XSS, SQLi, CSRF, Headers, SSRF, CORS, Info Disclosure)
│   │   ├── static/              # SAST engines (Secrets, Injection, Auth, Config)
│   │   └── models.py            # Pydantic data schemas
│   └── main.py                  # Server entry point & CORS configuration
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable cards, badges, diffs, navbar, layout
│   │   ├── pages/               # Dashboard, DynamicScan, StaticScan, Report
│   │   ├── App.jsx              # Client router
│   │   └── index.css            # Cyberpunk theme styles
├── cli/
│   └── vulnguard_cli.py         # Full-featured command-line scanner
```

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
From the project root:
```bash
# Install Python dependencies
py -m pip install -r backend/requirements.txt

# Start the FastAPI server
py -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The API documentation is available at `http://localhost:8000/docs`.

### 3. Frontend Setup
From the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Running the CLI Tool
The standalone CLI tool interacts directly with the core scanner and auto-patch engine:

```bash
# Scan a live website
py cli/vulnguard_cli.py scan-url https://example.com

# Run static analysis on a source file
py cli/vulnguard_cli.py scan-file path/to/script.py

# Output results as JSON
py cli/vulnguard_cli.py scan-file path/to/script.py --format json

# Filter by minimum severity
py cli/vulnguard_cli.py scan-file path/to/script.py --severity HIGH

# Pipe code via standard input
cat vulnerable_code.py | py cli/vulnguard_cli.py scan-code
```
