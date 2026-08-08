import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bell,
  Boxes,
  CircleGauge,
  CloudUpload,
  Command,
  Film,
  Gauge,
  GitBranch,
  Globe2,
  Headphones,
  LockKeyhole,
  Menu,
  Mic,
  MonitorUp,
  Play,
  Plus,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
  Workflow,
  X,
  Zap,
} from "lucide-react";

type ActivityItem = { id: number; label: string; time: string; tone: "green" | "blue" | "purple" | "orange" };
type Deployment = { name: string; type: string; status: "LIVE" | "DEPLOYED"; time: string };

const nav = [
  ["MEDIA OPERATIONS", ["Live Channels", "Media Library", "Workflows", "Transcodes", "Deployments"]],
  ["QUALITY & SECURITY", ["Quality Monitoring", "Security Scans", "DRM & Protection", "Compliance"]],
  ["DISTRIBUTION", ["CDN & Delivery", "Edge Nodes", "View Analytics", "Audience Insights"]],
  ["SYSTEM", ["Infrastructure", "Alerts", "System Health", "Settings"]],
] as const;

const initialActivity: ActivityItem[] = [
  { id: 1, label: "Channel ‘News Live’ went live", time: "2m ago", tone: "green" },
  { id: 2, label: "Asset ‘Trailer_4K.mp4’ uploaded", time: "3m ago", tone: "blue" },
  { id: 3, label: "Workflow ‘Live_Sports’ triggered", time: "5m ago", tone: "purple" },
  { id: 4, label: "Security scan completed · Zero threats", time: "6m ago", tone: "green" },
  { id: 5, label: "Transcode completed · 1080p60", time: "7m ago", tone: "blue" },
];

const initialDeployments: Deployment[] = [
  { name: "News Live", type: "Channel Deployment", status: "LIVE", time: "2m ago" },
  { name: "Sports Arena", type: "Channel Deployment", status: "LIVE", time: "3m ago" },
  { name: "Movie Premiere 4K", type: "VOD Deployment", status: "DEPLOYED", time: "15m ago" },
  { name: "Kids World", type: "Channel Deployment", status: "LIVE", time: "32m ago" },
  { name: "Music Vault", type: "VOD Deployment", status: "DEPLOYED", time: "1h ago" },
];

