import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


SEVERITY_ORDER = {
    Severity.CRITICAL: 4,
    Severity.HIGH: 3,
    Severity.MEDIUM: 2,
    Severity.LOW: 1,
    Severity.INFO: 0,
}


class VulnType(str, Enum):
    XSS = "XSS"
    SQLI = "SQLI"
    CSRF = "CSRF"
    SSRF = "SSRF"
    CORS_MISCONFIG = "CORS_MISCONFIG"
    SECURITY_HEADERS = "SECURITY_HEADERS"
    INFO_DISCLOSURE = "INFO_DISCLOSURE"
    HARDCODED_SECRET = "HARDCODED_SECRET"
    INSECURE_AUTH = "INSECURE_AUTH"
    INSECURE_CONFIG = "INSECURE_CONFIG"
    VULNERABLE_COMPONENT = "VULNERABLE_COMPONENT"
    LOGGING_FAILURE = "LOGGING_FAILURE"
    COMMAND_INJECTION = "COMMAND_INJECTION"


class Vulnerability(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: VulnType
    severity: Severity
    title: str
    description: str
    evidence: str = ""
    location: str = ""
    cwe_id: Optional[str] = None
    owasp_category: str = ""


class PatchSuggestion(BaseModel):
    vulnerability_id: str
    title: str
    description: str
    original_code: Optional[str] = None
    patched_code: Optional[str] = None
    references: list[str] = []


class ScanResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    target: str
    scan_type: str  # "dynamic" or "static"
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    vulnerabilities: list[Vulnerability] = []
    patches: list[PatchSuggestion] = []
    summary: dict = {}

    def compute_summary(self) -> dict:
        counts = {s.value: 0 for s in Severity}
        for v in self.vulnerabilities:
            counts[v.severity.value] += 1
        self.summary = {"total": len(self.vulnerabilities), **counts}
        return self.summary


class ScanRequest(BaseModel):
    target: str
    scan_type: str = "dynamic"
    filename: Optional[str] = None
