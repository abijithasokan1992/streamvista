import { Bot, ExternalLink } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Product workspace</p>
          <h1 className="display-title mt-2">Welcome back, {user?.displayName}</h1>
          <p className="text-slate-400">Here's what's happening with your titles today.</p>
        </div>
        <a
          href="https://chat.streamvista.in/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFC700] px-5 py-3 text-sm font-bold text-black transition hover:brightness-95"
        >
          <Bot size={17} />
          Open StreamVista AI
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Titles</CardTitle>
            <CardDescription>Published and active titles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-950">21</p>
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
