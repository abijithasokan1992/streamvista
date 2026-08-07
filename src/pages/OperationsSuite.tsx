import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  FileText,
  GitBranch,
  Globe2,
  Layers3,
  Mail,
  PlugZap,
  Radio,
  Rocket,
  Search,
  ShieldCheck,
  Target,
  Users,
  Workflow,
} from "lucide-react";

type ModuleKey = "projects" | "agents" | "tasks" | "revenue" | "devops" | "integrations" | "reports";

const modules = [
  { key: "projects" as ModuleKey, name: "Project Manager", icon: Layers3 },
  { key: "agents" as ModuleKey, name: "Agent Registry", icon: Bot },
  { key: "tasks" as ModuleKey, name: "Execution Queue", icon: Workflow },
  { key: "revenue" as ModuleKey, name: "Revenue Pipeline", icon: CircleDollarSign },
  { key: "devops" as ModuleKey, name: "DevOps Rescue", icon: Rocket },
  { key: "integrations" as ModuleKey, name: "Integrations", icon: PlugZap },
  { key: "reports" as ModuleKey, name: "Reports", icon: FileText },
];

const projects = [
  { name: "Crayons Bridge", code: "CB", priority: "Immediate Revenue", owner: "Content + Revenue Agents", health: "Active" },
  { name: "DevOps Rescue", code: "OPS", priority: "Fast Cash", owner: "DevOps + Revenue Agents", health: "Launch Ready" },
  { name: "StreamVista Platform", code: "SV", priority: "Core Asset", owner: "Product + DevOps Agents", health: "Building" },
  { name: "Union Auto AI", code: "UAS", priority: "Internal Scale", owner: "Product Agent", health: "Planned" },
];

const agents = [
  { name: "Chief Operator", mission: "Priority, routing and owner brief", status: "Active", utilization: "72%" },
  { name: "Revenue Agent", mission: "Leads, offers, follow-up and cash", status: "Active", utilization: "64%" },
  { name: "Content Agent", mission: "Rights, catalogue and buyer packaging", status: "Active", utilization: "58%" },
  { name: "DevOps Agent", mission: "GitHub, CI, Vercel and recovery", status: "Ready", utilization: "49%" },
  { name: "Product Agent", mission: "Feature build and product execution", status: "Ready", utilization: "44%" },
  { name: "Research Agent", mission: "Market and opportunity intelligence", status: "Ready", utilization: "31%" },
  { name: "QA Agent", mission: "Acceptance checks and regression gate", status: "Ready", utilization: "28%" },
  { name: "Report Agent", mission: "Client and owner-ready output", status: "Ready", utilization: "22%" },
];

const initialTasks = [
  { id: 1, title: "Package DevOps Audit paid offer", owner: "Revenue Agent", priority: "P0", status: "Ready" },
  { id: 2, title: "Run GitHub / Vercel duplication audit", owner: "DevOps Agent", priority: "P0", status: "Done" },
  { id: 3, title: "Prepare first client audit report template", owner: "Report Agent", priority: "P0", status: "Ready" },
  { id: 4, title: "Package top Crayons Bridge titles for buyer outreach", owner: "Content Agent", priority: "P0", status: "In Progress" },
  { id: 5, title: "Verify production routes and recovery checklist", owner: "QA Agent", priority: "P1", status: "Ready" },
];

const revenue = [
  { lane: "Immediate Close", value: "Highest", item: "Active licensing conversations", next: "Package + follow-up" },
  { lane: "Immediate Money", value: "High", item: "DevOps Audit & Rescue", next: "Sell first paid audit" },
  { lane: "High-Value Client", value: "High", item: "Enterprise licensing / platform", next: "Qualified proposal" },
];

const devopsChecks = [
  { area: "GitHub", state: "Connected", detail: "Repo, PR, branch and Actions audit" },
  { area: "Vercel", state: "Connected", detail: "Projects, deployments, build and runtime logs" },
  { area: "Cloudflare", state: "Pending runtime", detail: "DNS, SSL, cache and Worker checks" },
  { area: "Security", state: "Ready", detail: "Secrets, permissions, dependency and release checklist" },
];

const integrations = [
  { name: "GitHub", state: "Connected", icon: GitBranch },
  { name: "Vercel", state: "Connected", icon: Rocket },
  { name: "Gmail", state: "Available", icon: Mail },
  { name: "Google Drive", state: "Available", icon: FileText },
  { name: "Razorpay", state: "Available", icon: CircleDollarSign },
  { name: "Supabase", state: "Available", icon: Cloud },
  { name: "Cloudflare", state: "Runtime connection required", icon: Globe2 },
  { name: "Task Systems", state: "Available", icon: Workflow },
];

