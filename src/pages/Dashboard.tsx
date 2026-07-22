import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back, {user?.displayName}</h1>
          <p className="text-slate-400">Here's what's happening with your titles today.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Titles</CardTitle>
            <CardDescription>Published and active titles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">21</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Drafts</CardTitle>
            <CardDescription>Titles currently in preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-brand-gold">139</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Screenings</CardTitle>
            <CardDescription>Awaiting buyer activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-brand-orange">34</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
