import { useState } from 'react';
import { Code, FileCode, Play, AlertCircle, RefreshCw, Upload } from 'lucide-react';
import ScanResults from '../components/ScanResults';

export default function StaticScan() {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('snippet.py');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError('Please paste code or upload a file.'); return; }
    setLoading(true); setError(null); setResults(null);

    try {
      const res = await fetch('/api/scan/static', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: code, filename: filename || 'snippet.py', scan_type: 'static' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      setResults(await res.json());
    } catch (err) {
      setError(err.message || 'Could not connect. Is the FastAPI backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setCode(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-mono font-bold text-slate-100 flex items-center gap-3">
          <Code className="w-8 h-8 text-green-500" />
          Static Code Analysis (SAST)
        </h1>
        <p className="text-slate-400 mt-2">Detect hardcoded secrets, injection flaws, insecure configs, and get auto-patch suggestions.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <FileCode className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="filename.py"
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-green-500 w-56"
              />
            </div>
            <div className="flex gap-3 ml-auto">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-mono transition-colors">
                <Upload className="w-4 h-4 text-green-400" />
                Upload File
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".py,.js,.jsx,.ts,.tsx,.php,.java,.env,.json,.txt,.rb,.go" />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-slate-950 font-mono font-bold px-5 py-2 rounded-lg transition-all"
              >
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Scanning...</> : <><Play className="w-4 h-4 fill-current" />Analyze</>}
              </button>
            </div>
          </div>

          <textarea
            rows={14}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`# Paste any code here. Example:\nimport os\nDEBUG = True\nSECRET_KEY = "changeme"\npassword = "admin123"\nquery = f"SELECT * FROM users WHERE id = '{user_id}'"\nos.system(f"ping {host}")`}
            className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 rounded-xl p-4 font-mono text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all resize-y leading-relaxed"
          />
        </form>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {results && <ScanResults results={results} />}
    </div>
  );
}