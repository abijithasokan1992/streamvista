import { useEffect, useState } from "react";
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
  const [displayName, setDisplayName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [signupRole, setSignupRole] = useState<PublicSignupRole>("creator");
  const [studioPaidAck, setStudioPaidAck] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user, requestMagicLink, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const next = params.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const fromMagic = params.get("magic") === "1";

  const needsOrg =
    signupRole === "buyer" || signupRole === "studio" || signupRole === "investor";

  useEffect(() => {
    if (user) navigate(safeNext, { replace: true });
  }, [user, navigate, safeNext]);

  useEffect(() => {
    if (fromMagic && !user && !loading) {
      setMessage("Finishing secure sign-in… If this hangs, request a new magic link.");
    }
  }, [fromMagic, user, loading]);

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
        if (!displayName.trim()) {
          setError("Display name is required.");
          return;
        }

        await requestMagicLink({
          email,
          create: true,
          displayName,
          signupRole,
          organizationName: needsOrg ? organizationName : undefined,
        });

        const roleHint =
          signupRole === "buyer" || signupRole === "investor"
            ? " After you open the link, access may stay pending until verification."
            : signupRole === "studio"
              ? " Studio workspace unlocks after paid plan activation."
              : "";

        setMessage(
          `Magic link sent to ${email.trim().toLowerCase()}. Open it to enter StreamVista — no password.${roleHint}`,
        );
        return;
      }

      await requestMagicLink({ email, create: false });
      setMessage(`Magic link sent to ${email.trim().toLowerCase()}. Open it to continue — no password.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send magic link");
    }
  };

  return (
    <main className="min-h-screen bg-[#05050a] px-5 py-8 text-zinc-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3 font-black tracking-[-0.04em] text-white">
            <span className="h-8 w-8 rounded-full bg-[radial-gradient(circle_at_30%_25%,#ff8b49,#8757e7_46%,#25103e_78%)]" />
            STREAMVISTA
          </Link>
          <Link to="/home" className="text-sm font-medium text-zinc-500 hover:text-white">
            Return home
          </Link>
        </header>

        <section className="mx-auto my-auto w-full max-w-md py-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-violet-400/90">
            Passwordless · Magic link
          </p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-white">
            {createMode ? "Join StreamVista" : "Enter StreamVista"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {createMode
              ? "Your media assistant path starts with one email — no password to remember."
              : "We’ll email a secure magic link. One tap opens your workspace."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" autoComplete="off">
            {createMode && (
              <>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                    Display name
                  </span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    required
                    name="displayName"
                    autoComplete="name"
                    placeholder="Your name"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-violet-400/50"
                  />
                </label>

                <fieldset className="block">
                  <legend className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                    How you’ll use StreamVista
                  </legend>
                  <p className="mb-3 text-xs leading-5 text-zinc-500">
                    Your assistant uses this to open the right workspace. Admin roles stay invite-only.
                  </p>
                  <div className="grid gap-2">
                    {PUBLIC_ROLES.map((role) => {
                      const selected = signupRole === role.id;
                      return (
                        <label
                          key={role.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                            selected
                              ? "border-violet-400/40 bg-violet-500/10"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20"
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
                              <span className="text-sm font-bold text-zinc-100">{role.label}</span>
                              {role.badge && (
                                <span className="rounded-full bg-[#FFC700] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
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
                  <label className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    <input
                      type="checkbox"
                      checked={studioPaidAck}
                      onChange={(event) => setStudioPaidAck(event.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <strong>No free Studio start.</strong> Paid plan required before production workspace.
                    </span>
                  </label>
                )}

                {needsOrg && (
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                      {signupRole === "investor" ? "Fund / firm (optional)" : "Company / studio / OTT"}
                    </span>
                    <input
                      value={organizationName}
                      onChange={(event) => setOrganizationName(event.target.value)}
                      name="organizationName"
                      autoComplete="organization"
                      placeholder="Optional"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-violet-400/50"
                    />
                  </label>
                )}
              </>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
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
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-violet-400/50"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-400 to-orange-400 px-5 text-sm font-black text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending…” : “Email me a magic link”}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100" role="status">
              {message}
            </p>
          )}

          <button
            type="button"
            className="mt-5 w-full text-sm font-semibold text-violet-300 hover:text-white"
            onClick={() => {
              setCreateMode((value) => !value);
              setError("");
              setMessage("");
              setStudioPaidAck(false);
            }}
          >
            {createMode ? "Already with us? Email a sign-in link" : "New here? Join with a magic link"}
          </button>

          <div className="mt-8 space-y-2 border-t border-white/10 pt-5 text-xs text-zinc-500">
            <p>No password. Your assistant guides the path — Supabase verifies the link.</p>
            <p>AI never holds your credentials. Role and access stay server-enforced.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
