import { useState } from 'react';
import { Globe, Activity, Search, AlertCircle } from 'lucide-react';
import ScanResults from '../components/ScanResults';

export default function DynamicScan() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a target URL.');
      return;
    }
    
    setScanning(true);
    setResults(null);
    setError(null);

    try {
      const response = await fetch('/api/scan/dynamic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target: url.trim(),
          scan_type: 'dynamic'
        })
      });
      
      if (!response.ok) {
        let errorDetail = `Scan failed with status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.detail) errorDetail = errData.detail;
        } catch (_) {}
        throw new Error(errorDetail);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Could not connect to scanner server. Please ensure the backend is running on port 8000.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-slate-900 border border-slate-800 rounded-full mb-2">
          <Globe className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-4xl font-mono font-bold text-slate-100">Dynamic Application Scan (DAST)</h1>
        <p className="text-slate-400 max-w-2xl mx-auto font-sans">
          Enter a target URL to initiate an automated DAST scan against OWASP Top 10 web vulnerabilities (SQLi, XSS, CSRF, SSRF, CORS, security headers, and info disclosure).
        </p>
      </div>

      <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl">
        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              disabled={scanning}
            />
          </div>
          <button
            type="submit"
            disabled={scanning || !url.trim()}
            className="px-8 py-4 bg-green-500 text-slate-950 font-mono font-bold rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/20"
          >
            {scanning ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              'Initiate Scan'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-sans">{error}</div>
          </div>
        )}
      </div>

      {scanning && (
        <div className="py-12 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-green-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-green-400 font-mono text-sm animate-pulse">Probing target vectors & analyzing responses...</div>
        </div>
      )}

      {!scanning && results && (
        <ScanResults scanResult={results} />
      )}
    </div>
  );
}
