import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Loader2, Search, Activity } from "lucide-react";
import { Input } from "../components/ui/Input";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../services/firebase";

export default function AuditExplorer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        const q = query(collection(db, "audit_events"), orderBy("timestamp", "desc"), limit(50));
        const snapshot = await getDocs(q);
        setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error("Failed to load audit logs", e);
      }
      setLoading(false);
    }
    loadLogs();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold h-12 w-12" /></div>;

  const filteredLogs = logs.filter(log => 
    JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Audit Explorer</h1>
        <p className="text-slate-400">System-wide immutable audit trail of all platform activities.</p>
      </div>

      <Card className="bg-brand-navy border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-brand-orange" size={20} />
            Recent Activity
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 text-slate-500" size={16} />
            <Input 
              placeholder="Search logs..." 
              className="pl-8 bg-black/40 border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-black/40 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">User/System ID</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {new Date(log.timestamp?.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs bg-brand-navy">{log.event}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{log.userId || log.details?.userId || 'system'}</td>
                    <td className="px-4 py-3">
                      <pre className="text-[10px] overflow-x-auto text-slate-400 bg-black/50 p-2 rounded">
                        {JSON.stringify(log.details || log, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No audit events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
