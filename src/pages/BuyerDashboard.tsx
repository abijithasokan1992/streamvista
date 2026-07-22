import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { databaseService } from "../services/database";
import { Title } from "../types/title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Loader2, Play } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const data = await databaseService.getTitlesByBuyer(user.uid);
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
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Buyer Portal</h1>
          <p className="text-slate-400">Welcome, {user?.displayName}. Here are the titles assigned to you for screening.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-gold h-8 w-8" />
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Assigned Screenings</h2>
          {titles.length === 0 ? (
            <Card className="bg-brand-navy-light/30 border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-slate-400 mb-4">You have no titles assigned to you right now.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {titles.map(title => (
                <Card key={title.id} className="flex flex-col">
                  <CardHeader className="flex-1 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{title.contentType}</Badge>
                      <Badge variant="warning">Access Active</Badge>
                    </div>
                    <CardTitle className="text-xl">{title.title}</CardTitle>
                    <CardDescription className="line-clamp-3 mt-2">{title.synopsis}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-slate-400">Available Rights</span>
                      <span className="text-white font-medium">{title.rightsAvailable.length} types</span>
                    </div>
                    <Button variant="primary" className="w-full">
                      <Play size={16} className="mr-2" />
                      Start Screening
                    </Button>
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