export default function CommandCenter() {
  const [active, setActive] = useState("Command Center");
  const [soundOn, setSoundOn] = useState(false);
  const [volume, setVolume] = useState(72);
  const [micOn, setMicOn] = useState(false);
  const [commandText, setCommandText] = useState("");
  const [assistantText, setAssistantText] = useState("Command interface ready.");
  const [showDeploy, setShowDeploy] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [deployments, setDeployments] = useState(initialDeployments);
  const [activities, setActivities] = useState(initialActivity);
  const [toast, setToast] = useState<string | null>(null);
  const [liveClock, setLiveClock] = useState(new Date());
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setLiveClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const speak = (text: string) => {
    if (!soundOn || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 0.92;
    utterance.volume = Math.max(0.05, volume / 100);
    window.speechSynthesis.speak(utterance);
  };

  const beep = (frequency = 520, duration = 0.07) => {
    if (!soundOn) return;
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = audioRef.current || new AudioCtor();
    audioRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = (volume / 100) * 0.055;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  };

  const startup = async () => {
    setSoundOn(true);
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtor) {
      const ctx = audioRef.current || new AudioCtor();
      audioRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();
      [320, 520, 780].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 1 ? "triangle" : "sine";
        osc.frequency.value = freq;
        gain.gain.value = (volume / 100) * 0.045;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = ctx.currentTime + i * 0.09;
        gain.gain.setValueAtTime(gain.gain.value, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    }
    window.setTimeout(() => {
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance("StreamVista Command Center online.");
        u.rate = 0.95;
        u.pitch = 0.9;
        u.volume = Math.max(0.05, volume / 100);
        window.speechSynthesis.speak(u);
      }
    }, 360);
  };

  const runCommand = (value = commandText) => {
    const q = value.trim().toLowerCase();
    if (!q) return;
    let response = "Command received. This live demo uses safe local dashboard data only.";
    if (q.includes("status")) response = "System status is healthy. Compute, storage, database, network and services are all nominal in this demo.";
    else if (q.includes("live") || q.includes("channel")) response = "There are 24 demo live channels with a 95.8 percent delivery success rate.";
    else if (q.includes("deploy")) response = `There are ${deployments.length} recent demo deployments. No production action was executed.`;
    else if (q.includes("security") || q.includes("threat")) response = "Security monitoring reports zero demo threats and all quality checks are green.";
    setAssistantText(response);
    setActivities((prev) => [{ id: Date.now(), label: `Voice command · ${value}`, time: "now", tone: "purple" }, ...prev].slice(0, 8));
    speak(response);
    beep(720, 0.09);
    setCommandText("");
  };

  const startMic = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setAssistantText("Voice recognition is not supported in this browser. Type a command instead.");
      setToast("Voice recognition unavailable · text input is ready");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setMicOn(true);
    recognition.onend = () => setMicOn(false);
    recognition.onerror = () => {
      setMicOn(false);
      setAssistantText("Microphone access did not complete. You can continue with text commands.");
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setCommandText(transcript);
      runCommand(transcript);
    };
    recognition.start();
  };

  const addDeployment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "New Stream");
    const type = String(form.get("type") || "Channel Deployment");
    const item: Deployment = { name, type, status: "DEPLOYED", time: "now" };
    setDeployments((prev) => [item, ...prev].slice(0, 6));
    setActivities((prev) => [{ id: Date.now(), label: `${name} created as demo deployment`, time: "now", tone: "blue" }, ...prev].slice(0, 8));
    setShowDeploy(false);
    setToast(`${name} added to demo deployment queue`);
    beep(640, 0.1);
  };

  const metricBars = useMemo(() => [32, 46, 38, 60, 48, 72, 61, 82, 68, 92, 75, 100, 84, 74, 88, 66, 94, 78], []);

  const controlAction = (label: string) => {
    beep(580, 0.08);
    setToast(`${label}: demo action completed locally`);
    setActivities((prev) => [{ id: Date.now(), label: `${label} · safe demo action`, time: "now", tone: "blue" }, ...prev].slice(0, 8));
  };

  return (
    <div className="svcc-root">
      <style>{styles}</style>
      <aside className={`svcc-sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span>S</span></div>
          <div><strong>STREAMVISTA</strong><small>Cloud X Command Center</small></div>
          <button className="icon-btn close-mobile" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <button className="nav-primary active" onClick={() => { setActive("Command Center"); beep(); }}><Command size={17} /> Command Center <span>›</span></button>
        <div className="nav-scroll">
          {nav.map(([section, items]) => (
            <div className="nav-group" key={section}>
              <p>{section}</p>
              {items.map((item, index) => {
                const Icon = [Radio, Film, Workflow, Activity, MonitorUp, Gauge, ShieldCheck, LockKeyhole, Boxes, Globe2, Zap, CircleGauge, Headphones, GitBranch, Activity, Settings][index % 16];
                return <button className={active === item ? "selected" : ""} key={item} onClick={() => { setActive(item); setToast(`${item} view selected`); beep(440); }}><Icon size={15} /> {item}</button>;
              })}
            </div>
          ))}
        </div>
        <div className="sound-card">
          <div className="section-title"><span>SOUND CONTROL</span><Activity size={14} /></div>
          <div className="mini-wave"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
          <div className="sound-controls">
            <button className="icon-btn" onClick={() => soundOn ? setSoundOn(false) : startup()} aria-label="Toggle sound">{soundOn ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>
            <input aria-label="Volume" type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))}/>
            <b>{volume}%</b>
          </div>
          <button className={`sound-state ${soundOn ? "on" : ""}`} onClick={() => soundOn ? setSoundOn(false) : startup()}><span/> Sound: {soundOn ? "ON" : "OFF"}</button>
        </div>
        <div className="online-card"><span className="pulse-dot"/><div><b>STATUS: SYSTEM ONLINE</b><small>Demo services operational</small></div><Activity size={24}/></div>
      </aside>

      <main className="svcc-main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button>
          {[
            ["SYSTEM ONLINE", "All Services Operational", "green"],
            ["LIVE", "83 Live Channels", "red"],
            ["DEPLOYED", "All Regions", "green"],
            ["SECURE", "Zero Threats", "green"],
            ["GLOBAL CDN", "98.7% Hit Ratio", "cyan"],
          ].map(([a,b,t]) => <div className="top-status" key={a}><span className={`status-dot ${t}`}/><div><b>{a}</b><small>{b}</small></div></div>)}
          <div className="top-actions">
            <button className="icon-btn" onClick={() => setShowSearch(true)} aria-label="Search"><Search size={18}/></button>
            <div className="relative"><button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications"><Bell size={18}/><em>3</em></button>{showNotifications && <div className="dropdown"><b>Notifications</b><p>Security scan passed</p><p>News Live is on air</p><p>CDN hit ratio is above target</p></div>}</div>
            <div className="profile"><div className="avatar">AA</div><div><b>Abijith Asokan</b><small>Administrator</small></div></div>
          </div>
        </header>

        <section className="content">
          <div className="headline">
            <div><p className="eyebrow">{active.toUpperCase()}</p><h1>GOOD MORNING, ABIJITH <span className="headline-wave">⌁⌁⌁</span></h1><p>StreamVista is live and delivering exceptional experiences worldwide.</p></div>
            <div className="headline-actions"><div className="live-time"><span/> <small>LIVE TIME</small><b>{liveClock.toLocaleTimeString("en-IN", { hour12: false })}</b></div><button className="outline-btn">May 12 – May 18, 2024</button><button className="primary-btn" onClick={() => setShowDeploy(true)}><Plus size={16}/> NEW DEPLOYMENT</button></div>
          </div>

          <div className="dashboard-grid">
            <div className="left-zone">
              <div className="metric-row">
                <Metric title="LIVE CHANNELS" value="24" delta="↑ 14%" tone="blue" />
                <Metric title="SUCCESSFUL DELIVERIES" value="23" delta="↑ 23%" tone="green" />
              </div>
              <Panel title="DELIVERY PERFORMANCE" action="Last 7 days">
                <svg viewBox="0 0 520 180" className="chart" aria-label="Delivery performance chart">
                  <g className="grid-lines"><line x1="28" y1="30" x2="500" y2="30"/><line x1="28" y1="75" x2="500" y2="75"/><line x1="28" y1="120" x2="500" y2="120"/><line x1="28" y1="160" x2="500" y2="160"/></g>
                  <polyline className="line total" points="30,65 100,92 170,45 240,88 310,48 380,90 450,61 500,86"/>
                  <polyline className="line success" points="30,106 100,132 170,104 240,121 310,88 380,119 450,101 500,122"/>
                  <polyline className="line fail" points="30,159 100,159 170,158 240,160 310,158 380,159 450,159 500,159"/>
                </svg>
                <div className="legend"><span><i className="green-dot"/>Successful</span><span><i className="red-dot"/>Failed</span><span><i className="blue-dot"/>Total</span></div>
              </Panel>
              <Panel title="RECENT DEPLOYMENTS" action="VIEW ALL">
                <div className="list">
                  {deployments.slice(0,5).map((d) => <div className="list-row" key={`${d.name}-${d.time}`}><div className="list-icon"><MonitorUp size={15}/></div><div className="grow"><b>{d.name}</b><small>{d.type}</small></div><span className={`badge ${d.status.toLowerCase()}`}>{d.status}</span><small>{d.time}</small></div>)}
                </div>
              </Panel>
            </div>

            <div className="core-zone">
              <div className="core-label"><Sparkles size={14}/> STREAMVISTA AI CORE</div>
              <div className="ai-core" aria-label="Animated StreamVista AI core"><div className="ring r1"/><div className="ring r2"/><div className="ring r3"/><div className="ring r4"/><div className="core-glow"/><div className="orbit o1"><i/></div><div className="orbit o2"><i/></div><div className="core-platform"/></div>
              <Panel title="SYSTEM HEALTH">
                <div className="health-wrap"><div className="health-ring"><div><strong>98%</strong><span>HEALTHY</span></div></div><div className="health-list">{["Compute","Storage","Database","Network","Services"].map((x)=><p key={x}><i/> <span>{x}</span><small>Healthy</small></p>)}</div></div>
              </Panel>
            </div>

            <div className="right-zone">
              <div className="metric-row">
                <Metric title="FAILED DELIVERIES" value="1" delta="↓ 75%" tone="red" />
                <Metric title="DELIVERY SUCCESS RATE" value="95.8%" delta="↑ 8.2%" tone="purple" />
              </div>
              <div className="two-col-panels">
                <Panel title="QUALITY MONITORING" action="VIEW ALL">
                  <div className="quality-list">{[["Live Stream Quality","1080p60"],["Encoding Health","All Encoders"],["Audio Loudness","-16.2 LUFS"],["Playback Success","98.7%"]].map(([a,b])=><div key={a}><ShieldCheck size={16}/><span><b>{a}</b><small>{b}</small></span><em>GOOD</em></div>)}</div>
                </Panel>
                <Panel title="RECENT ACTIVITY" action="VIEW ALL">
                  <div className="activity-list">{activities.slice(0,5).map((a)=><div key={a.id}><span className={`activity-dot ${a.tone}`}/><b>{a.label}</b><small>{a.time}</small></div>)}</div>
                </Panel>
              </div>
              <Panel title="DEPLOYMENT CONTROLS">
                <div className="control-grid">
                  <button onClick={() => controlAction("Deploy live channel")}><Radio size={17}/>DEPLOY LIVE CHANNEL</button>
                  <button onClick={() => controlAction("Upload and process")}><CloudUpload size={17}/>UPLOAD & PROCESS</button>
                  <button onClick={() => controlAction("Manage workflows")}><Workflow size={17}/>MANAGE WORKFLOWS</button>
                  <button onClick={() => controlAction("CDN purge")}><Zap size={17}/>CDN PURGE</button>
                  <button onClick={() => controlAction("View deployments")}><Boxes size={17}/>VIEW DEPLOYMENTS</button>
                  <button onClick={() => controlAction("Security center")}><ShieldCheck size={17}/>SECURITY CENTER</button>
                  <button className="wide" onClick={() => controlAction("System settings")}><Settings size={17}/>SYSTEM SETTINGS</button>
                </div>
              </Panel>
            </div>
          </div>

          <div className="bottom-grid">
            <div className="voice-card">
              <button className={`mic-orb ${micOn ? "listening" : ""}`} onClick={startMic} aria-label="Start voice command"><Mic size={27}/></button>
              <div className="voice-body"><div className="voice-title"><span>VOICE COMMAND</span><b>{micOn ? "Listening…" : assistantText}</b></div><div className={`voice-wave ${micOn ? "active" : ""}`}>{Array.from({length: 38}).map((_,i)=><i key={i} style={{height:`${12 + ((i*17)%34)}%`}}/>)}</div><div className="command-input"><input value={commandText} onChange={(e)=>setCommandText(e.target.value)} onKeyDown={(e)=>e.key === "Enter" && runCommand()} placeholder="Ask about status, live channels, deployments, or security…"/><button onClick={()=>runCommand()}><Play size={16}/></button></div></div>
              <button className="icon-btn voice-sound" onClick={() => soundOn ? setSoundOn(false) : startup()}>{soundOn ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button>
            </div>
            <div className="audio-monitor"><div className="section-title"><span>AUDIO MONITOR</span><small>LIVE AUDIO LEVELS</small></div><div className="bars">{metricBars.map((h,i)=><i key={i} className={soundOn || micOn ? "animated" : ""} style={{height:`${h}%`, animationDelay:`${i*35}ms`}}/>)}</div><div className="db"><span>-60</span><span>-48</span><span>-36</span><span>-24</span><span>-12</span><span>0</span><b>L R</b></div></div>
          </div>
          <div className="demo-note">LIVE INTERACTIVE DEMO · dashboard telemetry is sample data until production integrations are connected.</div>
        </section>
      </main>

      {showDeploy && <div className="modal-backdrop"><form className="modal" onSubmit={addDeployment}><button type="button" className="modal-x" onClick={()=>setShowDeploy(false)}><X size={18}/></button><h2>New Demo Deployment</h2><p>Create a local dashboard deployment record. No production infrastructure is changed.</p><label>Name<input name="name" required defaultValue="StreamVista Premiere"/></label><label>Type<select name="type"><option>Channel Deployment</option><option>VOD Deployment</option><option>FAST Deployment</option></select></label><label>Region<select name="region"><option>India · ap-south</option><option>Global</option><option>US East</option></select></label><button className="primary-btn" type="submit"><Upload size={16}/> CREATE DEMO DEPLOYMENT</button></form></div>}
      {showSearch && <div className="modal-backdrop" onMouseDown={()=>setShowSearch(false)}><div className="search-modal" onMouseDown={(e)=>e.stopPropagation()}><Search size={20}/><input autoFocus placeholder="Search modules or type a command…" onKeyDown={(e)=>{if(e.key==="Enter"){runCommand((e.target as HTMLInputElement).value);setShowSearch(false);}}}/><button onClick={()=>setShowSearch(false)}><X size={18}/></button></div></div>}
      {toast && <div className="toast"><span className="pulse-dot"/>{toast}</div>}
    </div>
  );
}

function Metric({title,value,delta,tone}:{title:string;value:string;delta:string;tone:string}) {
  return <div className={`metric-card ${tone}`}><div className="metric-icon"><Activity size={17}/></div><small>{title}</small><strong>{value}</strong><p>{delta} <span>vs last 7 days</span></p><div className="spark"><i/><i/><i/><i/><i/><i/></div></div>;
}

function Panel({title,action,children}:{title:string;action?:string;children:React.ReactNode}) {
  return <div className="panel"><div className="panel-head"><b>{title}</b>{action && <button>{action}</button>}</div>{children}</div>;
}

const styles = `
:root{color-scheme:dark}.svcc-root{--bg:#020a14;--panel:#061525;--line:#0a4167;--cyan:#26c8ff;--blue:#2a77ff;--green:#26e6a4;--purple:#9a72ff;--red:#ff5d61;min-height:100vh;background:radial-gradient(circle at 58% 42%,rgba(26,106,255,.12),transparent 27%),linear-gradient(180deg,#020814,#020a13 68%,#010711);color:#d8edff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;overflow-x:hidden}.svcc-root *{box-sizing:border-box}.svcc-root button,.svcc-root input,.svcc-root select{font:inherit}.svcc-sidebar{width:264px;min-height:100vh;background:linear-gradient(180deg,rgba(4,16,29,.98),rgba(3,12,24,.96));border-right:1px solid rgba(55,181,255,.22);padding:16px 14px;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;z-index:30}.brand-row{display:flex;align-items:center;gap:10px;padding:2px 8px 18px}.brand-row strong{display:block;font-size:19px;letter-spacing:.06em}.brand-row small{display:block;color:#7998b4;font-size:10px}.brand-mark{width:36px;height:36px;border-radius:10px;background:linear-gradient(145deg,#1de1ff,#2864ff);box-shadow:0 0 24px rgba(42,119,255,.45);display:grid;place-items:center;transform:rotate(45deg)}.brand-mark span{font-size:19px;font-weight:900;transform:rotate(-45deg);color:#02101e}.nav-primary,.nav-group button{border:0;background:transparent;color:#b7cde1;width:100%;display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;border-radius:8px}.nav-primary{height:42px;padding:0 12px;border:1px solid rgba(33,162,255,.75);box-shadow:inset 0 0 18px rgba(34,116,255,.12),0 0 16px rgba(21,127,255,.08);color:#e6f6ff}.nav-primary span{margin-left:auto}.nav-scroll{overflow:auto;padding-right:2px}.nav-group{padding-top:15px}.nav-group p{font-size:10px;letter-spacing:.08em;color:#5b94bd;margin:0 0 6px 7px}.nav-group button{padding:7px 9px;font-size:12px}.nav-group button:hover,.nav-group button.selected{background:rgba(34,146,255,.09);color:#fff}.sound-card,.online-card{border:1px solid rgba(33,144,210,.26);background:rgba(5,21,37,.72);border-radius:9px;padding:10px;margin-top:12px}.sound-card{margin-top:auto}.section-title{display:flex;align-items:center;justify-content:space-between;color:#79caff;font-size:10px;letter-spacing:.07em}.mini-wave{display:flex;align-items:center;justify-content:center;height:32px;gap:3px}.mini-wave i{width:2px;background:linear-gradient(#26d7ff,#985eff);height:30%;animation:wave 1.1s ease-in-out infinite}.mini-wave i:nth-child(3n){height:80%;animation-delay:.16s}.mini-wave i:nth-child(4n){height:55%;animation-delay:.28s}.sound-controls{display:flex;align-items:center;gap:8px}.sound-controls input{width:100%;accent-color:#3a8cff}.sound-controls b{font-size:10px;color:#89aeca}.sound-state{margin-top:8px;width:100%;border:1px solid rgba(28,205,135,.17);background:rgba(11,33,42,.7);color:#6c8294;border-radius:6px;padding:6px;text-align:left;font-size:11px;cursor:pointer}.sound-state span{width:7px;height:7px;border-radius:50%;display:inline-block;background:#51616f;margin-right:7px}.sound-state.on{color:#52efad}.sound-state.on span{background:#26e6a4;box-shadow:0 0 10px #26e6a4}.online-card{display:flex;align-items:center;gap:8px}.online-card div{flex:1}.online-card b{display:block;color:#51edae;font-size:10px}.online-card small{font-size:9px;color:#617d90}.pulse-dot{width:8px;height:8px;border-radius:50%;background:#32eea8;box-shadow:0 0 10px #32eea8;display:inline-block;animation:pulse 1.5s infinite}.svcc-main{flex:1;min-width:0}.topbar{height:64px;border-bottom:1px solid rgba(46,153,220,.19);display:flex;align-items:center;padding:0 18px;background:rgba(2,11,22,.88);backdrop-filter:blur(14px);position:sticky;top:0;z-index:20}.top-status{display:flex;align-items:center;gap:8px;min-width:150px;padding-right:22px;margin-right:20px;border-right:1px solid rgba(51,110,151,.22)}.top-status b{display:block;font-size:10px}.top-status small{display:block;font-size:9px;color:#7c9bb3}.status-dot{width:8px;height:8px;border-radius:50%}.status-dot.green{background:#2ce9a3;box-shadow:0 0 12px #2ce9a3}.status-dot.red{background:#ff474d;box-shadow:0 0 12px #ff474d}.status-dot.cyan{background:#2fd7ff;box-shadow:0 0 12px #2fd7ff}.top-actions{margin-left:auto;display:flex;align-items:center;gap:8px}.icon-btn{border:0;background:transparent;color:#a9c5da;display:grid;place-items:center;cursor:pointer;position:relative}.icon-btn:hover{color:#fff}.icon-btn em{position:absolute;top:-7px;right:-5px;background:#1979ff;color:#fff;border-radius:12px;font-size:8px;font-style:normal;padding:2px 5px}.relative{position:relative}.dropdown{position:absolute;right:0;top:36px;width:240px;background:#071827;border:1px solid rgba(55,179,255,.32);border-radius:10px;padding:12px;box-shadow:0 18px 60px rgba(0,0,0,.45)}.dropdown p{font-size:11px;padding:8px 0;margin:0;border-bottom:1px solid rgba(255,255,255,.06);color:#9fbbd0}.profile{display:flex;align-items:center;gap:9px;margin-left:12px}.avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#0ea5e9,#1d4ed8);font-size:11px;font-weight:900}.profile b,.profile small{display:block}.profile b{font-size:11px}.profile small{font-size:9px;color:#718da3}.content{padding:18px;max-width:1680px;margin:auto}.headline{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin:4px 0 18px}.eyebrow{font-size:10px!important;color:#3fcaff!important;letter-spacing:.12em}.headline h1{font-size:24px;margin:2px 0 5px;letter-spacing:.01em}.headline p{margin:0;color:#7f9cb3;font-size:12px}.headline-wave{color:#247fff;font-size:18px}.headline-actions{display:flex;align-items:center;gap:10px}.live-time{display:grid;grid-template-columns:10px auto;column-gap:6px}.live-time span{width:9px;height:9px;border-radius:50%;margin-top:4px;background:#ff8426;box-shadow:0 0 12px #ff8426}.live-time small{font-size:8px;color:#6e9dbd}.live-time b{font-size:13px;color:#69cfff}.outline-btn,.primary-btn{height:38px;border-radius:7px;padding:0 14px;cursor:pointer}.outline-btn{background:rgba(4,17,31,.7);border:1px solid rgba(43,111,164,.35);color:#bdd5e7}.primary-btn{border:1px solid #2388ff;background:linear-gradient(180deg,#0a52b0,#073d84);color:#e6f6ff;box-shadow:0 0 18px rgba(31,124,255,.18);display:inline-flex;align-items:center;gap:7px}.dashboard-grid{display:grid;grid-template-columns:1.05fr .85fr 1.45fr;gap:12px}.left-zone,.core-zone,.right-zone{display:flex;flex-direction:column;gap:12px}.metric-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.metric-card,.panel{position:relative;background:linear-gradient(180deg,rgba(6,23,41,.9),rgba(4,17,31,.92));border:1px solid rgba(36,130,190,.3);border-radius:10px;box-shadow:inset 0 0 24px rgba(18,71,109,.07),0 18px 50px rgba(0,0,0,.08);overflow:hidden}.metric-card{min-height:124px;padding:14px}.metric-card:before,.panel:before{content:"";position:absolute;inset:0;border-top:1px solid rgba(53,199,255,.38);pointer-events:none;clip-path:polygon(0 0,58% 0,65% 3%,100% 3%,100% 100%,0 100%)}.metric-card small{font-size:10px;color:#b6d3e7}.metric-card strong{display:block;font-size:28px;margin:3px 0}.metric-card p{font-size:9px;color:#33e8a8;margin:0}.metric-card p span{color:#6d899f}.metric-card.red p{color:#ff6468}.metric-icon{position:absolute;right:14px;top:15px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(31,113,255,.14);color:#56a2ff}.spark{position:absolute;right:14px;bottom:12px;display:flex;align-items:flex-end;gap:2px;height:20px}.spark i{width:5px;background:#2c80ff;border-radius:2px;height:30%}.spark i:nth-child(2){height:70%}.spark i:nth-child(3){height:42%}.spark i:nth-child(4){height:92%}.spark i:nth-child(5){height:52%}.spark i:nth-child(6){height:80%}.green .spark i{background:#29e7a2}.red .spark i{background:#ff5d61}.purple .spark i{background:#9d69ff}.panel{padding:12px}.panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.panel-head b{font-size:11px;color:#c9e5f7}.panel-head button{border:0;background:transparent;color:#3b9fff;font-size:9px}.chart{width:100%;height:160px}.grid-lines line{stroke:rgba(127,174,209,.12);stroke-width:1}.line{fill:none;stroke-width:2.5}.line.total{stroke:#3885ff}.line.success{stroke:#25d6b3}.line.fail{stroke:#ff5e5e}.legend{display:flex;gap:18px;font-size:9px;color:#7999b1}.legend i{width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:4px}.green-dot{background:#27e3a1}.red-dot{background:#ff575c}.blue-dot{background:#3885ff}.list{display:flex;flex-direction:column}.list-row{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)}.list-row:last-child{border-bottom:0}.list-icon{width:27px;height:27px;border-radius:8px;background:rgba(48,125,255,.14);display:grid;place-items:center;color:#5aa1ff}.grow{flex:1}.list-row b,.list-row small{display:block}.list-row b{font-size:10px}.list-row small{font-size:8px;color:#7893a8}.badge{font-size:8px;padding:3px 7px;border-radius:4px}.badge.live{color:#35f2a9;background:rgba(14,160,99,.16)}.badge.deployed{color:#62b7ff;background:rgba(35,112,202,.16)}.core-zone{align-items:stretch}.core-label{align-self:center;border:1px solid rgba(44,164,246,.32);border-radius:999px;color:#4ec9ff;font-size:9px;padding:5px 12px;display:flex;align-items:center;gap:6px}.ai-core{height:338px;position:relative;display:grid;place-items:center;overflow:hidden}.ring{position:absolute;border-radius:50%;border:1px solid rgba(64,170,255,.38);box-shadow:0 0 20px rgba(33,124,255,.15),inset 0 0 18px rgba(33,124,255,.08)}.r1{width:265px;height:265px;animation:spin 17s linear infinite}.r2{width:215px;height:215px;border-style:dashed;animation:spinReverse 12s linear infinite}.r3{width:160px;height:160px;animation:spin 7s linear infinite}.r4{width:105px;height:105px;border-color:rgba(107,99,255,.55);animation:pulse 2.2s ease-in-out infinite}.core-glow{width:48px;height:48px;border-radius:50%;background:#d8ffff;box-shadow:0 0 18px #fff,0 0 42px #21d5ff,0 0 90px #2f69ff}.orbit{position:absolute;border-radius:50%;animation:spin 6s linear infinite}.orbit i{display:block;width:7px;height:7px;border-radius:50%;background:#35d6ff;box-shadow:0 0 12px #35d6ff}.o1{width:235px;height:235px}.o2{width:185px;height:185px;animation-duration:9s;animation-direction:reverse}.o2 i{margin-left:auto;margin-top:50%;background:#a26cff;box-shadow:0 0 12px #a26cff}.core-platform{position:absolute;bottom:20px;width:230px;height:24px;border-radius:50%;border:2px solid rgba(59,132,255,.6);box-shadow:0 0 38px #1d74ff,inset 0 0 18px #25c8ff;transform:perspective(170px) rotateX(62deg)}.health-wrap{display:flex;align-items:center;gap:16px}.health-ring{width:118px;height:118px;border-radius:50%;background:conic-gradient(#29e1be 0 98%,rgba(255,255,255,.08) 98%);padding:8px;box-shadow:0 0 30px rgba(35,235,185,.18)}.health-ring>div{width:100%;height:100%;border-radius:50%;background:#061525;display:grid;place-items:center;align-content:center}.health-ring strong{font-size:23px}.health-ring span{font-size:8px;color:#7bcfb9}.health-list{flex:1}.health-list p{display:grid;grid-template-columns:8px 1fr auto;align-items:center;gap:6px;margin:6px 0}.health-list i{width:5px;height:5px;border-radius:50%;background:#2de8aa;box-shadow:0 0 8px #2de8aa}.health-list span{font-size:9px}.health-list small{font-size:8px;color:#7c9aaf}.two-col-panels{display:grid;grid-template-columns:1fr 1fr;gap:12px}.quality-list>div{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);color:#27e6a2}.quality-list span{flex:1}.quality-list b,.quality-list small{display:block;color:#bad1e1}.quality-list b{font-size:9px}.quality-list small{font-size:8px;color:#7898ac}.quality-list em{font-size:8px;font-style:normal;color:#51e7aa;background:rgba(21,131,86,.17);padding:4px 7px;border-radius:4px}.activity-list>div{display:grid;grid-template-columns:8px 1fr auto;gap:7px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)}.activity-list b{font-size:9px;font-weight:500}.activity-list small{font-size:8px;color:#7290a4}.activity-dot{width:7px;height:7px;border-radius:50%}.activity-dot.green{background:#2ce3a0}.activity-dot.blue{background:#438bff}.activity-dot.purple{background:#a16cff}.activity-dot.orange{background:#ff9d42}.control-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.control-grid button{height:42px;border:1px solid rgba(44,134,225,.42);background:rgba(7,31,56,.72);color:#83caff;border-radius:7px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:9px;cursor:pointer}.control-grid button:hover{background:rgba(21,85,146,.45);color:#fff;box-shadow:0 0 18px rgba(24,118,255,.12)}.control-grid .wide{grid-column:1/-1}.bottom-grid{display:grid;grid-template-columns:1.5fr .65fr;gap:12px;margin-top:12px}.voice-card,.audio-monitor{border:1px solid rgba(36,130,190,.32);border-radius:11px;background:rgba(4,18,33,.9);min-height:122px}.voice-card{display:flex;align-items:center;padding:14px;gap:14px}.mic-orb{width:60px;height:60px;border-radius:50%;border:1px solid rgba(45,169,255,.65);background:radial-gradient(circle,rgba(42,168,255,.2),rgba(4,23,43,.9));color:#6fd3ff;display:grid;place-items:center;box-shadow:0 0 25px rgba(35,141,255,.18);cursor:pointer}.mic-orb.listening{animation:pulse 1s infinite;color:#fff;box-shadow:0 0 30px #2a85ff}.voice-body{flex:1;min-width:0}.voice-title span{font-size:9px;color:#69c8ff;display:block}.voice-title b{font-size:10px;color:#8ed7ff;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.voice-wave{height:28px;display:flex;align-items:center;gap:2px;margin:2px 0}.voice-wave i{width:2px;max-height:26px;background:linear-gradient(#2b7cff,#a265ff);opacity:.55}.voice-wave.active i{animation:voiceWave .55s ease-in-out infinite alternate}.command-input{display:flex;border:1px solid rgba(44,114,171,.26);border-radius:8px;background:rgba(2,11,22,.66);overflow:hidden}.command-input input{flex:1;min-width:0;border:0;background:transparent;color:#dff4ff;padding:8px 10px;outline:none;font-size:10px}.command-input button{width:38px;border:0;background:transparent;color:#5ca7ff;cursor:pointer}.voice-sound{width:38px;height:38px;border:1px solid rgba(55,139,214,.35);border-radius:50%}.audio-monitor{padding:14px}.audio-monitor .section-title{display:block}.audio-monitor .section-title small{display:block;color:#28d8bd;margin-top:3px}.bars{height:58px;display:flex;align-items:flex-end;gap:4px;margin-top:7px}.bars i{flex:1;min-width:3px;background:linear-gradient(180deg,#a566ff,#1686ff 52%,#20d5c8);border-radius:2px 2px 0 0;opacity:.85}.bars i.animated{animation:meter 1s ease-in-out infinite alternate}.db{display:flex;justify-content:space-between;font-size:7px;color:#67849a;margin-top:5px}.db b{color:#a66dff}.demo-note{text-align:right;font-size:8px;color:#4f7189;letter-spacing:.08em;margin-top:8px}.modal-backdrop{position:fixed;inset:0;background:rgba(0,5,12,.75);backdrop-filter:blur(7px);z-index:100;display:grid;place-items:center;padding:18px}.modal{width:min(440px,100%);background:#071827;border:1px solid rgba(54,176,255,.35);border-radius:14px;padding:22px;box-shadow:0 28px 80px rgba(0,0,0,.55);position:relative}.modal h2{margin:0 0 6px}.modal p{color:#7f9caf;font-size:11px}.modal label{display:block;font-size:10px;color:#8eb3cc;margin:14px 0}.modal input,.modal select{width:100%;margin-top:6px;background:#04111f;border:1px solid rgba(61,128,175,.35);border-radius:7px;padding:10px;color:#e3f5ff;outline:none}.modal-x{position:absolute;right:14px;top:14px;background:transparent;border:0;color:#86a9c1;cursor:pointer}.search-modal{width:min(680px,94vw);height:58px;background:#071827;border:1px solid rgba(55,178,255,.4);border-radius:13px;display:flex;align-items:center;gap:10px;padding:0 14px;box-shadow:0 30px 100px rgba(0,0,0,.6)}.search-modal input{flex:1;background:transparent;border:0;outline:none;color:#ecf8ff;font-size:14px}.search-modal button{border:0;background:transparent;color:#8aa6b9}.toast{position:fixed;right:20px;bottom:20px;z-index:120;background:#071827;border:1px solid rgba(51,208,159,.4);border-radius:10px;padding:11px 14px;display:flex;align-items:center;gap:9px;color:#bfeee0;font-size:11px;box-shadow:0 18px 45px rgba(0,0,0,.4)}.mobile-menu,.close-mobile{display:none}
@keyframes spin{to{transform:rotate(360deg)}}@keyframes spinReverse{to{transform:rotate(-360deg)}}@keyframes pulse{0%,100%{opacity:.65;transform:scale(.97)}50%{opacity:1;transform:scale(1.03)}}@keyframes wave{0%,100%{transform:scaleY(.55)}50%{transform:scaleY(1.2)}}@keyframes voiceWave{from{transform:scaleY(.5)}to{transform:scaleY(1.55)}}@keyframes meter{from{transform:scaleY(.65);opacity:.65}to{transform:scaleY(1);opacity:1}}
@media(max-width:1250px){.top-status:nth-of-type(4),.top-status:nth-of-type(5){display:none}.dashboard-grid{grid-template-columns:1fr 1fr}.core-zone{order:3;grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;align-items:center}.ai-core{height:290px}.right-zone{grid-column:2}.bottom-grid{grid-template-columns:1fr}}
@media(max-width:900px){.svcc-sidebar{position:fixed;left:-280px;transition:left .25s}.svcc-sidebar.open{left:0;box-shadow:25px 0 60px rgba(0,0,0,.55)}.mobile-menu,.close-mobile{display:grid}.close-mobile{margin-left:auto}.top-status{display:none!important}.profile div:last-child{display:none}.headline{flex-direction:column}.headline-actions{flex-wrap:wrap}.dashboard-grid{grid-template-columns:1fr}.left-zone,.right-zone,.core-zone{grid-column:1;order:initial}.core-zone{display:flex}.two-col-panels{grid-template-columns:1fr}.bottom-grid{grid-template-columns:1fr}}
@media(max-width:560px){.content{padding:12px}.topbar{padding:0 12px}.headline h1{font-size:19px}.headline-actions{width:100%}.outline-btn,.primary-btn{flex:1;justify-content:center;font-size:9px}.metric-row{grid-template-columns:1fr}.voice-card{align-items:flex-start}.voice-sound{display:none}.mic-orb{width:48px;height:48px;flex:0 0 auto}.chart{height:130px}}
@media(prefers-reduced-motion:reduce){.svcc-root *{animation:none!important;scroll-behavior:auto!important}}
`;
