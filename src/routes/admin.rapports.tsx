import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { useApp, formatAr } from "@/lib/store";

export const Route = createFileRoute("/admin/rapports")({
  component: AdminRapports,
});

const MOIS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

function AdminRapports() {
  const { state } = useApp();
  const year = new Date().getFullYear();

  const byMonth = MOIS.map((_, i) => {
    const prefix = `${year}-${String(i + 1).padStart(2, "0")}`;
    return state.reservations
      .filter((r) => r.statut !== "cancelled" && r.created_at.startsWith(prefix))
      .reduce((s, r) => s + r.montant, 0);
  });
  const total = byMonth.reduce((s, n) => s + n, 0);
  const maxMonth = Math.max(1, ...byMonth);
  const nbDone = state.reservations.filter((r) => r.statut === "done").length;
  const occupied = state.vehicules.filter((v) => !v.disponible).length;
  const occupRate = Math.round((occupied / Math.max(1, state.vehicules.length)) * 100);

  const ranking = [...state.vehicules]
    .map((v) => ({
      ...v,
      count: state.reservations.filter((r) => r.voiture_id === v.id && r.statut !== "cancelled")
        .length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxRank = Math.max(1, ...ranking.map((r) => r.count));

  const stats = [
    { label: "Revenus annuels", value: formatAr(total) },
    { label: "Moyenne mensuelle", value: formatAr(Math.round(total / 12)) },
    { label: "Locations terminées", value: nbDone },
    { label: "Taux d'occupation", value: `${occupRate} %` },
  ];

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {s.label}
              </div>
              <div className="font-display text-2xl text-primary mt-3">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <h2 className="font-display text-xl">Revenus mensuels {year}</h2>
          <div className="mt-6 grid grid-cols-12 gap-2 h-56 items-end">
            {byMonth.map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${(val / maxMonth) * 100}%`,
                    minHeight: val > 0 ? "8px" : "2px",
                    background: "var(--gradient-gold)",
                    opacity: val > 0 ? 1 : 0.15,
                  }}
                />
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {MOIS[i]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <h2 className="font-display text-xl">Véhicules les plus loués</h2>
          <div className="mt-6 space-y-4">
            {ranking.map((v) => (
              <div key={v.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span>
                    <span className="mr-2 text-lg">{v.emoji}</span>
                    {v.marque} {v.modele}
                  </span>
                  <span className="text-muted-foreground">
                    {v.count} location{v.count > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(v.count / maxRank) * 100}%`,
                      background: "var(--gradient-gold)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
