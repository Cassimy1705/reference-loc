import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useApp, formatAr, daysBetween, nextReservationId, type Vehicule } from "@/lib/store";
import { CalendarDays, Users, Car, Shield, Clock, MapPin, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Référence Location — Diego Suarez · Location de voiture" },
      {
        name: "description",
        content:
          "Réservez en ligne votre voiture à Diego Suarez : Hyundai Getz P2, Hyundai Starex, Kia Morning P2, Kia Morning P3. Disponible 7j/7.",
      },
      { property: "og:title", content: "Référence Location de Voiture" },
      {
        property: "og:description",
        content: "Le parc de référence à Diego Suarez. Réservation en ligne en quelques clics.",
      },
    ],
  }),
  component: Accueil,
});

function Accueil() {
  const { state } = useApp();
  const [type, setType] = useState<string>("all");
  const [places, setPlaces] = useState<string>("all");
  const [dateDepart, setDateDepart] = useState("");
  const [dateRetour, setDateRetour] = useState("");
  const [selected, setSelected] = useState<Vehicule | null>(null);

  const filtered = useMemo(() => {
    return state.vehicules.filter((v) => {
      if (type !== "all" && v.type !== type) return false;
      if (places !== "all" && v.places < parseInt(places, 10)) return false;
      return true;
    });
  }, [state.vehicules, type, places]);

  return (
    <AppShell>
      <Toaster richColors position="top-right" />
      <Hero vehiculesCount={state.vehicules.length} />
      <SearchBar
        type={type}
        setType={setType}
        places={places}
        setPlaces={setPlaces}
        dateDepart={dateDepart}
        setDateDepart={setDateDepart}
        dateRetour={dateRetour}
        setDateRetour={setDateRetour}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Notre parc</p>
            <h2 className="font-display text-3xl sm:text-4xl mt-2">Véhicules disponibles</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            {filtered.length} véhicule{filtered.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VehiculeCard
              key={v.id}
              v={v}
              dateDepart={dateDepart}
              dateRetour={dateRetour}
              onReserve={() => setSelected(v)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              Aucun véhicule ne correspond à vos critères.
            </div>
          )}
        </div>
      </section>

      <Trust />

      <ReservationModal
        vehicule={selected}
        onClose={() => setSelected(null)}
        prefillDepart={dateDepart}
        prefillRetour={dateRetour}
      />
    </AppShell>
  );
}

