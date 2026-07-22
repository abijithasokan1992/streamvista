import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Film, Users, PlayCircle, Activity } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  
  const stats = [
    { label: "Active Titles", value: "24", icon: <Film size={24} className="text-brand-orange" /> },
    { label: "Total Users", value: "156", icon: <Users size={24} className="text-blue-500" /> },
    { label: "Screenings", value: "892", icon: <PlayCircle size={24} className="text-emerald-500" /> },
    { label: "Avg Engagement", value: "78%", icon: <Activity size={24} className="text-brand-gold" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Mission Control</h1>
          <p className="text-slate-400">Welcome back, {user?.displayName}. Here is the overview of your platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-brand-navy-light/40 border-brand-navy-light">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-black/40 flex items-center justify-center border border-white/5">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-brand-navy-light/40 border-brand-navy-light">
          <CardHeader>
            <CardTitle>Total Titles</CardTitle>
            <CardDescription>Published and active titles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">21</p>
          </CardContent>
        </Card>
        
        <Card className="bg-brand-navy-light/40 border-brand-navy-light">
          <CardHeader>
            <CardTitle>Active Drafts</CardTitle>
            <CardDescription>Titles currently in preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-brand-gold">139</p>
          </CardContent>
        </Card>
        
        <Card className="bg-brand-navy-light/40 border-brand-navy-light">
          <CardHeader>
            <CardTitle>Pending Screenings</CardTitle>
            <CardDescription>Awaiting buyer activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-brand-orange">34</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <Card className="bg-brand-navy-light/40 border-brand-navy-light">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm">Activity feed will be populated by the auditLog service.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
