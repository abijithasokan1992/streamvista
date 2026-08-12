import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Film, Scale, ShieldCheck, UploadCloud, WalletCards } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createTitleDraft, listCreatorTitles, listTitlesByStatus, requestLicense, requestScreening, setTitleStatus, type MarketplaceTitle } from "../services/marketplace";
import { storage } from "../services/storage";

type WorkspaceType = "creator" | "buyer" | "studio";

function CreatorWorkspace() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<MarketplaceTitle[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() { if (user) setTitles(await listCreatorTitles(user.uid)); }
  useEffect(() => { void refresh().catch((e) => setMessage(e.message)); }, [user?.uid]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!user) return; setBusy(true); setMessage("");
    try {
      const form = new FormData(event.currentTarget); const file = form.get("film") as File;
      if (!file?.size) throw new Error("Full film file is required");
      const path = `${user.uid}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const filmPath = await storage.upload(file, path);
      await createTitleDraft(user.uid, { title: String(form.get("title") || ""), synopsis: String(form.get("synopsis") || ""), trailer_url: String(form.get("trailer") || ""), film_path: filmPath, language: String(form.get("language") || "Malayalam"), price: Number(form.get("price") || 0), rights: { territory: String(form.get("territory") || "India"), duration: String(form.get("duration") || "12 months") }, workflow_version: "b2b-final-v1" });
      event.currentTarget.reset(); setMessage("Saved as Draft. Submit it to QC when ready."); await refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Upload failed"); } finally { setBusy(false); }
  }
  return <div className="space-y-7"><div><p className="eyebrow">Creator workspace</p><h1 className="display-title mt-2">Create & distribute</h1><p className="mt-2 text-slate-500">Upload a rights-ready film, save as Draft, then submit to QC.</p></div>
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
      <input name="title" required defaultValue="Jananam 1947 Pranayam Thudarunnu" placeholder="Title" className="rounded-xl border p-3"/><input name="language" defaultValue="Malayalam" placeholder="Language" className="rounded-xl border p-3"/><textarea name="synopsis" required placeholder="Synopsis" className="rounded-xl border p-3 md:col-span-2"/><input name="trailer" type="url" placeholder="Trailer URL" className="rounded-xl border p-3"/><input name="film" type="file" accept="video/*" required className="rounded-xl border p-3"/><input name="territory" defaultValue="India" placeholder="Rights territory" className="rounded-xl border p-3"/><input name="duration" defaultValue="12 months" placeholder="Rights duration" className="rounded-xl border p-3"/><input name="price" type="number" min="0" placeholder="License price" className="rounded-xl border p-3"/><button disabled={busy} className="rounded-xl bg-black p-3 font-bold text-white">{busy ? "Saving…" : "Save Draft"}</button>
    </form>{message && <p className="text-sm text-slate-600">{message}</p>}
    <div className="space-y-3">{titles.map(t => <div key={t.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"><div><b>{t.payload.title}</b><p className="text-xs text-slate-500">{t.status} · {t.payload.language}</p></div>{t.status === "draft" && <button onClick={() => void setTitleStatus(t.id,"submitted").then(refresh)} className="rounded-lg bg-[#FFC700] px-3 py-2 text-sm font-bold">Submit to QC</button>}</div>)}</div>
  </div>;
}

function BuyerWorkspace() {
  const { user } = useAuth(); const [titles,setTitles]=useState<MarketplaceTitle[]>([]); const [message,setMessage]=useState("");
  useEffect(()=>{ void listTitlesByStatus("approved").then(setTitles).catch(e=>setMessage(e.message)); },[]);
  return <div className="space-y-7"><div><p className="eyebrow">Buyer workspace</p><h1 className="display-title mt-2">Discover & license</h1><p className="mt-2 text-slate-500">Approved titles ready for OTT screening and licensing.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{titles.map(t=><article key={t.id} className="rounded-2xl border bg-white p-5"><div className="aspect-video rounded-xl bg-slate-900"/><h2 className="mt-4 text-xl font-bold">{t.payload.title}</h2><p className="mt-2 text-sm text-slate-500">{t.payload.synopsis}</p><p className="mt-3 text-xs">{t.payload.language} · {t.payload.rights?.territory} · ₹{Number(t.payload.price||0).toLocaleString("en-IN")}</p><div className="mt-4 flex gap-2"><button onClick={()=>user&&void requestScreening(user.uid,t.id).then(()=>setMessage("Screening requested."))} className="rounded-lg border px-3 py-2 text-sm font-semibold">Request Screening</button><button onClick={()=>user&&void requestLicense(user.uid,t).then(()=>setMessage("Licensing deal opened."))} className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white">License</button></div></article>)}</div>{!titles.length&&!message&&<p className="rounded-xl bg-white p-5 text-slate-500">No approved titles are visible to this buyer yet.</p>}{message&&<p className="text-sm text-slate-600">{message}</p>}</div>;
}

function StudioWorkspace(){const cards=[["Production","/titles",Film],["QC Review","/qc",ShieldCheck],["Legal","/legal",Scale],["Payments","/payments",WalletCards]] as const;return <div className="space-y-7"><div><p className="eyebrow">Studio workspace</p><h1 className="display-title mt-2">Production operations</h1></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label,path,Icon])=><Link key={label} to={path} className="rounded-2xl border bg-white p-5"><Icon/><p className="mt-4 font-bold">{label}</p></Link>)}</div></div>}

export default function WorkspaceLanding({type}:{type:WorkspaceType}){if(type==="creator")return <CreatorWorkspace/>;if(type==="buyer")return <BuyerWorkspace/>;return <StudioWorkspace/>;}
