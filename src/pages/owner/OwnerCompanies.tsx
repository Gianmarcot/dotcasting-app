import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, MapPin, Film, Users, Calendar } from "lucide-react";
import { useCompaniesWithStats, useCreateCompany, COMPANY_TYPES } from "@/hooks/useCompanies";
import { CompanyFormDialog } from "@/components/companies/CompanyFormDialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getInitialColor(name: string) {
  const colors = [
    "bg-[#A30A2B]/15 text-[#A30A2B]",
    "bg-[#729128]/15 text-[#729128]",
    "bg-[#C88500]/15 text-[#9A6700]",
    "bg-[#333333]/15 text-[#333333]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const statusColors: Record<string, string> = {
  lead: "bg-[#C88500]/15 text-[#9A6700]",
  active: "bg-[#729128]/15 text-[#729128]",
  inactive: "bg-[#333333]/10 text-[#333333]",
};

export const OwnerCompanies = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const [formOpen, setFormOpen] = useState(false);

  const { data: companies, isLoading } = useCompaniesWithStats({ search, type: typeFilter, sort });
  const createCompany = useCreateCompany();

  const handleCreate = (data: any) => {
    createCompany.mutate(data, {
      onSuccess: () => {
        setFormOpen(false);
        toast({ title: "Azienda creata con successo" });
      },
      onError: () => toast({ title: "Errore nella creazione", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">Aziende</h1>
          <p className="text-muted-foreground mt-1">
            {companies ? `${companies.length} aziende` : "Caricamento..."}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuova Azienda
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Cerca aziende..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Settore" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i settori</SelectItem>
            {COMPANY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordina per" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="last_contact">Ultimo contatto</SelectItem>
            <SelectItem value="castings">N. casting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Companies list */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : companies?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nessuna azienda trovata</p>
          <p className="text-sm mt-1">Crea la prima azienda per iniziare</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {companies?.map((company) => {
            const contacts = Array.isArray(company.contacts_json) ? company.contacts_json : [];
            const mainContact = contacts[0] as any;
            const typeLabel = COMPANY_TYPES.find((t) => t.value === company.type)?.label || company.type;

            return (
              <Card
                key={company.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/owner/companies/${company.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Avatar initials */}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${getInitialColor(company.name)}`}>
                      {getInitials(company.name)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-foreground font-medium text-base truncate">
                            {company.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                            {typeLabel && <span className="capitalize">{typeLabel}</span>}
                            {company.location && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {company.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge className={statusColors[company.status || "lead"] || statusColors.lead}>
                          {company.status === "active" ? "Attivo" : company.status === "inactive" ? "Inattivo" : "Lead"}
                        </Badge>
                      </div>

                      {mainContact && (
                        <p className="text-sm text-muted-foreground">
                          Referente: {(mainContact as any).name || "—"}
                        </p>
                      )}

                      <div className="flex items-center gap-5 pt-1 border-t border-border text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Film className="h-3.5 w-3.5" />
                          {company.castings_count} casting
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {company.confirmed_talents_count} talent
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {company.last_casting_date
                            ? format(new Date(company.last_casting_date), "dd MMM yyyy", { locale: itLocale })
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CompanyFormDialog
        company={null}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isSubmitting={createCompany.isPending}
      />
    </div>
  );
};

export default OwnerCompanies;
