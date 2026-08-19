import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { useApp, ADMIN_PASSWORD } from "@/lib/store";
import { LayoutDashboard, Car, CalendarCheck, Users, BarChart3, LogOut, Lock } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace Admin — Référence Location" },
      { name: "description", content: "Espace d'administration de Référence Location." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/admin/vehicules", label: "Véhicules", icon: Car },
  { to: "/admin/reservations", label: "Réservations", icon: CalendarCheck },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/rapports", label: "Rapports", icon: BarChart3 },
] as const;

function AdminLayout() {
  const { state, setState } = useApp();
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!state.isAdmin) {
    return (
      <AppShell>
        <section className="mx-auto max-w-md px-4 sm:px-6 py-20">
          <Card className="border-primary/30" style={{ boxShadow: "var(--shadow-gold)" }}>
            <CardContent className="p-8">
              <div className="grid h-12 w-12 place-items-center rounded-md border border-primary/40 text-primary mx-auto">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="font-display text-2xl text-center mt-4">Espace Administrateur</h1>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Accès réservé à l'équipe Référence Location.
              </p>
              <form
                className="mt-6 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pwd === ADMIN_PASSWORD) {
                    setState((s) => ({ ...s, isAdmin: true }));
                    setErr("");
                  } else {
                    setErr("Mot de passe incorrect.");
                  }
                }}
              >
                <Label>Mot de passe</Label>
                <Input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoFocus
                />
                {err && <div className="text-xs text-destructive">{err}</div>}
                <Button type="submit" className="mt-2">
                  Se connecter
                </Button>

              </form>
            </CardContent>
          </Card>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Toaster richColors position="top-right" />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Administration</p>
            <h1 className="font-display text-4xl mt-2">Espace Admin</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setState((s) => ({ ...s, isAdmin: false }))}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>

        <div className="mt-8 border-b border-border/60 flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm border-b-2 whitespace-nowrap transition-colors ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </section>
    </AppShell>
  );
}
