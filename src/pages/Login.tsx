import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

export default function Login() {
  const [email, setEmail] = useState("owner@streamvista.com"); // default for testing
  const [password, setPassword] = useState("password");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-brand-gold shadow-lg shadow-brand-gold/20"></div>
            <span className="text-3xl font-bold tracking-tight text-white">StreamVista</span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full mt-6" isLoading={loading}>
                Sign In
              </Button>
            </form>
            <div className="mt-6 p-4 rounded bg-brand-navy-light/50 border border-white/5">
              <p className="text-xs text-slate-400 mb-2 font-medium">Demo Accounts:</p>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>owner@streamvista.com (Platform Owner)</li>
                <li>creator@example.com (Creator)</li>
                <li>buyer@example.com (Buyer)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
