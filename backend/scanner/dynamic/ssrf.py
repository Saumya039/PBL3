from urllib.parse import urlparse, urlencode, parse_qs, urlunparse

import httpx

from ..models import Vulnerability, VulnType, Severity


# Internal/private IP ranges used to test for SSRF
SSRF_PAYLOADS = [
    "http://127.0.0.1",
    "http://localhost",
    "http://0.0.0.0",
    "http://169.254.169.254/latest/meta-data/",
    "http://[::1]",
    "http://127.0.0.1:22",
    "http://127.0.0.1:3306",
]

# Parameter names that commonly accept URLs
URL_PARAM_NAMES = [
    "url", "uri", "path", "next", "redirect", "return",
    "callback", "go", "link", "target", "dest", "destination",
    "rurl", "return_url", "redirect_url", "feed", "host", "site",
    "src", "source", "ref", "page", "file", "load",
]

# Patterns that suggest internal resource access
INTERNAL_INDICATORS = [
    "root:", "/etc/passwd", "ami-id", "instance-id",
    "internal server", "connection refused", "couldn't connect",
    "ssh-", "mysql", "postgresql",
]


class SSRFScanner:
    """Detects Server-Side Request Forgery by testing URL parameters with internal addresses."""

    def __init__(self, client: httpx.AsyncClient):
        self.client = client

    async def scan(self, url: str) -> list[Vulnerability]:
        vulns: list[Vulnerability] = []
        parsed = urlparse(url)
        params = parse_qs(parsed.query)

        # Find parameters that look like they accept URLs
        target_params = []
        for name in params:
            if name.lower() in URL_PARAM_NAMES:
                target_params.append(name)

        # Also check all params regardless of name
        if not target_params:
            target_params = list(params.keys())

        for param_name in target_params:
            for payload in SSRF_PAYLOADS:
                test_params = {**{k: v[0] for k, v in params.items()}, param_name: payload}
                test_url = urlunparse(parsed._replace(query=urlencode(test_params)))
                try:
                    resp = await self.client.get(test_url, follow_redirects=False, timeout=10)
                    body_lower = resp.text.lower()

                    # Check for indicators that internal resources were accessed
                    for indicator in INTERNAL_INDICATORS:
                        if indicator.lower() in body_lower:
                            vulns.append(Vulnerability(
                                type=VulnType.SSRF,
                                severity=Severity.CRITICAL,
                                title=f"Potential SSRF via parameter '{param_name}'",
                                description=(
                                    f"The parameter '{param_name}' may be vulnerable to SSRF. "
                                    f"An internal resource indicator was detected when injecting "
                                    f"an internal address as the parameter value."
                                ),
                                evidence=f"Payload: {payload} | Indicator: '{indicator}' found in response",
                                location=f"Parameter: {param_name}",
                                cwe_id="CWE-918",
                                owasp_category="A10:2021 - Server-Side Request Forgery",
                            ))
                            return vulns  # SSRF confirmed, no need to continue

                    # Check if the server made the request (different response than baseline)
                    if resp.status_code == 200 and len(resp.text) > 0:
                        # Might be fetching the URL content
                        if "127.0.0.1" in payload or "localhost" in payload:
                            if resp.status_code != 404 and "not found" not in body_lower:
                                vulns.append(Vulnerability(
                                    type=VulnType.SSRF,
                                    severity=Severity.HIGH,
                                    title=f"Possible SSRF via parameter '{param_name}'",
                                    description=(
                                        f"The parameter '{param_name}' may accept internal URLs. "
                                        f"The server returned a 200 response when an internal "
                                        f"address was provided, suggesting it may fetch URLs."
                                    ),
                                    evidence=f"Payload: {payload} returned HTTP {resp.status_code}",
                                    location=f"Parameter: {param_name}",
                                    cwe_id="CWE-918",
                                    owasp_category="A10:2021 - Server-Side Request Forgery",
                                ))
                                return vulns
                except httpx.RequestError:
                    continue

        return vulns
