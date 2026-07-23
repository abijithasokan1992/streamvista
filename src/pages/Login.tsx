import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

export default function Login() {
  const [email, setEmail] = useState("owner@streamvista.com"); // default for testing
  const [password, setPassword] = useState("password");
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Authentication failed.");
    }
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
            <CardTitle className="text-2xl">{isRegistering ? "Create Account" : "Sign In"}</CardTitle>
            <CardDescription>
              {isRegistering ? "Register for a new StreamVista buyer account." : "Enter your credentials to access the platform."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <Input
                  label="Display Name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              )}
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
                {isRegistering ? "Register" : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={() => setIsRegistering(!isRegistering)} 
                className="text-sm text-brand-gold hover:underline"
              >
                {isRegistering ? "Already have an account? Sign in" : "Need an account? Register as Buyer"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
