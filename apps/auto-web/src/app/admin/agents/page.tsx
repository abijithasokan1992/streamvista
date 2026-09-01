'use client';

import { useState, useEffect } from 'react';
import { Bot, Sparkles, Zap, ShieldCheck, Activity, Terminal, RefreshCcw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

interface ActivityLog {
  agentName: string;
  action: string;
  thought: string;
  timestamp: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

export default function AICommandCenter() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchActivities = async () => {
    try {
      const { data } = await api.get('/agents/activities');
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch agent activities:', err);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await api.post('/agents/procurement/analyze');
      await fetchActivities();
    } catch (err) {
      console.error('Manual trigger failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Sparkles className="w-4 h-4 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Autonomic Layer</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">AI Command Center</h1>
          <p className="text-zinc-500 mt-1">Real-time monitoring and orchestration of in-app agents.</p>
        </div>
        <button 
          onClick={triggerAnalysis}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-zinc-900/10 active:scale-95 disabled:opacity-50"
        >
          {isAnalyzing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
          Trigger Systems Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-bold text-white">Live Agent Feed</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active</span>
              </div>
            </div>
            
            <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto font-mono custom-scrollbar">
              {activities.length > 0 ? (
                activities.map((log, idx) => (
                  <div key={idx} className="relative pl-8 border-l border-zinc-800 group">
                    <div className="absolute left-[-4.5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                        {log.agentName}
                      </span>
                      <span className="text-[10px] text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-zinc-100 text-sm font-bold mb-1">{log.action}</p>
                    <p className="text-zinc-500 text-xs leading-relaxed italic">&ldquo;{log.thought}&rdquo;</p>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4">
                  <Activity className="w-12 h-12 text-zinc-800 mx-auto animate-pulse" />
                  <p className="text-zinc-600 text-sm">Awaiting agent stimuli...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Active Personas</h2>
            <div className="space-y-4">
              <AgentPersonaCard 
                name="Procurement AI" 
                role="Stock Management" 
                status="Monitoring" 
                icon={<Bot className="w-5 h-5" />}
                color="blue"
              />
              <AgentPersonaCard 
                name="QC Specialist" 
                role="Visual Verification" 
                status="Idle" 
                icon={<ShieldCheck className="w-5 h-5" />}
                color="green"
              />
              <AgentPersonaCard 
                name="Logistics Optimiser" 
                role="Courier Routing" 
                status="Idle" 
                icon={<Zap className="w-5 h-5" />}
                color="orange"
              />
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20">
            <h3 className="font-bold mb-2">Did you know?</h3>
            <p className="text-blue-100 text-xs leading-relaxed">
              Your agents use Gemini 1.5 Flash to process database trends and visual data simultaneously, achieving a 40% faster fulfillment rate.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AgentPersonaCard({ name, role, status, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="p-4 rounded-2xl border border-zinc-100 hover:border-blue-100 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">{name}</p>
          <p className="text-[10px] text-zinc-400 font-medium">{role}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">{status}</span>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'Monitoring' ? 'bg-green-500 animate-pulse' : 'bg-zinc-200'}`} />
        </div>
      </div>
    </div>
  );
}
