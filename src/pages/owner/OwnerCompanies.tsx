import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Phone, Mail, MapPin } from "lucide-react";

const mockCompanies = [
  {
    id: "1",
    name: "Beauty Brand Srl",
    type: "brand",
    location: "Milano",
    contact: "Mario Rossi",
    email: "m.rossi@beautybrand.it",
    phone: "+39 02 1234567",
    status: "active",
    castingsCount: 3,
  },
  {
    id: "2",
    name: "Fashion House SpA",
    type: "production",
    location: "Roma",
    contact: "Laura Bianchi",
    email: "l.bianchi@fashionhouse.it",
    phone: "+39 06 7654321",
    status: "active",
    castingsCount: 5,
  },
  {
    id: "3",
    name: "Fitness Co",
    type: "agency",
    location: "Torino",
    contact: "Marco Verdi",
    email: "m.verdi@fitnessco.it",
    phone: "+39 011 9876543",
    status: "lead",
    castingsCount: 1,
  },
];

const statusColors: Record<string, string> = {
  lead: "bg-[#C88500]/15 text-[#9A6700]",
  active: "bg-[#729128]/15 text-[#729128]",
  inactive: "bg-[#333333]/10 text-[#333333]",
};

export const OwnerCompanies = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">
            {it.backoffice.companiesCRM}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestisci i clienti e le aziende
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuova Azienda
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca aziende..."
          className="pl-10"
        />
      </div>

      {/* Companies list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-foreground text-lg">
                      {company.name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {company.type}
                    </p>
                  </div>
                  <Badge className={statusColors[company.status]}>
                    {company.status === "active" ? "Attivo" : company.status === "lead" ? "Lead" : "Inattivo"}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {company.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {company.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {company.phone}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Contatto: {company.contact}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {company.castingsCount} casting
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerCompanies;
