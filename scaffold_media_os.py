from zipfile import ZipFile
import os

files = {
"media-os/package.json": """{
"name":"creator-media-os",
"private":true,
"scripts":{"dev":"next dev","server":"node backend/server.js"}
}""",

"media-os/backend/server.js": """const express=require('express');
const app=express();
app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.listen(5000,()=>console.log('API running'));
""",

"media-os/frontend/page.tsx": """export default function Home(){
return <h1>Creator Media OS Dashboard</h1>
}""",

"media-os/database/schema.sql": """CREATE TABLE users(
id SERIAL PRIMARY KEY,
email TEXT,
role TEXT
);""",

"media-os/workers/ffmpeg-worker.js": """console.log('FFmpeg worker placeholder');""",

"media-os/workers/whisper-worker.py": """print('Whisper worker placeholder')""",

"media-os/docker-compose.yml": """version:'3'
services:
 api:
  image:node:20
"""
}

# Use local path instead of /mnt/data
zip_path = "media-os-starter.zip"

print("Scaffolding files...")
for path,content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,"w") as f:
        f.write(content)

print(f"Creating zip archive: {zip_path}...")
with ZipFile(zip_path,"w") as z:
    for root,dirs,fs in os.walk("media-os"):
        for f in fs:
            p=os.path.join(root,f)
            z.write(p, arcname=os.path.relpath(p, "media-os"))

print("Done. Project scaffolded and zipped.")
