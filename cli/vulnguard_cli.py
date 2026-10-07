import argparse
import asyncio
import sys
import os
import json
import datetime
from pathlib import Path

# Enable ANSI escape sequences on Windows
if os.name == 'nt':
    os.system('')
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# ANSI Colors
COLORS = {
    'CRITICAL': '\033[91m\033[1m',  # Bright Red + Bold
    'HIGH': '\033[38;5;208m\033[1m', # Orange + Bold
    'MEDIUM': '\033[93m',            # Bright Yellow
    'LOW': '\033[94m',               # Blue
    'INFO': '\033[90m',              # Gray
    'SUCCESS': '\033[92m',           # Bright Green
    'RESET': '\033[0m',              # Reset
    'BOLD': '\033[1m',               # Bold
    'CYAN': '\033[96m',              # Cyan
}

SEVERITY_LEVELS = {
    'INFO': 0,
    'LOW': 1,
    'MEDIUM': 2,
    'HIGH': 3,
    'CRITICAL': 4
}

# Import backend modules
# Add project root to sys.path so 'backend' can be imported
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)

try:
    from backend.scanner.dynamic.engine import DynamicScanner
    from backend.scanner.static.engine import StaticScanner
    from backend.patcher.engine import PatchEngine
    from backend.scanner.models import ScanResult, SEVERITY_ORDER
    backend_available = True
except ImportError:
    backend_available = False

def print_color(text, color_name, end='\n', file=sys.stdout):
    color_code = COLORS.get(color_name.upper(), '')
    reset_code = COLORS['RESET']
    print(f"{color_code}{text}{reset_code}", end=end, file=file)

def filter_vulnerabilities(vulns, min_severity):
    if not min_severity:
        return vulns
    min_level = SEVERITY_LEVELS.get(min_severity.upper(), 0)
    return [v for v in vulns if SEVERITY_LEVELS.get(v.get('severity', 'INFO').upper(), 0) >= min_level]

def format_text_output(result_data, options):
    target = result_data.get('target', 'Unknown')
    scan_type = result_data.get('scan_type', 'Unknown')
    started = result_data.get('started_at', datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    vulns = result_data.get('vulnerabilities', [])
    
    vulns = filter_vulnerabilities(vulns, options.severity)
    
    counts = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0, 'INFO': 0}
    for v in vulns:
        severity = v.get('severity', 'INFO').upper()
        if severity in counts:
            counts[severity] += 1
            
    # Print Header
    print(f"{COLORS['CYAN']}╔{'═'*46}╗{COLORS['RESET']}")
    print(f"{COLORS['CYAN']}║  {COLORS['BOLD']}VulnGuard — Vulnerability Scanner{COLORS['RESET']}{COLORS['CYAN']}           ║{COLORS['RESET']}")
    print(f"{COLORS['CYAN']}╚{'═'*46}╝{COLORS['RESET']}\n")
    
    print(f"{COLORS['BOLD']}Target:{COLORS['RESET']} {target}")
    print(f"{COLORS['BOLD']}Scan Type:{COLORS['RESET']} {scan_type}")
    print(f"{COLORS['BOLD']}Started:{COLORS['RESET']} {started}\n")
    
    print(f"{COLORS['CYAN']}━━━ Scan Results ━━━━━━━━━━━━━━━━━━━━━━━━━━━━{COLORS['RESET']}\n")
    
    print(f"Found {COLORS['BOLD']}{len(vulns)}{COLORS['RESET']} vulnerabilities:")
    print(f"  {COLORS['CRITICAL']}CRITICAL: {counts['CRITICAL']}{COLORS['RESET']}  |  "
          f"{COLORS['HIGH']}HIGH: {counts['HIGH']}{COLORS['RESET']}  |  "
          f"{COLORS['MEDIUM']}MEDIUM: {counts['MEDIUM']}{COLORS['RESET']}  |  "
          f"{COLORS['LOW']}LOW: {counts['LOW']}{COLORS['RESET']}\n")
          
    for v in vulns:
        sev = v.get('severity', 'INFO').upper()
        color = COLORS.get(sev, COLORS['INFO'])
        title = v.get('title', 'Unknown Vulnerability')
        print(f"{color}─── [{sev}] {title} ───{COLORS['RESET']}")
        
        owasp = v.get('owasp_category') or v.get('owasp')
        if owasp:
            print(f"{COLORS['BOLD']}OWASP:{COLORS['RESET']} {owasp}")
        cwe = v.get('cwe_id') or v.get('cwe')
        if cwe:
            print(f"{COLORS['BOLD']}CWE:{COLORS['RESET']} {cwe}")
        if 'location' in v and v['location']:
            print(f"{COLORS['BOLD']}Location:{COLORS['RESET']} {v['location']}")
        if 'evidence' in v and v['evidence']:
            print(f"{COLORS['BOLD']}Evidence:{COLORS['RESET']} {v['evidence']}\n")
            
        if not options.no_patches and 'patch' in v:
            patch = v['patch']
            print(f"{COLORS['SUCCESS']}Fix: {patch.get('title', 'Recommended Action')}{COLORS['RESET']}")
            orig = patch.get('original_code') or patch.get('original')
            if orig:
                print(f"{COLORS['CRITICAL']}- Original: {orig}{COLORS['RESET']}")
            patched = patch.get('patched_code') or patch.get('patched')
            if patched:
                print(f"{COLORS['SUCCESS']}+ Patched:  {patched}{COLORS['RESET']}")
        
        if 'references' in v and v['references']:
            print(f"{COLORS['BOLD']}References:{COLORS['RESET']} {', '.join(v['references'])}")
        print()
        
