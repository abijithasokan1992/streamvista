import { createServer } from "node:http";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createApp } from "./app.mjs";
const databasePath=process.env.DATABASE_PATH||".data/streamvista.sqlite";
mkdirSync(dirname(databasePath),{recursive:true});
const port=Number(process.env.PORT||3000);
createServer(createApp({databasePath})).listen(port,()=>console.log(`StreamVista listening on :${port}`));
