import VulnerabilityCard from './VulnerabilityCard';

export default function ScanResults({ scanResult, results }) {
  const data = scanResult || results;
  if (!data) return null;

  const { target, started_at, completed_at, date, summary, counts, vulnerabilities, patches } = data;

  // Build patch map if patches array is provided at root level
  const patchMap = {};
  if (Array.isArray(patches)) {
    patches.forEach((p) => {
      if (p.vulnerability_id) {
        patchMap[p.vulnerability_id] = p;
      }
    });
  }

  // Normalize summary counts
  const criticalCount = summary?.CRITICAL ?? counts?.critical ?? 0;
  const highCount = summary?.HIGH ?? counts?.high ?? 0;
  const mediumCount = summary?.MEDIUM ?? counts?.medium ?? 0;
  const lowCount = summary?.LOW ?? counts?.low ?? 0;
  const infoCount = summary?.INFO ?? counts?.info ?? 0;
  const totalCount = summary?.total ?? vulnerabilities?.length ?? 0;

  const displayDate = completed_at || started_at || date || new Date().toISOString();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-mono">Target</div>
            <div className="font-mono text-green-400 text-lg font-bold break-all">{target}</div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-mono">Timestamp</div>
            <div className="font-mono text-slate-300 text-sm">{new Date(displayDate).toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-4 rounded-lg text-center border border-red-500/30">
            <div className="text-2xl font-mono font-bold text-red-500">{criticalCount}</div>
            <div className="text-xs text-slate-400 font-mono uppercase mt-1">Critical</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-lg text-center border border-orange-500/30">
            <div className="text-2xl font-mono font-bold text-orange-400">{highCount}</div>
            <div className="text-xs text-slate-400 font-mono uppercase mt-1">High</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-lg text-center border border-yellow-500/30">
            <div className="text-2xl font-mono font-bold text-yellow-400">{mediumCount}</div>
            <div className="text-xs text-slate-400 font-mono uppercase mt-1">Medium</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-lg text-center border border-blue-500/30">
            <div className="text-2xl font-mono font-bold text-blue-400">{lowCount}</div>
            <div className="text-xs text-slate-400 font-mono uppercase mt-1">Low</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-lg text-center border border-slate-700">
            <div className="text-2xl font-mono font-bold text-slate-400">{infoCount}</div>
            <div className="text-xs text-slate-400 font-mono uppercase mt-1">Info</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-lg text-center border border-green-500/40 col-span-2 sm:col-span-1">
            <div className="text-2xl font-mono font-bold text-green-400">{totalCount}</div>
            <div className="text-xs text-slate-400 font-mono uppercase mt-1">Total</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-mono font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">
          Vulnerabilities Discovered ({vulnerabilities?.length || 0})
        </h3>
        {vulnerabilities && vulnerabilities.length > 0 ? (
          <div className="space-y-4">
            {vulnerabilities.map((vuln, idx) => {
              const matchedPatch = vuln.patch || (vuln.id ? patchMap[vuln.id] : null);
              return (
                <VulnerabilityCard 
                  key={vuln.id || idx} 
                  vuln={vuln} 
                  vulnerability={vuln}
                  patch={matchedPatch} 
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900 border border-green-500/30 rounded-xl text-green-400">
            <p className="font-mono text-lg font-bold">No vulnerabilities found. System secure.</p>
          </div>
        )}
      </div>
    </div>
  );
}
