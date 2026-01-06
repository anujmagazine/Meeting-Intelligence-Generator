
import React, { useRef, useState } from 'react';
import { MeetingAnalysis } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CheckCircle2, AlertCircle, Sparkles, TrendingUp, Users, Target, FileDown } from 'lucide-react';

interface Props {
  data: MeetingAnalysis;
}

const AnalysisDashboard: React.FC<Props> = ({ data }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    const html2pdf = (window as any).html2pdf;
    if (!dashboardRef.current || !html2pdf) {
      console.error('PDF library or dashboard element not found');
      return;
    }
    
    setIsExporting(true);
    
    // We target a clone or ensure the current element is styled correctly for capture
    const element = dashboardRef.current;
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Lumina_Analysis_${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#0f172a', // Ensure background is solid for the PDF
        scrollY: 0,
        windowWidth: 1200 // Force a desktop-like width for better layout in PDF
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // Small delay to ensure any dynamic styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={dashboardRef} className="space-y-8 pb-12 animate-in fade-in duration-700 bg-slate-950 p-4 rounded-3xl">
      {/* Header Info */}
      <div className="glass p-8 rounded-3xl border-l-4 border-blue-500">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-display font-bold mb-2 tracking-tight text-white">{data.title}</h1>
            <p className="text-slate-400 font-medium">{data.date || "Session Analysis"}</p>
          </div>
          <div className="flex items-center gap-3 no-print" data-html2canvas-ignore="true">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-2xl text-sm font-bold border border-white/10 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileDown size={18} className="text-blue-400" />
                  Download Report
                </>
              )}
            </button>
            <div className="bg-blue-500/10 text-blue-400 px-4 py-2.5 rounded-2xl text-sm font-semibold border border-blue-500/20 whitespace-nowrap">
              Review Complete
            </div>
          </div>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed max-w-4xl">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deep Insights */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass p-8 rounded-3xl border-l-4 border-purple-500">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-white">
              <Sparkles className="text-purple-400" /> Deep Insights & Non-Obvious Patterns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.deepInsights.map((insight, idx) => (
                <div key={idx} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
                      {insight.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-100">{insight.insight}</h3>
                  <p className="text-sm text-slate-400 mb-4 italic">"Evidence: {insight.evidence}"</p>
                  <div className="mt-auto">
                    <p className="text-sm font-semibold text-slate-300">Significance:</p>
                    <p className="text-sm text-slate-400">{insight.significance}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass p-8 rounded-3xl border-l-4 border-indigo-500">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-white">
              <TrendingUp className="text-indigo-400" /> Sentiment & Engagement Flow
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sentimentTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis domain={[-1, 1]} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="#818cf8" 
                    strokeWidth={4} 
                    dot={{ fill: '#818cf8', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {data.sentimentTimeline.map((s, i) => (
                <div key={i} className="flex-shrink-0 bg-slate-800/40 px-3 py-1 rounded-full text-xs text-slate-400 border border-slate-700">
                  {s.time}: {s.label}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <section className="glass p-6 rounded-3xl">
            <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-white">
              <CheckCircle2 className="text-emerald-400" /> Key Decisions
            </h2>
            <ul className="space-y-3">
              {data.decisions.map((decision, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-medium">{decision}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass p-6 rounded-3xl">
            <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-white">
              <AlertCircle className="text-orange-400" /> Action Items
            </h2>
            <div className="space-y-4">
              {data.actionItems.map((item, idx) => (
                <div key={idx} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                  <p className="font-bold text-slate-100 text-sm mb-1">{item.task}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 flex items-center gap-1">
                      <Users size={12} /> {item.owner}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.priority === 'High' ? 'bg-red-400/10 text-red-400' : 
                      item.priority === 'Medium' ? 'bg-orange-400/10 text-orange-400' : 'bg-slate-400/10 text-slate-400'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass p-6 rounded-3xl">
             <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-white">
              <Users className="text-pink-400" /> Dynamics
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-pink-500/30 pl-4">
              {data.unspokenDynamics}
            </p>
          </section>
        </div>
      </div>

      {/* Strategic Footer */}
      <div className="glass p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/5">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="p-4 bg-white/5 rounded-2xl">
            <Target className="w-12 h-12 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold mb-2 text-white">Strategic Context</h3>
            <p className="text-slate-300 leading-relaxed">{data.strategicAlignment}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
