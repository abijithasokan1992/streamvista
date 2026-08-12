import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");setMessage("");
    try {
      if(createMode){const confirmationRequired=await signup(email,password,displayName);if(confirmationRequired){setMessage("Check your email to confirm the account, then sign in.");setCreateMode(false);return;}}
      else await login(email, password);
      navigate("/dashboard");
    } catch(e){setError(e instanceof Error?e.message:"Authentication failed");}
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600 shadow-lg shadow-violet-200"></div>
            <span className="text-3xl font-bold tracking-tight text-slate-950">StreamVista</span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{createMode?"Create Account":"Sign In"}</CardTitle>
            <CardDescription>{createMode?"Create your secure StreamVista account.":"Enter your credentials to access the platform."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {createMode&&<Input label="Display name" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} required />}
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
                {createMode?"Create Account":"Sign In"}
              </Button>
            </form>
            {error&&<p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
            {message&&<p className="mt-4 text-sm text-emerald-700" role="status">{message}</p>}
            <button type="button" className="mt-4 w-full text-sm text-violet-700 hover:underline" onClick={()=>{setCreateMode(!createMode);setError("");setMessage("");}}>{createMode?"Already have an account? Sign in":"Don’t have an account? Create account"}</button>
            <p className="mt-6 text-center text-xs text-slate-500">Secure access · Credentials are never prefilled or displayed.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
