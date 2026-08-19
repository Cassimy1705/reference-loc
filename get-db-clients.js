import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value.trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL.includes("://") 
  ? env.VITE_SUPABASE_URL 
  : `https://${env.VITE_SUPABASE_URL}.supabase.co`;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Fetching all clients from Supabase...");
  const { data: clients, error } = await supabase.from("clients").select("*").order("id");
  if (error) {
    console.error("DB Fetch Error:", error);
  } else {
    console.log("Clients in DB count:", clients.length);
    console.log("Clients list:", clients.map(c => ({ id: c.id, prenom: c.prenom, nom: c.nom, tel: c.telephone })));
  }
}

test();
