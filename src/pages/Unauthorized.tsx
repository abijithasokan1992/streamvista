import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
        <ShieldAlert size={32} />
      </div>
      <h1 className="text-3xl font-bold text-white">Access Denied</h1>
      <p className="text-slate-400 max-w-md">
        You do not have permission to view this page. If you believe this is an error, please contact your administrator.
      </p>
      <div className="mt-4">
        <Button variant="primary">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
