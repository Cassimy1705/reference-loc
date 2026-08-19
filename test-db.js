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
  console.log("Checking Supabase connection to:", supabaseUrl);

  console.log("\n--- 1. Checking 'clients' table ---");
  const { data: clients, error: errClients } = await supabase.from("clients").select("*");
  console.log(
    "Read clients result:",
    errClients ? `Error: ${errClients.message}` : `Success. Count: ${clients.length}`,
  );

  const dummyClientId = Math.floor(Math.random() * 1000000) + 1000;
  const { error: errInsertClient } = await supabase.from("clients").insert({
    id: dummyClientId,
    prenom: "Test",
    nom: "Connection",
    telephone: "0000000000",
    email: "test@connection.com",
    cin: "123456789",
    permis: "123456",
    date_inscription: new Date().toISOString().slice(0, 10),
  });
  console.log(
    "Insert client result:",
    errInsertClient ? `Error: ${errInsertClient.message}` : "Success",
  );

  console.log("\n--- 2. Checking 'vehicules' table ---");
  const { data: vehicules, error: errVehicules } = await supabase.from("vehicules").select("*");
  console.log(
    "Read vehicules result:",
    errVehicules ? `Error: ${errVehicules.message}` : `Success. Count: ${vehicules.length}`,
  );

  console.log("\n--- 3. Checking 'reservations' table ---");
  const { data: reservations, error: errReservations } = await supabase
    .from("reservations")
    .select("*");
  console.log(
    "Read reservations result:",
    errReservations
      ? `Error: ${errReservations.message}`
      : `Success. Count: ${reservations.length}`,
  );

  const { error: errInsertRes } = await supabase.from("reservations").insert({
    id: "RL-TEST",
    client_id: 1,
    voiture_id: 1,
    date_depart: "2026-06-20",
    date_retour: "2026-06-25",
    lieu_prise: "Diego",
    montant: 500000,
    statut: "pending",
    created_at: new Date().toISOString(),
  });
  console.log(
    "Insert reservation result:",
    errInsertRes ? `Error: ${errInsertRes.message}` : "Success",
  );
  if (!errInsertRes) {
    await supabase.from("reservations").delete().eq("id", "RL-TEST");
  }
}

test();
