import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createApp } from "./app.mjs";
async function fixture(){const server=createServer(createApp({databasePath:":memory:",seedEmail:"founder@test.local",seedPassword:"correct-horse-battery",appOrigin:"http://test.local"}));await new Promise(r=>server.listen(0,r));return{server,base:`http://127.0.0.1:${server.address().port}`};}
test("health and readiness verify database",async t=>{const{server,base}=await fixture();t.after(()=>server.close());assert.equal((await fetch(base+"/api/health")).status,200);assert.equal((await fetch(base+"/api/ready")).status,200);});
test("authentication rejects bad password and creates secure session",async t=>{const{server,base}=await fixture();t.after(()=>server.close());let r=await fetch(base+"/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:"founder@test.local",password:"wrong-password"})});assert.equal(r.status,401);r=await fetch(base+"/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:"founder@test.local",password:"correct-horse-battery"})});assert.equal(r.status,200);assert.match(r.headers.get("set-cookie"),/HttpOnly/);});
test("RBAC denies unauthenticated title access",async t=>{const{server,base}=await fixture();t.after(()=>server.close());assert.equal((await fetch(base+"/api/titles")).status,401);});
test("origin guard denies cross-site login",async t=>{const{server,base}=await fixture();t.after(()=>server.close());const r=await fetch(base+"/api/auth/login",{method:"POST",headers:{origin:"https://evil.example","content-type":"application/json"},body:"{}"});assert.equal(r.status,403);});
