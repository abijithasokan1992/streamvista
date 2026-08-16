import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function BuyerPending() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-5 py-8 text-[#111111]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col">
        <header className="flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3 font-black tracking-[-0.04em] text-[#1E4FC7]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E4FC7] text-sm font-black text-white">S</span>
            STREAMVISTA
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-sm font-semibold text-zinc-600 hover:text-black"
          >
            Sign out
          </button>
        </header>

        <section className="my-auto rounded-3xl border border-black/10 bg-white p-8 shadow-sm md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1E4FC7]">Buyer verification</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">Your buyer account is under review.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
            StreamVista verifies buyer organizations before enabling catalogue, screening, licensing and commercial workspace access.
          </p>

          <dl className="mt-8 grid gap-4 rounded-2xl bg-[#F9F6F0] p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-bold text-zinc-500">Account</dt>
              <dd className="mt-1 font-semibold">{user?.email}</dd>
            </div>
            <div>
              <dt className="font-bold text-zinc-500">Organization</dt>
              <dd className="mt-1 font-semibold">{user?.organizationName || "Not provided"}</dd>
            </div>
            <div>
              <dt className="font-bold text-zinc-500">Role</dt>
              <dd className="mt-1 font-semibold">Buyer</dd>
            </div>
            <div>
              <dt className="font-bold text-zinc-500">Status</dt>
              <dd className="mt-1 font-semibold capitalize">{user?.verificationStatus || "pending"}</dd>
            </div>
          </dl>

          <p className="mt-6 text-sm leading-6 text-zinc-500">
            Need to update your company details? Contact <a className="font-semibold text-[#1E4FC7] hover:underline" href="mailto:hello@streamvista.in">hello@streamvista.in</a> from your registered email.
          </p>
        </section>
      </div>
    </main>
  );
}
