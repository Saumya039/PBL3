from ..models import Vulnerability
from .secrets import SecretsScanner
from .injection import InjectionPatternScanner
from .auth import AuthPatternScanner
from .config import ConfigScanner


class StaticScanner:
    """Orchestrates all static analysis scanners on source code."""

    async def scan(self, code: str, filename: str = "") -> list[Vulnerability]:
        all_vulns: list[Vulnerability] = []

        scanners = [
            SecretsScanner(),
            InjectionPatternScanner(),
            AuthPatternScanner(),
            ConfigScanner(),
        ]

        for scanner in scanners:
            try:
                vulns = await scanner.scan(code, filename)
                all_vulns.extend(vulns)
            except Exception:
                continue

        return all_vulns
