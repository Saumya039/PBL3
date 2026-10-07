import { CheckCircle2, ExternalLink } from 'lucide-react';

export default function PatchSuggestion({ patch }) {
  if (!patch) return null;

  const originalCode = patch.original_code || patch.originalCode || patch.original;
  const patchedCode = patch.patched_code || patch.patchedCode || patch.patched;
  const references = patch.references || [];

  return (
    <div className="mt-6 border border-green-500/20 bg-green-950/10 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
        <h4 className="text-base font-mono font-bold text-green-400">Auto-Patch Suggestion</h4>
      </div>
      
      {patch.title && <p className="font-mono font-bold text-slate-100 text-sm">{patch.title}</p>}
      {patch.description && <p className="text-slate-300 text-sm leading-relaxed">{patch.description}</p>}
      
      {(originalCode || patchedCode) && (
        <div className="grid md:grid-cols-2 gap-4">
          {originalCode && (
            <div className="bg-slate-950 border border-red-500/30 rounded-lg overflow-hidden">
              <div className="bg-red-950/40 px-3 py-1.5 border-b border-red-500/30 text-xs font-mono text-red-400 uppercase tracking-wider">
                Vulnerable Code
              </div>
              <pre className="p-3 text-xs font-mono overflow-x-auto text-red-300 whitespace-pre-wrap break-words leading-relaxed">
                <code>{originalCode}</code>
              </pre>
            </div>
          )}
          {patchedCode && (
            <div className="bg-slate-950 border border-green-500/30 rounded-lg overflow-hidden">
              <div className="bg-green-950/40 px-3 py-1.5 border-b border-green-500/30 text-xs font-mono text-green-400 uppercase tracking-wider">
                Patched Code
              </div>
              <pre className="p-3 text-xs font-mono overflow-x-auto text-green-300 whitespace-pre-wrap break-words leading-relaxed">
                <code>{patchedCode}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {references && references.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">References</p>
          <ul className="space-y-1">
            {references.map((ref, idx) => {
              const url = typeof ref === 'string' ? ref : ref.url;
              const label = typeof ref === 'string' ? ref : (ref.title || ref.url);
              return (
                <li key={idx}>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono underline break-all"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
