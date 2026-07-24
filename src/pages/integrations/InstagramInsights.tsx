/**
 * Instagram Insights Analytics View
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 */

import { useState, useEffect } from 'react';
import { instagramService } from '../../services/instagram/InstagramApiAdapter';
import { InstagramInsight, InstagramError } from '../../types/instagram';
import { BarChart2, RefreshCw, AlertTriangle } from 'lucide-react';

const WORKSPACE_ID = 'ws_crayons_bridge_main';

export default function InstagramInsightsView() {
  const [insights, setInsights] = useState<InstagramInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<InstagramError | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await instagramService.getInsights(WORKSPACE_ID);
        setInsights(data);
      } catch (err: unknown) {
        setError(err as InstagramError);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="animate-spin text-brand-gold mr-2" size={20} /> Fetching Account Insights...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <AlertTriangle size={20} /> Insights Notice [{error.code}]
        </div>
        <p className="text-xs text-slate-300">{error.message}</p>
        {error.reasoning && <p className="text-xs text-slate-400">Reason: {error.reasoning}</p>}
        {error.recommendation && <p className="text-xs text-amber-200/80">Recommendation: {error.recommendation}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="text-brand-gold" size={22} /> Professional Account Insights
        </h2>
        <span className="text-xs text-slate-400">Official Meta Graph Metrics</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((inMetric) => (
          <div key={inMetric.metricName} className="p-6 bg-brand-navy/40 border border-white/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{inMetric.metricName}</p>
              <p className="text-3xl font-extrabold text-white mt-1">{inMetric.metricValue.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-2">Period: {inMetric.period}</p>
            </div>
            <BarChart2 className="text-brand-gold opacity-80" size={32} />
          </div>
        ))}
      </div>
    </div>
  );
}
