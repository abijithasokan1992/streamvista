import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        try {
          const data = await databaseService.getTitlesByCreator(user.uid);
          setTitles(data);
        } catch {
          setTitles([]);
        }
      }
      setLoading(false);
    }
    void load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Creator Hub</h1>
          <p className="text-slate-500">
            Welcome, {user?.displayName}. P0 path: title → metadata → poster upload.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/titles"
            className="rounded-xl bg-[#150b20] px-4 py-2.5 text-sm font-bold text-white"
          >
            Manage titles
          </Link>
          <Link
            to="/uploads"
            className="rounded-xl bg-[#FFC700] px-4 py-2.5 text-sm font-bold text-black"
          >
            Upload poster
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      ) : (
        <>
          <h2 className="mb-4 mt-4 text-xl font-semibold text-slate-900">My Titles</h2>
          {titles.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="mb-4 text-slate-500">No titles yet under your account (RLS shows only your rows).</p>
                <Link to="/titles" className="rounded-xl bg-[#FFC700] px-4 py-2 text-sm font-bold text-black">
                  Create first title
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {titles.map((title) => (
                <Card key={title.id}>
                  <CardHeader>
                    <div className="mb-2 flex items-start justify-between">
                      <Badge variant="outline">{title.contentType}</Badge>
                      <Badge variant="success">{title.status}</Badge>
                    </div>
                    <CardTitle className="line-clamp-1 text-xl">{title.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">{title.synopsis}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">QC Status</span>
                      <span className="font-medium capitalize text-slate-800">{title.qcStatus}</span>
                    </div>
                    <Link
                      to="/uploads"
                      className="mt-3 inline-block text-sm font-semibold text-violet-700 hover:underline"
                    >
                      Upload assets →
                    </Link>
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
