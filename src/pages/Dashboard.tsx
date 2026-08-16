import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import {
  listScreeningRequests,
  listTitlesByStatus,
  setTitleStatus,
  updateScreeningStatus,
  type MarketplaceTitle,
  type ScreeningRequest,
} from "../services/marketplace";

function isAdminRole(role?: string) {
  return role === "admin" || role === "founder" || role === "super_admin" || role === "platform_owner";
}

function isCreatorRole(role?: string) {
  return role === "creator_partner" || isAdminRole(role);
}

function isBuyerRole(role?: string) {
  return role === "buyer" || isAdminRole(role);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [pending, setPending] = useState<MarketplaceTitle[]>([]);
  const [screenings, setScreenings] = useState<ScreeningRequest[]>([]);
  const role = user?.role;

  async function refresh() {
    try {
      const [q, s] = await Promise.all([listTitlesByStatus("qc"), listScreeningRequests()]);
      setPending(q);
      setScreenings(s);
    } catch {
      setPending([]);
      setScreenings([]);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const requested = screenings.filter((s) => s.status === "requested");

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Product workspace</p>
        <h1 className="display-title mt-2">Welcome back, {user?.displayName || "there"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Role: <span className="font-semibold text-slate-800">{role || "unknown"}</span>
          {" · "}
          Magic link session · RBAC + RLS protect data
        </p>
      </div>

      {/* Role-specific next steps for P0 */}
      {isCreatorRole(role) && !isAdminRole(role) && (
        <section className="rounded-2xl border border-violet-200 bg-violet-50/80 p-5">
          <h2 className="text-lg font-bold text-slate-900">Creator path (P0)</h2>
          <p className="mt-1 text-sm text-slate-600">Create a title, save metadata, upload a poster under your title folder.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/titles" className="rounded-xl bg-[#150b20] px-4 py-2.5 text-sm font-bold text-white">
              Titles
            </Link>
            <Link to="/uploads" className="rounded-xl bg-[#FFC700] px-4 py-2.5 text-sm font-bold text-black">
              Uploads / poster
            </Link>
            <Link to="/drafts" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800">
              Drafts
            </Link>
            <Link to="/creator" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800">
              Creator hub
            </Link>
          </div>
        </section>
      )}

      {role === "buyer" && (
        <section className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5">
          <h2 className="text-lg font-bold text-slate-900">Buyer path</h2>
          <p className="mt-1 text-sm text-slate-600">
            Access to approved titles and screenings depends on verification. Pending buyers stay fail-closed until admin
            approval.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/buyer" className="rounded-xl bg-[#150b20] px-4 py-2.5 text-sm font-bold text-white">
              Buyer hub
            </Link>
            <Link to="/screenings" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800">
              Screenings
            </Link>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your role</CardTitle>
            <CardDescription>From server profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize text-slate-950">{role || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>QC queue</CardTitle>
            <CardDescription>Titles in QC (if visible)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-950">{pending.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Screening requests</CardTitle>
            <CardDescription>Visible to you under RLS</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-950">{requested.length}</p>
          </CardContent>
        </Card>
      </div>

      {isAdminRole(role) && (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-950">Founder approval</h2>
            {pending.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
                <div>
                  <b>{t.payload?.title || t.id.slice(0, 8)}</b>
                  <p className="text-xs text-slate-500">QC approved · ready for decision</p>
                </div>
                <button
                  type="button"
                  onClick={() => void setTitleStatus(t.id, "approved").then(refresh)}
                  className="rounded-lg bg-[#FFC700] px-3 py-2 text-sm font-bold"
                >
                  Approve → Ready for OTT
                </button>
              </div>
            ))}
            {!pending.length && (
              <p className="rounded-xl bg-white p-4 text-sm text-slate-500">No titles awaiting Founder approval.</p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-950">Screening approvals</h2>
            {requested.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
                <div>
                  <b>{s.title?.payload?.title || `Title ${s.title_id.slice(0, 8)}`}</b>
                  <p className="text-xs text-slate-500">Buyer {s.buyer_id.slice(0, 8)} · requested</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void updateScreeningStatus(s.id, "approved").then(refresh)}
                    className="rounded-lg bg-[#FFC700] px-3 py-2 text-sm font-bold"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateScreeningStatus(s.id, "declined").then(refresh)}
                    className="rounded-lg border px-3 py-2 text-sm font-bold"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
            {!requested.length && (
              <p className="rounded-xl bg-white p-4 text-sm text-slate-500">No screening requests awaiting approval.</p>
            )}
          </section>
        </>
      )}

      {!isAdminRole(role) && !isCreatorRole(role) && role !== "buyer" && (
        <p className="rounded-xl border bg-white p-4 text-sm text-slate-600">
          Limited workspace for this role. Contact StreamVista if you need creator or buyer access.
        </p>
      )}
    </div>
  );
}
