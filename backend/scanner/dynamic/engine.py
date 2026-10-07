import httpx

from ..models import Vulnerability
from .xss import XSSScanner
from .sqli import SQLiScanner
from .csrf import CSRFScanner
from .headers import HeadersScanner
from .ssrf import SSRFScanner
from .cors import CORSScanner
from .info_disclosure import InfoDisclosureScanner


class DynamicScanner:
    """Orchestrates all dynamic vulnerability scanners against a target URL."""

    async def scan(self, url: str) -> list[Vulnerability]:
        all_vulns: list[Vulnerability] = []

        async with httpx.AsyncClient(
            timeout=15.0,
            verify=False,
            headers={"User-Agent": "VulnGuard/1.0 Security Scanner"},
        ) as client:
            scanners = [
                HeadersScanner(client),
                CORSScanner(client),
                CSRFScanner(client),
                InfoDisclosureScanner(client),
                XSSScanner(client),
                SQLiScanner(client),
                SSRFScanner(client),
            ]

            for scanner in scanners:
                try:
                    vulns = await scanner.scan(url)
                    all_vulns.extend(vulns)
                except Exception:
                    # Don't let one scanner failure stop the rest
                    continue

        return all_vulns
