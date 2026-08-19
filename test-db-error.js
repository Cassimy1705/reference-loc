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
  console.log("Testing insert client with all fields...");

  const dummyClientId = Math.floor(Math.random() * 1000000) + 1000;
  const { data, error } = await supabase
    .from("clients")
    .insert({
      id: dummyClientId,
      prenom: "Test",
      nom: "ErrorChecking",
      telephone: "0000000000",
      email: "test@error.com",
      cin: "123456789",
      permis: "123456",
      date_inscription: new Date().toISOString().slice(0, 10),
      photo_url: "http://example.com/photo.jpg",
      cin_photo_url: "http://example.com/cin_recto.jpg",
      cin_verso_url: "http://example.com/cin_verso.jpg",
    })
    .select();

  if (error) {
    console.error("INSERT ERROR DETAILS:", error);
  } else {
    console.log("INSERT SUCCESSFUL:", data);
    // Cleanup
    await supabase.from("clients").delete().eq("id", dummyClientId);
  }
}

test();