function Pill({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "slate" }) {
  const cls = tone === "green"
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
    : tone === "amber"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
      : "border-white/10 bg-white/[0.04] text-slate-300";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

export default function OperationsSuite() {
  const [active, setActive] = useState<ModuleKey>("projects");
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState(initialTasks);

  const filteredTasks = useMemo(() => tasks.filter(t => `${t.title} ${t.owner} ${t.status}`.toLowerCase().includes(query.toLowerCase())), [tasks, query]);

  const cycleTask = (id: number) => {
    setTasks(current => current.map(task => task.id === id
      ? { ...task, status: task.status === "Ready" ? "In Progress" : task.status === "In Progress" ? "Done" : "Ready" }
      : task));
  };

  return (
    <div className="space-y-6 pb-12">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 xl:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2"><Pill>OPERATIONS SUITE ACTIVE</Pill><span className="text-xs uppercase tracking-[0.2em] text-slate-500">StreamVista AI Workforce</span></div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">Application Control Center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">Projects, agents, execution, revenue, DevOps recovery, integrations and reporting in one operating surface.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-xs text-slate-500">Modules</div><div className="mt-1 text-2xl font-bold text-white">7</div></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-xs text-slate-500">Agents</div><div className="mt-1 text-2xl font-bold text-white">8</div></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-xs text-slate-500">P0 Tasks</div><div className="mt-1 text-2xl font-bold text-white">4</div></div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {modules.map(module => (
          <button key={module.key} onClick={() => setActive(module.key)} className={`rounded-2xl border p-4 text-left transition ${active === module.key ? "border-brand-gold/40 bg-brand-gold/10 text-brand-gold" : "border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/[0.05]"}`}>
            <module.icon size={18} /><div className="mt-3 text-sm font-semibold">{module.name}</div>
          </button>
        ))}
      </section>

      {active === "projects" && <section className="grid gap-4 md:grid-cols-2">
        {projects.map(project => <div key={project.code} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 font-black text-brand-gold">{project.code}</div><Pill tone={project.health === "Planned" ? "amber" : "green"}>{project.health}</Pill></div>
          <h2 className="mt-5 text-xl font-semibold text-white">{project.name}</h2><p className="mt-2 text-sm text-slate-400">{project.priority}</p>
          <div className="mt-5 border-t border-white/5 pt-4 text-xs text-slate-500">Owner: <span className="text-slate-300">{project.owner}</span></div>
        </div>)}
      </section>}

      {active === "agents" && <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {agents.map(agent => <div key={agent.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="flex items-start justify-between"><Bot className="text-brand-gold" size={20}/><Pill>{agent.status}</Pill></div><div className="mt-5 font-semibold text-white">{agent.name}</div><div className="mt-1 min-h-10 text-sm text-slate-500">{agent.mission}</div><div className="mt-4 text-xs text-slate-500">Load <span className="float-right text-slate-300">{agent.utilization}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-brand-gold" style={{ width: agent.utilization }} /></div></div>)}
      </section>}

      {active === "tasks" && <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-white">Execution Queue</h2><p className="mt-1 text-sm text-slate-500">Tap status to advance Ready → In Progress → Done.</p></div><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"><Search size={16} className="text-slate-500"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks" className="bg-transparent text-sm text-white outline-none placeholder:text-slate-600"/></label></div>
        <div className="mt-5 divide-y divide-white/5">{filteredTasks.map(task => <div key={task.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center"><div className="w-10 text-xs font-black text-brand-gold">{task.priority}</div><div className="flex-1"><div className="text-sm font-medium text-white">{task.title}</div><div className="mt-1 text-xs text-slate-500">{task.owner}</div></div><button onClick={() => cycleTask(task.id)}><Pill tone={task.status === "Done" ? "green" : task.status === "In Progress" ? "amber" : "slate"}>{task.status}</Pill></button></div>)}</div>
      </section>}

      {active === "revenue" && <section className="space-y-4">{revenue.map((item, index) => <div key={item.lane} className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-[80px_1fr_160px_220px] md:items-center"><div className="text-3xl font-black text-slate-700">0{index + 1}</div><div><div className="font-semibold text-white">{item.lane}</div><div className="mt-1 text-sm text-slate-500">{item.item}</div></div><Pill>{item.value}</Pill><div className="text-sm text-slate-300">Next: {item.next}</div></div>)}</section>}

      {active === "devops" && <section className="grid gap-4 md:grid-cols-2">{devopsChecks.map(item => <div key={item.area} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><ShieldCheck size={20} className="text-brand-gold"/><div className="font-semibold text-white">{item.area}</div></div><Pill tone={item.state.includes("Pending") ? "amber" : "green"}>{item.state}</Pill></div><p className="mt-4 text-sm leading-6 text-slate-500">{item.detail}</p></div>)}</section>}

      {active === "integrations" && <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{integrations.map(item => <div key={item.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-brand-gold"><item.icon size={19}/></div><div className="mt-4 font-semibold text-white">{item.name}</div><div className={`mt-2 text-xs font-semibold ${item.state.includes("required") ? "text-amber-300" : "text-emerald-300"}`}>{item.state}</div></div>)}</section>}

      {active === "reports" && <section className="grid gap-5 lg:grid-cols-3"><div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2"><div className="flex items-center gap-2 text-lg font-semibold text-white"><BarChart3 size={19}/> Owner Daily Brief</div><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-black/20 p-4"><Target size={18} className="text-brand-gold"/><div className="mt-3 text-sm font-semibold text-white">Act Today</div><div className="mt-1 text-xs text-slate-500">Revenue-close work first</div></div><div className="rounded-2xl bg-black/20 p-4"><Activity size={18} className="text-brand-gold"/><div className="mt-3 text-sm font-semibold text-white">Follow Up</div><div className="mt-1 text-xs text-slate-500">Active buyers and clients</div></div><div className="rounded-2xl bg-black/20 p-4"><AlertTriangle size={18} className="text-brand-gold"/><div className="mt-3 text-sm font-semibold text-white">Blockers</div><div className="mt-1 text-xs text-slate-500">Only genuine dependencies</div></div></div></div><div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><div className="flex items-center gap-2 font-semibold text-white"><CheckCircle2 size={18} className="text-emerald-400"/> Completion Gate</div><div className="mt-4 space-y-3 text-sm text-slate-400">{["Inspect", "Audit", "Execute", "Verify", "Report"].map(item => <div key={item} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400"/>{item}</div>)}</div></div></section>}
    </div>
  );
}
