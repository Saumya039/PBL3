export default function SeverityBadge({ severity }) {
  const normalizedSeverity = severity?.toUpperCase() || 'INFO';
  
  const styles = {
    CRITICAL: 'bg-red-600 text-white animate-pulse',
    HIGH: 'bg-orange-500 text-white',
    MEDIUM: 'bg-yellow-500 text-slate-950 font-extrabold',
    LOW: 'bg-blue-500 text-white',
    INFO: 'bg-slate-700 text-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wide ${styles[normalizedSeverity] || styles.INFO}`}>
      {normalizedSeverity}
    </span>
  );
}
