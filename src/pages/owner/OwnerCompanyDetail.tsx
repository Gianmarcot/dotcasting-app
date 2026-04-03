import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Plus, Pencil, Film, Users, Calendar,
  MapPin, Globe, Mail, Phone, User, Briefcase, ExternalLink,
} from "lucide-react";
import {
  useCompany, useCompanyCastings, useCompanyConfirmedTalents,
  useCompanyNotes, useCreateCompanyNote, useUpdateCompany, COMPANY_TYPES,
} from "@/hooks/useCompanies";
import { CompanyFormDialog } from "@/components/companies/CompanyFormDialog";
import { CastingFormDialog } from "@/components/castings/CastingFormDialog";
import { useCreateCasting } from "@/hooks/useCastings";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const statusColors: Record<string, string> = {
  draft: "bg-[#333333]/10 text-[#333333]",
  active: "bg-[#729128]/15 text-[#729128]",
  closed: "bg-[#A30A2B]/15 text-[#A30A2B]",
};

const statusLabels: Record<string, string> = {
  draft: "Bozza",
  active: "Attivo",
  closed: "Chiuso",
};

export const OwnerCompanyDetail = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [castingFormOpen, setCastingFormOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showAllCastings, setShowAllCastings] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", role: "", email: "", phone: "" });

  const { data: company, isLoading } = useCompany(companyId);
  const { data: castings } = useCompanyCastings(companyId);
  const { data: confirmedTalents } = useCompanyConfirmedTalents(companyId);
  const { data: notes } = useCompanyNotes(companyId);
  const createNote = useCreateCompanyNote();
  const updateCompany = useUpdateCompany();
  const createCasting = useCreateCasting();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Azienda non trovata</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/owner/companies")}>
          Torna alla lista
        </Button>
      </div>
    );
  }

  const contacts = Array.isArray(company.contacts_json) ? company.contacts_json as any[] : [];
  const typeLabel = COMPANY_TYPES.find((t) => t.value === company.type)?.label || company.type;
  const visibleCastings = showAllCastings ? castings : castings?.slice(0, 3);

  const handleSaveNote = () => {
    if (!noteText.trim() || !companyId) return;
    createNote.mutate(
      { company_id: companyId, body: noteText.trim() },
      {
        onSuccess: () => { setNoteText(""); toast({ title: "Nota salvata" }); },
        onError: () => toast({ title: "Errore nel salvataggio", variant: "destructive" }),
      },
    );
  };

  const handleEditSubmit = (data: any) => {
    updateCompany.mutate(
      { id: company.id, ...data },
      {
        onSuccess: () => { setEditOpen(false); toast({ title: "Azienda aggiornata" }); },
        onError: () => toast({ title: "Errore nell'aggiornamento", variant: "destructive" }),
      },
    );
  };

  const handleCreateCasting = (data: any) => {
    const castingData = {
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      company_id: company.id,
      locations: data.locations ? data.locations.split(",").map((l: string) => l.trim()) : [],
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      compensation_amount: data.compensation_amount ? parseFloat(data.compensation_amount) : null,
      compensation_type: data.compensation_type || null,
      currency: data.currency || "EUR",
    };
    createCasting.mutate(castingData, {
      onSuccess: (created) => {
        setCastingFormOpen(false);
        toast({ title: "Casting creato con successo" });
        navigate(`/owner/castings/${created.id}`);
      },
      onError: () => toast({ title: "Errore nella creazione", variant: "destructive" }),
    });
  };

  const handleAddContact = () => {
    if (!newContact.name.trim()) return;
    const updatedContacts = [...contacts, newContact];
    updateCompany.mutate(
      { id: company.id, contacts_json: updatedContacts },
      {
        onSuccess: () => {
          setAddContactOpen(false);
          setNewContact({ name: "", role: "", email: "", phone: "" });
          toast({ title: "Referente aggiunto" });
        },
      },
    );
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate("/owner/companies")} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Aziende
      </Button>

      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="h-16 w-16 rounded-full bg-[#333333]/10 flex items-center justify-center text-xl font-semibold text-[#333333] shrink-0">
          {getInitials(company.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">{company.name}</h1>
            {typeLabel && (
              <Badge className="bg-muted text-muted-foreground">{typeLabel}</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            {company.location && (
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{company.location}</span>
            )}
            {(company as any).email && (
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{(company as any).email}</span>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Globe className="h-3.5 w-3.5" />{company.website}
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" /> Modifica
          </Button>
          <Button onClick={() => setCastingFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nuovo casting
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[#A30A2B]/10 flex items-center justify-center">
              <Film className="h-5 w-5 text-[#A30A2B]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{castings?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Casting totali</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[#729128]/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#729128]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{confirmedTalents?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Talent impiegati</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[#C88500]/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-[#9A6700]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {castings?.[0]
                  ? format(new Date(castings[0].created_at), "dd MMM yyyy", { locale: itLocale })
                  : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Ultimo contatto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Casting */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Casting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!castings?.length ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nessun casting collegato</p>
              ) : (
                <>
                  {visibleCastings?.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/owner/castings/${c.id}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(c.created_at), "dd MMM yyyy", { locale: itLocale })}
                          {" · "}
                          {(c as any).casting_roles?.length || 0} ruoli
                        </p>
                      </div>
                      <Badge className={statusColors[c.status || "draft"]}>
                        {statusLabels[c.status || "draft"]}
                      </Badge>
                    </div>
                  ))}
                  {castings.length > 3 && !showAllCastings && (
                    <Button variant="ghost" className="w-full text-sm" onClick={() => setShowAllCastings(true)}>
                      Vedi tutti ({castings.length})
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Confirmed talents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Talent impiegati</CardTitle>
            </CardHeader>
            <CardContent>
              {!confirmedTalents?.length ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nessun talent confermato</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {confirmedTalents.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => navigate(`/owner/talents/${t.id}/view`)}
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={t.profile_photo_url || ""} />
                        <AvatarFallback className="text-xs bg-[#729128]/15 text-[#729128]">
                          {(t.first_name?.[0] || "") + (t.last_name?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">
                        {t.first_name} {t.last_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Note & attività</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Aggiungi una nota..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[72px]"
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={!noteText.trim() || createNote.isPending}
                  className="self-end"
                >
                  Salva
                </Button>
              </div>
              {notes?.length ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="border-l-2 border-muted pl-4 py-1">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{note.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(note.created_at), "dd MMM yyyy, HH:mm", { locale: itLocale })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">Nessuna nota</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-6">
          {/* Contacts */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Referenti</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setAddContactOpen(!addContactOpen)}>
                <Plus className="h-4 w-4 mr-1" /> Aggiungi
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {addContactOpen && (
                <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                  <Input
                    placeholder="Nome"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                  <Input
                    placeholder="Ruolo aziendale"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                  <Input
                    placeholder="Telefono"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setAddContactOpen(false)}>
                      Annulla
                    </Button>
                    <Button size="sm" onClick={handleAddContact} disabled={!newContact.name.trim()}>
                      Salva
                    </Button>
                  </div>
                </div>
              )}
              {contacts.length === 0 && !addContactOpen ? (
                <p className="text-sm text-muted-foreground text-center py-2">Nessun referente</p>
              ) : (
                contacts.map((contact: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                      {(contact.name || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{contact.name}</p>
                      {contact.role && <p className="text-xs text-muted-foreground">{contact.role}</p>}
                      {contact.email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {contact.email}
                        </p>
                      )}
                      {contact.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {contact.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informazioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Settore</span>
                <span className="text-foreground">{typeLabel || "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sede</span>
                <span className="text-foreground">{company.location || "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partita IVA</span>
                <span className="text-foreground">{(company as any).vat_number || "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sito web</span>
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-foreground hover:underline flex items-center gap-1">
                    Visita <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-foreground">—</span>
                )}
              </div>
              {company.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground block mb-1">Note interne</span>
                    <p className="text-foreground whitespace-pre-wrap">{company.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CompanyFormDialog
        company={company}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEditSubmit}
        isSubmitting={updateCompany.isPending}
      />

      <CastingFormDialog
        casting={null}
        open={castingFormOpen}
        onOpenChange={setCastingFormOpen}
        onSubmit={handleCreateCasting}
        isSubmitting={createCasting.isPending}
        defaultCompanyId={company.id}
      />
    </div>
  );
};

export default OwnerCompanyDetail;
