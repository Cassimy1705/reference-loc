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

async function check() {
  console.log("Checking columns of 'clients' table...");
  const { data, error } = await supabase.rpc("get_table_columns", { table_name: "clients" });
  
  if (error) {
    // If RPC doesn't exist, let's try a select limit 1 or raw postgrest schema check
    console.log("RPC get_table_columns failed, trying select * limit 1...");
    const { data: selectData, error: selectError } = await supabase.from("clients").select("*").limit(1);
    if (selectError) {
      console.error("Select Error:", selectError);
    } else {
      console.log("Select succeeded. Columns present in first row:", selectData[0] ? Object.keys(selectData[0]) : "No rows found");
    }
  } else {
    console.log("Columns from RPC:", data);
  }
}

check();
