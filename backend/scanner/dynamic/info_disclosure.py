from urllib.parse import urljoin

import httpx

from ..models import Vulnerability, VulnType, Severity


SENSITIVE_PATHS = [
    ("/.env", "Environment configuration file"),
    ("/.git/HEAD", "Git repository metadata"),
    ("/robots.txt", "Robots exclusion file"),
    ("/.DS_Store", "macOS directory metadata"),
    ("/wp-config.php", "WordPress configuration"),
    ("/phpinfo.php", "PHP info page"),
    ("/server-status", "Apache server status"),
    ("/server-info", "Apache server info"),
    ("/.htaccess", "Apache configuration"),
    ("/web.config", "IIS configuration"),
    ("/crossdomain.xml", "Flash cross-domain policy"),
    ("/sitemap.xml", "Sitemap file"),
    ("/backup.sql", "Database backup"),
    ("/dump.sql", "Database dump"),
    ("/database.sql", "Database export"),
    ("/admin", "Admin panel"),
    ("/console", "Debug console"),
    ("/.well-known/security.txt", "Security contact info"),
]

# Content indicators that a path returned real data (not a generic 404 page)
CONTENT_INDICATORS = {
    "/.env": ["DB_", "APP_KEY", "SECRET", "PASSWORD", "API_KEY", "DATABASE_URL"],
    "/.git/HEAD": ["ref: refs/"],
    "/phpinfo.php": ["phpinfo()", "PHP Version", "php.ini"],
    "/server-status": ["Apache Server Status", "Server uptime"],
    "/wp-config.php": ["DB_NAME", "DB_USER", "DB_PASSWORD"],
    "/backup.sql": ["CREATE TABLE", "INSERT INTO", "DROP TABLE"],
    "/dump.sql": ["CREATE TABLE", "INSERT INTO"],
    "/database.sql": ["CREATE TABLE", "INSERT INTO"],
}


class InfoDisclosureScanner:
    """Checks for exposed sensitive files, paths, and information leakage."""

    def __init__(self, client: httpx.AsyncClient):
        self.client = client

    async def scan(self, url: str) -> list[Vulnerability]:
        vulns: list[Vulnerability] = []

        for path, desc in SENSITIVE_PATHS:
            target = urljoin(url.rstrip("/") + "/", path.lstrip("/"))
            try:
                resp = await self.client.get(target, follow_redirects=False, timeout=10)
            except httpx.RequestError:
                continue

            if resp.status_code == 200:
                # Verify it's not a generic 404 page returning 200
                if self._is_real_content(path, resp.text):
                    severity = Severity.HIGH if path in ("/.env", "/.git/HEAD", "/backup.sql", "/dump.sql") else Severity.MEDIUM
                    vulns.append(Vulnerability(
                        type=VulnType.INFO_DISCLOSURE,
                        severity=severity,
                        title=f"Sensitive File Exposed: {path}",
                        description=(
                            f"The file '{path}' ({desc}) is publicly accessible. "
                            f"This may expose sensitive configuration, credentials, "
                            f"or internal application details."
                        ),
                        evidence=f"HTTP {resp.status_code} at {target} (content length: {len(resp.text)})",
                        location=target,
                        cwe_id="CWE-538",
                        owasp_category="A05:2021 - Security Misconfiguration",
                    ))
            elif resp.status_code in (401, 403):
                # Resource exists but is protected - informational
                if path in ("/.env", "/.git/HEAD"):
                    vulns.append(Vulnerability(
                        type=VulnType.INFO_DISCLOSURE,
                        severity=Severity.INFO,
                        title=f"Protected Resource Detected: {path}",
                        description=(
                            f"The path '{path}' returned HTTP {resp.status_code}. "
                            f"The resource exists but is access-restricted. Ensure "
                            f"it's not accessible via alternative paths."
                        ),
                        evidence=f"HTTP {resp.status_code} at {target}",
                        location=target,
                        cwe_id="CWE-538",
                        owasp_category="A05:2021 - Security Misconfiguration",
                    ))

        return vulns

    def _is_real_content(self, path: str, body: str) -> bool:
        """Verify the response contains expected content, not a custom 404."""
        indicators = CONTENT_INDICATORS.get(path)
        if indicators:
            body_lower = body.lower()
            return any(ind.lower() in body_lower for ind in indicators)
        # For paths without specific indicators, check response isn't tiny or a redirect page
        return len(body) > 50
