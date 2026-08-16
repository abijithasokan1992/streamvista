import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { PublicSignupRole } from "../services/auth/auth.types";

const PUBLIC_ROLES: {
  id: PublicSignupRole;
  label: string;
  detail: string;
  badge?: string;
}[] = [
  {
    id: "creator",
    label: "Creator Partner",
    detail: "Upload titles, drafts, and submit to QC",
  },
  {
    id: "buyer",
    label: "Buyer",
    detail: "Request screenings after admin verification",
  },
  {
    id: "investor",
    label: "Investor",
    detail: "Follow titles and pipeline interest — verification required",
  },
  {
    id: "studio",
    label: "Studio",
    detail: "Production operations workspace",
    badge: "Paid plans only",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [signupRole, setSignupRole] = useState<PublicSignupRole>("creator");
  const [studioPaidAck, setStudioPaidAck] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const next = params.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const needsOrg =
    signupRole === "buyer" || signupRole === "studio" || signupRole === "investor";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (createMode) {
        if (!["creator", "buyer", "investor", "studio"].includes(signupRole)) {
          setError("Select a valid account role.");
          return;
        }

        if (signupRole === "studio" && !studioPaidAck) {
          setError("Studio accounts require a paid plan. Confirm to continue — no free Studio start.");
          return;
        }

        const confirmationRequired = await signup({
          email,
          password,
          displayName,
          signupRole,
          organizationName: needsOrg ? organizationName : undefined,
        });

        if (confirmationRequired) {
          const roleMsg =
            signupRole === "buyer"
              ? "Check your email to confirm. Buyer access stays pending until admin verification."
              : signupRole === "studio"
                ? "Check your email to confirm. Studio workspace unlocks after paid plan activation — no free tier."
                : signupRole === "investor"
                  ? "Check your email to confirm. Investor access stays pending until verification."
                  : "Check your email to confirm the account, then sign in.";
          setMessage(roleMsg);
          setCreateMode(false);
          setPassword("");
          setStudioPaidAck(false);
          return;
        }

        if (signupRole === "studio") {
          setMessage("Studio account created. Activate a paid plan before production workspace access.");
        } else if (signupRole === "buyer" || signupRole === "investor") {
          setMessage("Account created. Access unlocks after verification.");
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
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4FC7] text-sm font-black text-white">
              S
            </span>
            STREAMVISTA
          </Link>
          <Link to="/home" className="text-sm font-medium text-zinc-600 hover:text-black">
            Return home
          </Link>
        </header>

        <section className="mx-auto my-auto w-full max-w-md py-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Secure access</p>
          <h1 className="text-4xl font-black tracking-[-0.05em]">
            {createMode ? "Create Account" : "Sign in"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {createMode
              ? "Create your secure StreamVista account."
              : "Access your StreamVista workspace for content, rights and distribution."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" autoComplete="off">
            {createMode && (
              <>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">
                    Display name
                  </span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    required
                    name="displayName"
                    autoComplete="name"
                    placeholder="Your name"
                    className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-black"
                  />
                </label>

                <fieldset className="block">
                  <legend className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">
                    Account role
                  </legend>
                  <p className="mb-3 text-xs leading-5 text-zinc-500">
                    Choose how you use StreamVista. Admin, QC, Legal and Finance stay invite-only.
                  </p>
                  <div className="grid gap-2">
                    {PUBLIC_ROLES.map((role) => {
                      const selected = signupRole === role.id;
                      return (
                        <label
                          key={role.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                            selected
                              ? "border-black bg-white shadow-sm"
                              : "border-black/10 bg-white/70 hover:border-black/25"
                          }`}
                        >
                          <input
                            type="radio"
                            name="signupRole"
                            value={role.id}
                            checked={selected}
                            onChange={() => {
                              setSignupRole(role.id);
                              if (role.id !== "studio") setStudioPaidAck(false);
                            }}
                            className="mt-1"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold">{role.label}</span>
                              {role.badge && (
                                <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FFC700]">
                                  {role.badge}
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-xs text-zinc-500">{role.detail}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {signupRole === "studio" && (
                  <label className="flex items-start gap-3 rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                    <input
                      type="checkbox"
                      checked={studioPaidAck}
                      onChange={(event) => setStudioPaidAck(event.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <strong>No free Studio start.</strong> Studio access requires a paid StreamVista plan.
                      Account can be created now; production workspace unlocks after plan activation.
                    </span>
                  </label>
                )}

                {needsOrg && (
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">
                      {signupRole === "investor"
                        ? "Fund / firm (optional)"
                        : "Company / studio / OTT"}
                    </span>
                    <input
                      value={organizationName}
                      onChange={(event) => setOrganizationName(event.target.value)}
                      name="organizationName"
                      autoComplete="organization"
                      placeholder="Optional"
                      className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-black"
                    />
                    {(signupRole === "buyer" || signupRole === "investor") && (
                      <span className="mt-2 block text-xs text-zinc-500">
                        Access stays pending until StreamVista verification.
                      </span>
                    )}
                  </label>
                )}
              </>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
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
                name="password"
                autoComplete={createMode ? "new-password" : "current-password"}
                placeholder="Minimum 8 characters"
                className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-black"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#FFC700] px-5 text-sm font-black text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait…" : createMode ? "Create Account" : "Sign in"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
              {message}
            </p>
          )}

          <button
            type="button"
            className="mt-5 w-full text-sm font-semibold text-[#1E4FC7] hover:underline"
            onClick={() => {
              setCreateMode((value) => !value);
              setError("");
              setMessage("");
              setPassword("");
              setStudioPaidAck(false);
            }}
          >
            {createMode ? "Already have an account? Sign in" : "Don’t have an account? Create Account"}
          </button>

          <div className="mt-8 space-y-2 border-t border-black/10 pt-5 text-xs text-zinc-500">
            <p>Secure access · Credentials are never prefilled or displayed.</p>
            <div className="flex items-center justify-between">
              <span>Studio = paid plans only · no free start</span>
              <a href="mailto:hello@streamvista.in" className="font-semibold text-zinc-700 hover:text-black">
                Need help?
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
