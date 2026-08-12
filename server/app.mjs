import { DatabaseSync } from "node:sqlite";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { hashPassword, newToken, verifyPassword } from "./security.mjs";

const ROLES=["platform_owner","founder","super_admin","admin","creator_partner","buyer","finance","qc_staff","legal_staff","support_staff"];
const ADMIN=new Set(["platform_owner","founder","super_admin","admin"]);
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
function json(res,status,value,headers={}){res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers});res.end(status===204?"":JSON.stringify(value));}
async function readBody(req){let raw="";for await(const chunk of req){raw+=chunk;if(raw.length>1_000_000)throw new Error("Payload too large");}return raw?JSON.parse(raw):{};}
function cookies(req){return Object.fromEntries(String(req.headers.cookie||"").split(";").filter(Boolean).map(v=>v.trim().split(/=(.*)/s).slice(0,2).map(decodeURIComponent)));}

export function createApp(options={}){
 const db=new DatabaseSync(options.databasePath||process.env.DATABASE_PATH||".data/streamvista.sqlite");
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,display_name TEXT NOT NULL,role TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
 CREATE TABLE IF NOT EXISTS titles(id TEXT PRIMARY KEY,creator_owner_id TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS buyer_assignments(buyer_id TEXT NOT NULL,title_id TEXT NOT NULL,PRIMARY KEY(buyer_id,title_id));
 CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT,actor_id TEXT,action TEXT NOT NULL,target TEXT,created_at TEXT NOT NULL);`);
 const seedEmail=options.seedEmail||process.env.SEED_OWNER_EMAIL,seedPassword=options.seedPassword||process.env.SEED_OWNER_PASSWORD;
 if(seedEmail&&seedPassword&&!db.prepare("SELECT id FROM users WHERE email=?").get(seedEmail.toLowerCase())){const now=new Date().toISOString();db.prepare("INSERT INTO users VALUES(?,?,?,?,?,?,?)").run(crypto.randomUUID(),seedEmail.toLowerCase(),hashPassword(seedPassword),"Founder","founder",now,now);}
 const safeUser=r=>r&&({uid:r.id,email:r.email,displayName:r.display_name,role:r.role,createdAt:r.created_at,updatedAt:r.updated_at});
 const current=req=>{const token=cookies(req).sv_session;if(!token)return null;return db.prepare("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?").get(token,new Date().toISOString())||null;};
 const audit=(actor,action,target="")=>db.prepare("INSERT INTO audit_log(actor_id,action,target,created_at) VALUES(?,?,?,?)").run(actor||null,action,target,new Date().toISOString());
 const allowedOrigin=req=>!req.headers.origin||!(options.appOrigin||process.env.APP_ORIGIN)||req.headers.origin===(options.appOrigin||process.env.APP_ORIGIN);
 return async(req,res)=>{try{
  const url=new URL(req.url,"http://localhost"),path=url.pathname;
  res.setHeader("x-content-type-options","nosniff");res.setHeader("x-frame-options","DENY");res.setHeader("referrer-policy","strict-origin-when-cross-origin");
  if(path==="/api/health")return json(res,200,{status:"ok"});
  if(path==="/api/ready"){db.prepare("SELECT 1").get();return json(res,200,{status:"ready",database:"connected"});}
  if(path.startsWith("/api/")&&!allowedOrigin(req))return json(res,403,{error:"Origin denied"});
  if(path==="/api/auth/login"&&req.method==="POST"){const input=await readBody(req),row=db.prepare("SELECT * FROM users WHERE email=?").get(String(input.email||"").trim().toLowerCase());if(!row||!verifyPassword(String(input.password||""),row.password_hash)){audit(null,"auth.login_failed",String(input.email||""));return json(res,401,{error:"Invalid email or password"});}const token=newToken(),expires=new Date(Date.now()+28_800_000).toISOString();db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(token,row.id,expires);audit(row.id,"auth.login");return json(res,200,{user:safeUser(row)},{"set-cookie":`sv_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV==="production"?"; Secure":""}`});}
  if(path==="/api/auth/logout"&&req.method==="POST"){const token=cookies(req).sv_session;if(token)db.prepare("DELETE FROM sessions WHERE token=?").run(token);return json(res,204,{},{"set-cookie":"sv_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"});}
  const user=current(req);
  if(path==="/api/auth/me")return user?json(res,200,{user:safeUser(user)}):json(res,401,{error:"Unauthenticated"});
  if(!user&&path.startsWith("/api/"))return json(res,401,{error:"Unauthenticated"});
  if(path==="/api/titles"&&req.method==="GET"){let rows=[];if(user.role==="creator_partner")rows=db.prepare("SELECT payload FROM titles WHERE creator_owner_id=?").all(user.id);else if(user.role==="buyer")rows=db.prepare("SELECT t.payload FROM titles t JOIN buyer_assignments a ON a.title_id=t.id WHERE a.buyer_id=?").all(user.id);else if(ADMIN.has(user.role)||["finance","qc_staff","legal_staff","support_staff"].includes(user.role))rows=db.prepare("SELECT payload FROM titles").all();return json(res,200,{titles:rows.map(r=>JSON.parse(r.payload))});}
  if(path==="/api/drafts"&&req.method==="GET"){const owner=user.role==="creator_partner"?user.id:url.searchParams.get("creatorId");if(!owner||(owner!==user.id&&!ADMIN.has(user.role)))return json(res,403,{error:"Forbidden"});return json(res,200,{drafts:db.prepare("SELECT payload FROM titles WHERE creator_owner_id=? AND status='draft'").all(owner).map(r=>JSON.parse(r.payload))});}
  if(path==="/api/drafts"&&req.method==="POST"){if(user.role!=="creator_partner"&&!ADMIN.has(user.role))return json(res,403,{error:"Forbidden"});const input=await readBody(req),now=new Date().toISOString(),id=String(input.id||crypto.randomUUID()),owner=user.role==="creator_partner"?user.id:String(input.creatorOwnerId||user.id),draft={...input,id,creatorOwnerId:owner,status:"draft",updatedAt:now,createdAt:input.createdAt||now};db.prepare("INSERT INTO titles VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,status='draft',updated_at=excluded.updated_at").run(id,owner,JSON.stringify(draft),"draft",draft.createdAt,now);audit(user.id,"draft.save",id);return json(res,200,{draft});}
  if(path==="/api/users"&&req.method==="GET"){if(!ADMIN.has(user.role))return json(res,403,{error:"Forbidden"});return json(res,200,{users:db.prepare("SELECT * FROM users").all().map(safeUser)});}
  if(path==="/api/users"&&req.method==="POST"){if(!ADMIN.has(user.role))return json(res,403,{error:"Forbidden"});const input=await readBody(req);if(!ROLES.includes(input.role))return json(res,400,{error:"Invalid role"});const now=new Date().toISOString(),id=crypto.randomUUID();db.prepare("INSERT INTO users VALUES(?,?,?,?,?,?,?)").run(id,String(input.email).toLowerCase(),hashPassword(input.password),String(input.displayName||input.email),input.role,now,now);audit(user.id,"user.create",id);return json(res,201,{user:safeUser(db.prepare("SELECT * FROM users WHERE id=?").get(id))});}
  if(path.startsWith("/api/"))return json(res,404,{error:"Not found"});
  const dist=options.distPath||join(process.cwd(),"dist"),requested=normalize(path).replace(/^(\.\.(\/|\\|$))+/,"");let file=join(dist,requested);if(!existsSync(file)||path==="/")file=join(dist,"index.html");if(!existsSync(file))return json(res,404,{error:"Not found"});res.writeHead(200,{"content-type":MIME[extname(file)]||"application/octet-stream"});createReadStream(file).pipe(res);
 }catch(error){console.error(error);json(res,error.message==="Payload too large"?413:500,{error:"Request failed"});}};
}
