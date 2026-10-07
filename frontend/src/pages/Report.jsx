import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Download } from 'lucide-react';
import ScanResults from '../components/ScanResults';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/scan/${id}`);
        if (!response.ok) {
          throw new Error('Report not found');
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err.message);
        // Mock data
        setReport({
          id,
          target: "https://example.com/api",
          date: new Date().toISOString(),
          counts: { critical: 2, high: 1, medium: 4, low: 2, info: 5 },
          vulnerabilities: [
            {
              title: "Broken Access Control",
              severity: "CRITICAL",
              description: "API endpoints are accessible without proper authorization checks.",
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-accent font-mono animate-pulse">Loading Report data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-textMuted hover:text-textPrimary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-textPrimary rounded hover:bg-secondary/80 transition-colors cursor-pointer border border-secondary hover:border-accent">
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="flex items-center gap-4 border-b border-secondary pb-6">
        <div className="p-3 bg-secondary/50 rounded-full">
          <FileText className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-mono font-bold text-textPrimary">Scan Report</h1>
          <p className="text-textMuted font-mono text-sm mt-1">ID: {id}</p>
        </div>
      </div>

      {report && <ScanResults scanResult={report} />}
    </div>
  );
}
