import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp, formatAr, STATUT_LABEL, type Client } from "@/lib/store";
import { Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/clients")({
  component: AdminClients,
});

function AdminClients() {
  const { state, setState } = useApp();
  const [selected, setSelected] = useState<Client | null>(null);

  const remove = (id: number) => {
    if (!confirm("Supprimer ce client ?")) return;
    setState((s) => ({ ...s, clients: s.clients.filter((c) => c.id !== id) }));
    toast.success("Client supprimé.");
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-0">
        <div className="p-5 border-b border-border/60">
          <h2 className="font-display text-xl">Base clients</h2>
          <p className="text-sm text-muted-foreground">
            {state.clients.length} clients enregistrés
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="text-left px-5 py-3">Nom</th>
                <th className="text-left px-5 py-3">Téléphone</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">CIN</th>
                <th className="text-right px-5 py-3">Réservations</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.clients.map((c) => {
                const count = state.reservations.filter((r) => r.client_id === c.id).length;
                return (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="px-5 py-3">
                      {c.prenom} {c.nom}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.telephone}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-5 py-3 font-mono text-xs">{c.cin}</td>
                    <td className="px-5 py-3 text-right">{count}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(c)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {selected.prenom} {selected.nom}
                </DialogTitle>
              </DialogHeader>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Info label="Téléphone" value={selected.telephone} />
                <Info label="Email" value={selected.email} />
                <Info label="CIN" value={selected.cin} />
                <Info label="Permis" value={selected.permis} />
                <Info label="Inscrit le" value={selected.date_inscription} />
              </div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.15em] text-primary mb-3">
                  Historique
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {state.reservations
                    .filter((r) => r.client_id === selected.id)
                    .map((r) => {
                      const v = state.vehicules.find((x) => x.id === r.voiture_id);
                      return (
                        <div
                          key={r.id}
                          className="flex items-center justify-between border border-border/60 rounded-md px-4 py-2.5"
                        >
                          <div>
                            <div className="text-xs font-mono text-primary">{r.id}</div>
                            <div className="text-sm">
                              {v?.marque} {v?.modele} · {r.date_depart} → {r.date_retour}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{STATUT_LABEL[r.statut]}</Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatAr(r.montant)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/60 rounded-md px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</div>
      <div className="text-sm mt-0.5">{value}</div>
    </div>
  );
}
