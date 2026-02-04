import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Film, Target } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm">dot</span>
            <span className="text-xl font-semibold text-foreground">Casting</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Accedi</Button>
            </Link>
            <Link to="/auth">
              <Button>Registrati</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl text-foreground leading-tight mb-6">
            La piattaforma di casting
            <span className="text-primary"> più elegante</span> d'Italia
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Connetti talenti e opportunità. Gestisci casting, candidature e provini 
            in un'unica piattaforma professionale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="xl" className="w-full sm:w-auto">
                Inizia ora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Scopri di più
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl text-foreground text-center mb-12">
            Tutto ciò di cui hai bisogno
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-background">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl text-foreground mb-3">
                Database Talenti
              </h3>
              <p className="text-muted-foreground">
                Ricerca avanzata tra migliaia di profili verificati con filtri personalizzati.
              </p>
            </div>
            <div className="text-center p-8 rounded-xl bg-background">
              <div className="w-16 h-16 bg-olive rounded-full flex items-center justify-center mx-auto mb-6">
                <Film className="h-8 w-8 text-olive-foreground" />
              </div>
              <h3 className="text-xl text-foreground mb-3">
                Gestione Casting
              </h3>
              <p className="text-muted-foreground">
                Crea e gestisci casting completi con ruoli, requisiti e timeline.
              </p>
            </div>
            <div className="text-center p-8 rounded-xl bg-background">
              <div className="w-16 h-16 bg-charcoal rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-charcoal-foreground" />
              </div>
              <h3 className="text-xl text-foreground mb-3">
                Shortlist Smart
              </h3>
              <p className="text-muted-foreground">
                Crea target intelligenti e trova automaticamente i talenti perfetti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl text-foreground mb-6">
            Pronto a iniziare?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Unisciti a dotCasting e scopri un nuovo modo di gestire i casting.
          </p>
          <Link to="/auth">
            <Button size="xl">
              Crea il tuo account gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 dotCasting. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
