import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { databaseService } from "../services/database";
import { Title } from "../types/title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Loader2 } from "lucide-react";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const data = await databaseService.getTitlesByCreator(user.uid);
        setTitles(data);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Creator Hub</h1>
          <p className="text-slate-400">Welcome, {user?.displayName}. Manage your portfolio and track performance.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-gold h-8 w-8" />
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">My Titles</h2>
          {titles.length === 0 ? (
            <Card className="bg-brand-navy-light/30 border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-slate-400 mb-4">You haven't uploaded any titles yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {titles.map(title => (
                <Card key={title.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{title.contentType}</Badge>
                      <Badge variant="success">{title.status}</Badge>
                    </div>
                    <CardTitle className="line-clamp-1 text-xl">{title.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">{title.synopsis}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">QC Status</span>
                      <span className="text-white font-medium capitalize">{title.qcStatus}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