def process_output(result_data, options):
    # Output to file if specified
    if options.output:
        try:
            with open(options.output, 'w', encoding='utf-8') as f:
                if options.format == 'json':
                    json.dump(result_data, f, indent=2)
                else:
                    # Redirect stdout temporarily to write text output to file
                    original_stdout = sys.stdout
                    sys.stdout = f
                    format_text_output(result_data, options)
                    sys.stdout = original_stdout
            print_color(f"\nResults successfully written to {options.output}", 'SUCCESS')
        except Exception as e:
            print_color(f"Error writing to output file: {e}", 'CRITICAL', file=sys.stderr)
            sys.exit(1)
            
    # Output to terminal
    if options.format == 'json':
        print(json.dumps(result_data, indent=2))
    else:
        format_text_output(result_data, options)

async def run_scan(args):
    if not backend_available:
        print_color("Warning: Backend modules not found. Running in mock mode.", "HIGH", file=sys.stderr)
        return {
            'target': args.url if args.command == 'scan-url' else (args.filepath if args.command == 'scan-file' else 'stdin'),
            'scan_type': 'dynamic' if args.command == 'scan-url' else 'static',
            'started_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'vulnerabilities': [
                {
                    'title': 'SQL Injection in login form',
                    'severity': 'CRITICAL',
                    'owasp_category': 'A03:2021 - Injection',
                    'cwe_id': 'CWE-89',
                    'location': '/login?username=',
                    'evidence': 'MySQL error detected in response...',
                    'patch': {
                        'title': 'Use Parameterized Queries',
                        'original_code': "query = f\"SELECT * FROM users WHERE name='{input}'\"",
                        'patched_code': "cursor.execute(\"SELECT * FROM users WHERE name=%s\", (input,))"
                    },
                    'references': ['https://owasp.org/Top10/A03_2021-Injection/']
                }
            ]
        }
        
    patch_engine = PatchEngine()

    try:
        if args.command == 'scan-url':
            scanner = DynamicScanner()
            target = args.url.strip()
            if not target.startswith(('http://', 'https://')):
                target = f"https://{target}"
            print_color(f"Scanning target: {target}...", "CYAN")
            vulns = await scanner.scan(target)
            patches = patch_engine.generate_patches(vulns)
            scan_type = 'dynamic'
        elif args.command == 'scan-file':
            if not os.path.exists(args.filepath):
                print_color(f"Error: File not found: {args.filepath}", 'CRITICAL', file=sys.stderr)
                sys.exit(1)
            scanner = StaticScanner()
            with open(args.filepath, 'r', encoding='utf-8', errors='ignore') as f:
                code = f.read()
            target = args.filepath
            print_color(f"Analyzing file: {target}...", "CYAN")
            vulns = await scanner.scan(code, target)
            patches = patch_engine.generate_patches(vulns)
            scan_type = 'static'
        elif args.command == 'scan-code':
            code = sys.stdin.read()
            if not code.strip():
                print_color("Error: No code provided on stdin.", 'CRITICAL', file=sys.stderr)
                sys.exit(1)
            scanner = StaticScanner()
            target = 'stdin'
            print_color("Analyzing code from stdin...", "CYAN")
            vulns = await scanner.scan(code, "stdin")
            patches = patch_engine.generate_patches(vulns)
            scan_type = 'static'
        else:
            raise ValueError(f"Unknown command: {args.command}")

        # Pair patches with vulns
        patch_map = {p.vulnerability_id: p for p in patches}
        vuln_dicts = []
        for v in vulns:
            vd = v.model_dump() if hasattr(v, 'model_dump') else v.dict()
            p = patch_map.get(v.id)
            if p:
                vd['patch'] = p.model_dump() if hasattr(p, 'model_dump') else p.dict()
                if not vd.get('references') and p.references:
                    vd['references'] = p.references
            vuln_dicts.append(vd)

        return {
            'target': target,
            'scan_type': scan_type,
            'started_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'vulnerabilities': vuln_dicts,
            'patches': [p.model_dump() if hasattr(p, 'model_dump') else p.dict() for p in patches]
        }
    except Exception as e:
        print_color(f"Scan failed: {str(e)}", 'CRITICAL', file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="VulnGuard — Command-line Vulnerability Scanner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  py cli/vulnguard_cli.py scan-url https://example.com
  py cli/vulnguard_cli.py scan-file src/main.py --format json --severity HIGH
  cat script.py | py cli/vulnguard_cli.py scan-code --no-patches
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", required=True, help="Command to execute")
    
    # scan-url
    url_parser = subparsers.add_parser("scan-url", help="Run dynamic vulnerability scan on a URL")
    url_parser.add_argument("url", help="Target URL to scan")
    
    # scan-file
    file_parser = subparsers.add_parser("scan-file", help="Run static analysis on a source code file")
    file_parser.add_argument("filepath", help="Path to the source code file")
    
    # scan-code
    code_parser = subparsers.add_parser("scan-code", help="Read code from stdin for static analysis")
    
    # Global options
    for p in [url_parser, file_parser, code_parser]:
        p.add_argument("--format", choices=["text", "json"], default="text", help="Output format (default: text)")
        p.add_argument("--severity", choices=["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"], help="Minimum severity to show (default: all)")
        p.add_argument("--no-patches", action="store_true", help="Skip patch suggestions")
        p.add_argument("--output", help="Write results to file")
        p.add_argument("-v", "--verbose", action="store_true", help="Verbose output")

    args = parser.parse_args()
    
    if args.verbose:
        print_color(f"[INFO] Starting VulnGuard CLI...", "INFO")
        print_color(f"[INFO] Command: {args.command}", "INFO")
        
    # Run scan asynchronously
    result = asyncio.run(run_scan(args))
    
    # Process and format the output
    process_output(result, args)

if __name__ == "__main__":
    main()
