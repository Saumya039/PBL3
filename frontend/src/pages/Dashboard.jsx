import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, FileCode2, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats] = useState({ totalScans: 0, vulnerabilitiesFound: 0, patchesSuggested: 0 });

  // Mock initial load - replace with actual fetch later
  useEffect(() => {
    // Fetch stats and recent scans
    // fetch('/api/stats').then(...)
  }, []);

  return (
    <div className="space-y-12">
      <section className="text-center space-y-6 py-12">
        <h1 className="text-5xl md:text-7xl font-mono font-bold tracking-tighter">
          <span className="text-textPrimary">Secure Your </span>
          <span className="neon-text text-accent">Cyberspace</span>
        </h1>
        <p className="text-textMuted text-lg md:text-xl max-w-2xl mx-auto">
          Advanced automated vulnerability scanning and AI-driven patch suggestions for modern web applications.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div 
          onClick={() => navigate('/scan/dynamic')}
          className="group cursor-pointer bg-primary p-8 rounded-xl border border-secondary hover:border-accent hover:neon-glow transition-all duration-300 flex flex-col items-center text-center space-y-4"
        >
          <div className="p-4 bg-secondary/50 rounded-full group-hover:bg-accent/20 transition-colors duration-300">
            <Globe className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-2xl font-mono font-bold text-textPrimary">Dynamic Scan</h2>
          <p className="text-textMuted">Scan live web applications for vulnerabilities (DAST). Enter a URL and let our engine find security flaws in real-time.</p>
          <button className="mt-4 px-6 py-2 bg-secondary text-textPrimary font-mono border border-accent/50 rounded hover:bg-accent hover:text-primary transition-colors cursor-pointer">
            Launch Scanner
          </button>
        </div>

        <div 
          onClick={() => navigate('/scan/static')}
          className="group cursor-pointer bg-primary p-8 rounded-xl border border-secondary hover:border-accent hover:neon-glow transition-all duration-300 flex flex-col items-center text-center space-y-4"
        >
          <div className="p-4 bg-secondary/50 rounded-full group-hover:bg-accent/20 transition-colors duration-300">
            <FileCode2 className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-2xl font-mono font-bold text-textPrimary">Static Analysis</h2>
          <p className="text-textMuted">Analyze source code for security issues (SAST). Paste code or upload files to identify vulnerabilities before deployment.</p>
          <button className="mt-4 px-6 py-2 bg-secondary text-textPrimary font-mono border border-accent/50 rounded hover:bg-accent hover:text-primary transition-colors cursor-pointer">
            Analyze Code
          </button>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
        <div className="bg-primary p-6 rounded-lg border border-secondary text-center">
          <div className="text-4xl font-mono font-bold text-accent mb-2">{stats.totalScans}</div>
          <div className="text-textMuted text-sm uppercase tracking-wider">Total Scans</div>
        </div>
        <div className="bg-primary p-6 rounded-lg border border-secondary text-center">
          <div className="text-4xl font-mono font-bold text-critical mb-2">{stats.vulnerabilitiesFound}</div>
          <div className="text-textMuted text-sm uppercase tracking-wider">Vulnerabilities Found</div>
        </div>
        <div className="bg-primary p-6 rounded-lg border border-secondary text-center">
          <div className="text-4xl font-mono font-bold text-info mb-2">{stats.patchesSuggested}</div>
          <div className="text-textMuted text-sm uppercase tracking-wider">Patches Suggested</div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto bg-primary rounded-xl border border-secondary p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-secondary pb-4">
          <ShieldAlert className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-mono font-bold text-textPrimary">Recent Scans</h2>
        </div>
        
        {recentScans.length === 0 ? (
          <div className="text-center py-12 text-textMuted">
            <p>No scans yet. Launch a dynamic or static scan to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentScans.map((scan, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => navigate(`/report/${scan.id}`)}>
                <div>
                  <div className="font-mono text-textPrimary">{scan.target}</div>
                  <div className="text-sm text-textMuted">{new Date(scan.date).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-critical/20 text-critical">{scan.critical} C</span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-warning/20 text-warning">{scan.high} H</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
