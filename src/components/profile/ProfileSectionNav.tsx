import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
}

export const PROFILE_NAV_ITEMS: NavItem[] = [
  { id: "basic-info", label: "Informazioni personali" },
  { id: "about-me", label: "Chi sono" },
  { id: "talent-roles", label: "Ruoli e Talenti" },
  { id: "media-gallery", label: "Galleria media" },
  { id: "measurements", label: "Misure e Aspetto" },
  { id: "physical-features", label: "Segni particolari" },
  { id: "abilities", label: "Ulteriori abilità" },
  { id: "skills", label: "Competenze" },
  { id: "languages", label: "Lingue" },
  { id: "contact-info", label: "Contatti" },
  { id: "address", label: "Indirizzo" },
  { id: "documents", label: "Documenti e Fiscalità" },
  { id: "work-info", label: "Lavoro" },
  { id: "travel", label: "Viaggi e Visti" },
];

export const ProfileSectionNav = () => {
  const [activeId, setActiveId] = useState<string>(PROFILE_NAV_ITEMS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the top-most section currently intersecting the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    PROFILE_NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Card className="hidden lg:block sticky top-8">
      <CardContent className="p-4">
        <p className="text-xs font-display uppercase tracking-wide text-muted-foreground mb-3">
          Sezioni
        </p>
        <nav>
          <ul className="space-y-1">
            {PROFILE_NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className={cn(
                      "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
};