function Hero({ vehiculesCount }: { vehiculesCount: number }) {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 opacity-[0.05] bg-hero-glow" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Diego Suarez · Antsiranana
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl mt-6 leading-[1.05]">
            La <span className="text-gradient-gold">référence</span> de la location{" "}
            <br className="hidden sm:block" />
            de voiture dans le Nord.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Hyundai Getz P2, Hyundai Starex, Kia Morning P2, Kia Morning P3 — à la journée. Service
            client 7j/7 — 24h/24, prise en charge à l'aéroport, en ville ou à votre hôtel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild className="font-medium">
              <a href="#parc">Réserver maintenant</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="tel:+261344691102">Appeler 034 46 911 02</a>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl">
          <Stat value={`${vehiculesCount}+`} label="Véhicules au parc" />
          <Stat value="12 ans" label="d'expérience" />
          <Stat value="24/7" label="Disponibilité" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-primary/30 pt-4">
      <div className="font-display text-3xl sm:text-4xl text-primary">{value}</div>
      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

interface SearchBarProps {
  type: string;
  setType: (v: string) => void;
  places: string;
  setPlaces: (v: string) => void;
  dateDepart: string;
  setDateDepart: (v: string) => void;
  dateRetour: string;
  setDateRetour: (v: string) => void;
}

function SearchBar(p: SearchBarProps) {
  return (
    <div id="parc" className="mx-auto max-w-7xl px-4 sm:px-6 -mt-12 relative z-10">
      <Card className="border-primary/20 shadow-card">
        <CardContent className="p-6 grid gap-4 md:grid-cols-5">
          <div>
            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Type
            </Label>
            <Select value={p.type} onValueChange={p.setType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Hyundai Getz Phase 2">Hyundai Getz Phase 2</SelectItem>
                <SelectItem value="Hyundai Starex">Hyundai Starex</SelectItem>
                <SelectItem value="Kia Morning Phase 2">Kia Morning Phase 2</SelectItem>
                <SelectItem value="Kia Morning Phase 3">Kia Morning Phase 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Places
            </Label>
            <Select value={p.places} onValueChange={p.setPlaces}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
                <SelectItem value="7">7+</SelectItem>
                <SelectItem value="9">9+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Départ
            </Label>
            <Input
              type="date"
              value={p.dateDepart}
              onChange={(e) => p.setDateDepart(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Retour
            </Label>
            <Input
              type="date"
              value={p.dateRetour}
              onChange={(e) => p.setDateRetour(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full h-10"
              onClick={() => {
                document.getElementById("parc")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VehiculeCard({
  v,
  dateDepart,
  dateRetour,
  onReserve,
}: {
  v: Vehicule;
  dateDepart: string;
  dateRetour: string;
  onReserve: () => void;
}) {
  const jours = dateDepart && dateRetour ? daysBetween(dateDepart, dateRetour) : null;
  const [showImage, setShowImage] = useState(false);
  const images = v.images && v.images.length > 0 ? v.images : v.image_url ? [v.image_url] : [];
  const [imgIdx, setImgIdx] = useState(0);

  const nextImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImgIdx((i) => (i + 1) % images.length);
  };
  const prevImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImgIdx((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <Card className="group overflow-hidden border-border/60 hover:border-primary/40 shadow-card transition-all flex flex-col">
      <div className="relative h-44 w-full overflow-hidden bg-muted shrink-0">
        {images.length > 0 ? (
          <>
            <img
              src={images[imgIdx]}
              alt={`${v.marque} ${v.modele}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
              onClick={() => setShowImage(true)}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-20"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${idx === imgIdx ? "w-4 bg-primary" : "w-1.5 bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
            <Dialog open={showImage} onOpenChange={setShowImage}>
              <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none [&>button]:bg-black/50 [&>button]:text-white [&>button]:hover:bg-black/70 [&>button]:rounded-full">
                <DialogTitle className="sr-only">{v.marque} {v.modele}</DialogTitle>
                <div className="relative flex items-center justify-center">
                  <img
                    src={images[imgIdx]}
                    alt={`${v.marque} ${v.modele}`}
                    className="w-full h-auto rounded-lg object-contain max-h-[85vh]"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImg}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={nextImg}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-vehicle-fallback">
            <span className="transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl">
              {v.emoji}
            </span>
          </div>
        )}
        <Badge
          className={`absolute top-3 right-3 z-10 ${v.disponible ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          {v.disponible ? "Disponible" : "En location"}
        </Badge>
        <span className="absolute top-3 left-3 z-10 text-[10px] uppercase tracking-[0.18em] text-white bg-black/60 px-2 py-0.5 rounded font-medium backdrop-blur-sm">
          {v.type}
        </span>
      </div>
      <CardContent className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-xl">
            {v.marque} {v.modele}
          </h3>
          <span className="text-xs text-muted-foreground">{v.immatriculation}</span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {v.places} places
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Car className="h-4 w-4" />
            {v.type}
          </span>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="font-display text-2xl text-primary">{formatAr(v.prix_jour)}</div>
            <div className="text-xs text-muted-foreground">
              par jour {jours ? `· ${jours} j = ${formatAr(v.prix_jour * jours)}` : ""}
            </div>
          </div>
          <Button disabled={!v.disponible} onClick={onReserve} size="sm">
            Réserver
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReservationModal({
  vehicule,
  onClose,
  prefillDepart,
  prefillRetour,
}: {
  vehicule: Vehicule | null;
  onClose: () => void;
  prefillDepart: string;
  prefillRetour: string;
}) {
  if (!vehicule) return null;
  return (
    <ReservationModalInner
      key={vehicule.id}
      vehicule={vehicule}
      onClose={onClose}
      prefillDepart={prefillDepart}
      prefillRetour={prefillRetour}
    />
  );
}

function ReservationModalInner({
  vehicule,
  onClose,
  prefillDepart,
  prefillRetour,
}: {
  vehicule: Vehicule;
  onClose: () => void;
  prefillDepart: string;
  prefillRetour: string;
}) {
  const { state, setState } = useApp();
  const client = state.clients.find((c) => c.id === state.currentClientId);
  const [nom, setNom] = useState(client ? `${client.prenom} ${client.nom}` : "");
  const [tel, setTel] = useState(client?.telephone ?? "");
  const [depart, setDepart] = useState(prefillDepart);
  const [retour, setRetour] = useState(prefillRetour);
  const [lieu, setLieu] = useState("Aéroport Arrachart");

  const validDates = depart && retour && new Date(retour) > new Date(depart);
  const jours = validDates ? daysBetween(depart, retour) : 0;
  const total = jours * vehicule.prix_jour;

  const submit = () => {
    if (!nom.trim() || !tel.trim() || !validDates || !lieu.trim()) {
      toast.error("Merci de compléter tous les champs (date retour > date départ).");
      return;
    }
    const ref = nextReservationId(state.reservations);
    setState((s) => ({
      ...s,
      reservations: [
        ...s.reservations,
        {
          id: ref,
          client_id: s.currentClientId,
          voiture_id: vehicule.id,
          date_depart: depart,
          date_retour: retour,
          lieu_prise: lieu,
          montant: total,
          statut: "pending",
          created_at: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
    toast.success(`Réservation ${ref} créée — nous vous appelons sous peu.`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Réserver {vehicule.marque} {vehicule.modele}
          </DialogTitle>
          <DialogDescription>
            {vehicule.type} · {vehicule.places} places · {formatAr(vehicule.prix_jour)}/jour
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Nom complet</Label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1.5"
              placeholder="Prénom Nom"
            />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="mt-1.5"
              placeholder="034 xx xxx xx"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date départ</Label>
              <Input
                type="date"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Date retour</Label>
              <Input
                type="date"
                value={retour}
                onChange={(e) => setRetour(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label>Lieu de prise en charge</Label>
            <Input value={lieu} onChange={(e) => setLieu(e.target.value)} className="mt-1.5" />
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {jours} jour{jours > 1 ? "s" : ""} × {formatAr(vehicule.prix_jour)}
            </span>
            <span className="font-display text-2xl text-primary">{formatAr(total)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={!validDates}>
            Confirmer la réservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Trust() {
  const items = [
    {
      icon: Shield,
      title: "Véhicules entretenus",
      text: "Contrôle technique régulier sur l'ensemble de notre parc.",
    },
    {
      icon: Clock,
      title: "Service 24/7",
      text: "Une équipe joignable de jour comme de nuit, 7 jours sur 7.",
    },
    {
      icon: MapPin,
      title: "Prise en charge partout",
      text: "Aéroport Arrachart, hôtels, centre-ville, port — nous vous livrons.",
    },
    {
      icon: CalendarDays,
      title: "Réservation rapide",
      text: "Confirmation en quelques minutes par téléphone ou email.",
    },
  ];
  return (
    <section className="border-t border-border/60 bg-sidebar/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid gap-8 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.title}>
            <span className="grid h-10 w-10 place-items-center rounded-md border border-primary/30 text-primary">
              <it.icon className="h-5 w-5" />
            </span>
            <div className="font-display text-lg mt-4">{it.title}</div>
            <p className="text-sm text-muted-foreground mt-1.5">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
