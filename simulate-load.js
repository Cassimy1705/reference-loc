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

const initialClients = [
  { id: 1, prenom: "Hery", nom: "Rakoto", telephone: "034 12 345 67", email: "hery.rakoto@mail.mg", cin: "201234567890", permis: "DG-2021-0123", date_inscription: "2025-03-14" },
  { id: 2, prenom: "Sandra", nom: "Razafy", telephone: "033 98 765 43", email: "sandra@mail.mg", cin: "201987654321", permis: "DG-2022-0456", date_inscription: "2025-08-02" },
  { id: 3, prenom: "Jean", nom: "Andria", telephone: "032 24 725 69", email: "jean.a@mail.mg", cin: "201555444333", permis: "DG-2020-0789", date_inscription: "2024-11-20" },
];

const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (base, n) => { const d = new Date(base); d.setDate(d.getDate() + n); return d; };

const initialReservations = [
  { id: "RL-001", client_id: 1, voiture_id: 3, date_depart: iso(addDays(today, -2)), date_retour: iso(addDays(today, 3)), lieu_prise: "Aéroport Arrachart", montant: 110000 * 5, statut: "confirmed", created_at: iso(addDays(today, -5)) },
  { id: "RL-002", client_id: 2, voiture_id: 2, date_depart: iso(addDays(today, 1)), date_retour: iso(addDays(today, 6)), lieu_prise: "Centre-ville Diego", montant: 260000 * 5, statut: "pending", created_at: iso(addDays(today, -1)) },
  { id: "RL-003", client_id: 1, voiture_id: 1, date_depart: iso(addDays(today, -30)), date_retour: iso(addDays(today, -27)), lieu_prise: "Hôtel Allamanda", montant: 120000 * 3, statut: "done", created_at: iso(addDays(today, -32)) },
  { id: "RL-004", client_id: 3, voiture_id: 4, date_depart: iso(addDays(today, -60)), date_retour: iso(addDays(today, -53)), lieu_prise: "Aéroport Arrachart", montant: 130000 * 7, statut: "done", created_at: iso(addDays(today, -65)) },
  { id: "RL-005", client_id: 3, voiture_id: 2, date_depart: iso(addDays(today, 5)), date_retour: iso(addDays(today, 10)), lieu_prise: "Port de Diego", montant: 260000 * 5, statut: "pending", created_at: iso(addDays(today, 0)) },
];

async function simulate() {
  console.log("Simulating store loadData()...");
  try {
    // 1. Vehicles
    const { data: dbVehicules, error: vErr } = await supabase.from("vehicules").select("*").order("id");
    if (vErr) throw vErr;
    console.log("Vehicles loaded:", dbVehicules.length);

    // 2. Clients
    const { data: dbClients, error: cErr } = await supabase.from("clients").select("*").order("id");
    if (cErr) throw cErr;
    console.log("Clients loaded:", dbClients.length);

    // 3. Reservations
    const { data: dbReservations, error: rErr } = await supabase.from("reservations").select("*");
    if (rErr) throw rErr;
    console.log("Reservations loaded:", dbReservations?.length);

    // If reservations are empty, try inserting them
    if (!dbReservations || dbReservations.length === 0) {
      console.log("Reservations empty. Attempting to insert initialReservations...");
      const { data: inserted, error: insErr } = await supabase.from("reservations").insert(initialReservations).select();
      if (insErr) {
        console.error("FAILED to insert initialReservations:", insErr);
      } else {
        console.log("SUCCESS inserting initialReservations:", inserted.length);
      }
    }
    
    console.log("SIMULATION SUCCESSFUL! No errors thrown.");
  } catch (err) {
    console.error("SIMULATION FAILED WITH EXCEPTION:", err);
  }
}

simulate();
