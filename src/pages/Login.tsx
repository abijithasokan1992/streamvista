import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PublicSignupRole } from "../types/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [signupRole, setSignupRole] = useState<PublicSignupRole | "">("");
  const [organizationName, setOrganizationName] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const next = params.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (createMode) {
        if (signupRole !== "creator" && signupRole !== "buyer") {
          setError("Choose Creator Partner or Buyer to continue.");
          return;
        }
        const confirmationRequired = await signup(
          email,
          password,
          displayName,
          signupRole,
          signupRole === "buyer" ? organizationName : undefined,
        );
        if (confirmationRequired) {
          setMessage(
            signupRole === "buyer"
              ? "Check your email to confirm the account. Buyer workspace access will be enabled after StreamVista verifies your organization."
              : "Check your email to confirm the account, then sign in.",
          );
          setCreateMode(false);
          return;
        }
        if (signupRole === "buyer") {
          navigate("/buyer-pending", { replace: true });
          return;
        }
      } else {
        await login(email, password);
      }
      navigate(safeNext, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-5 py-8 text-[#111111]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3 font-black tracking-[-0.04em] text-[#1E4FC7]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4FC7] text-sm font-black text-white">S</span>
            STREAMVISTA
          </Link>
          <Link to="/home" className="text-sm font-medium text-zinc-600 hover:text-black">Return home</Link>
        </header>

        <section className="mx-auto my-auto w-full max-w-md py-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Supabase secure access</p>
          <h1 className="text-4xl font-black tracking-[-0.05em]">{createMode ? "Create account" : "Sign in"}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Access StreamVista workspace, rights workflows and AI support.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {createMode && (
              <>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">Display name</span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-black"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">I am a...</span>
                  <select
                    value={signupRole}
                    onChange={(event) => setSignupRole(event.target.value as PublicSignupRole | "")}
                    required
                    className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-black"
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="creator">Creator Partner</option>
                    <option value="buyer">Buyer</option>
                  </select>
                  <span className="mt-2 block text-xs leading-5 text-zinc-500">
                    Finance, QC, Legal and admin access are invite-only and assigned by StreamVista.
                  </span>
                </label>

                {signupRole === "buyer" && (
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">Company / OTT platform <span className="normal-case tracking-normal text-zinc-400">(optional)</span></span>
                    <input
                      value={organizationName}
                      onChange={(event) => setOrganizationName(event.target.value)}
                      autoComplete="organization"
                      placeholder="Company or platform name"
                      className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-black"
                    />
                    <span className="mt-2 block text-xs leading-5 text-zinc-500">
                      Buyer accounts require StreamVista verification before buyer workspace access is enabled.
                    </span>
                  </label>
                )}
              </>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-black"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete={createMode ? "new-password" : "current-password"}
                className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-black"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#FFC700] px-5 text-sm font-black text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait…" : createMode ? "Create account" : "Sign in"}
            </button>
          </form>

          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
          {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">{message}</p>}

          <button
            type="button"
            className="mt-5 w-full text-sm font-semibold text-[#1E4FC7] hover:underline"
            onClick={() => {
              setCreateMode((value) => !value);
              setSignupRole("");
              setOrganizationName("");
              setError("");
              setMessage("");
            }}
          >
            {createMode ? "Already have an account? Sign in" : "Don’t have an account? Create account"}
          </button>

          <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-5 text-xs text-zinc-500">
            <span>Role is verified server-side</span>
            <a href="mailto:hello@streamvista.in" className="font-semibold text-zinc-700 hover:text-black">Need help?</a>
          </div>
        </section>
      </div>
    </main>
  );
}
