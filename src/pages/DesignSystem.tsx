import { useEffect, useState } from "react";

import {
  Bell,
  Check,
  ChevronRight,
  Film,
  LayoutDashboard,
  Pencil,
  Star,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TalentTile } from "@/pages/shared/TalentTile";
import { MOCK_SHARED_ROUND } from "@/pages/shared/sharedRoundMock";
import { CastingFilters } from "@/components/castings/CastingFilters";
import type { CastingSort } from "@/hooks/useCastings";
import { TalentBoardCard } from "@/components/talents/TalentBoardCard";
import { TalentPreviewDrawer } from "@/components/talents/TalentPreviewDrawer";
import type { TalentWithAttributes } from "@/hooks/useTalents";

const CastingFiltersDemo = () => {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CastingSort>("recent");
  return (
    <CastingFilters
      status={status}
      search={search}
      sort={sort}
      onStatusChange={setStatus}
      onSearchChange={setSearch}
      onSortChange={setSort}
    />
  );
};

const MOCK_DB_TALENTS: Array<{
  talent: TalentWithAttributes;
  photos: { url: string; thumbnail_url: string | null }[];
  materials: { photos: number; videos: number; hasPdf: boolean };
}> = [
  {
    talent: {
      id: "ds-t1", user_id: "ds-u1",
      first_name: "Giulia", last_name: "Rossi", stage_name: null,
      city: "Milano", country: "Italia", gender: "female",
      birth_date: "1996-04-12", profile_photo_url: null,
      talent_categories: ["Modella", "Attrice"], bio: null,
      nationality: "Italiana", ethnicity: "Caucasica",
      gender_identity: null, representation_type: null, has_vat_number: true,
      attributes: {
        height: 176, weight: 58, hair_color: "Castano", hair_length: "Lunghi",
        eye_color: "Verdi", skills: ["Danza", "Equitazione"], languages: ["Italiano", "Inglese"],
        chest: 86, hips: 92, shirt_size: "S", shoe_size: "38",
      },
    },
    photos: [
      { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80", thumbnail_url: null },
      { url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80", thumbnail_url: null },
    ],
    materials: { photos: 12, videos: 2, hasPdf: true },
  },
  {
    talent: {
      id: "ds-t2", user_id: "ds-u2",
      first_name: "Marco", last_name: "Bianchi", stage_name: null,
      city: "Roma", country: "Italia", gender: "male",
      birth_date: "1990-11-03", profile_photo_url: null,
      talent_categories: ["Attore"], bio: null,
      nationality: "Italiana", ethnicity: "Caucasica",
      gender_identity: null, representation_type: null, has_vat_number: false,
      attributes: {
        height: 184, weight: 78, hair_color: "Nero", hair_length: "Corti",
        eye_color: "Marroni", skills: ["Recitazione"], languages: ["Italiano"],
        chest: 100, hips: 95, shirt_size: "L", shoe_size: "44",
      },
    },
    photos: [
      { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80", thumbnail_url: null },
    ],
    materials: { photos: 6, videos: 0, hasPdf: false },
  },
  {
    talent: {
      id: "ds-t3", user_id: "ds-u3",
      first_name: "Sara", last_name: "Verdi", stage_name: null,
      city: "Torino", country: "Italia", gender: "female",
      birth_date: "1999-07-21", profile_photo_url: null,
      talent_categories: ["Modella"], bio: null,
      nationality: "Italiana", ethnicity: "Caucasica",
      gender_identity: null, representation_type: null, has_vat_number: false,
      attributes: {
        height: 170, weight: 55, hair_color: "Biondo", hair_length: "Medi",
        eye_color: "Azzurri", skills: [], languages: ["Italiano", "Francese"],
        chest: 84, hips: 90, shirt_size: "S", shoe_size: "37",
      },
    },
    photos: [
      { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&q=80", thumbnail_url: null },
    ],
    materials: { photos: 9, videos: 1, hasPdf: true },
  },
  {
    talent: {
      id: "ds-t4", user_id: "ds-u4",
      first_name: "Luca", last_name: "Neri", stage_name: null,
      city: "Napoli", country: "Italia", gender: "male",
      birth_date: "1988-02-08", profile_photo_url: null,
      talent_categories: ["Attore", "Presentatore"], bio: null,
      nationality: "Italiana", ethnicity: "Caucasica",
      gender_identity: null, representation_type: null, has_vat_number: true,
      attributes: {
        height: 179, weight: 75, hair_color: "Castano", hair_length: "Corti",
        eye_color: "Marroni", skills: ["Canto"], languages: ["Italiano", "Inglese", "Spagnolo"],
        chest: 98, hips: 94, shirt_size: "M", shoe_size: "43",
      },
    },
    photos: [
      { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80", thumbnail_url: null },
    ],
    materials: { photos: 4, videos: 0, hasPdf: false },
  },
];

const TalentDatabaseDemo = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = MOCK_DB_TALENTS.find((t) => t.talent.id === openId) ?? null;
  return (
    <>
      <div className="bg-[#1A1A1A] rounded-3xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MOCK_DB_TALENTS.map((entry) => (
            <TalentBoardCard
              key={entry.talent.id}
              talent={entry.talent}
              photos={entry.photos as any}
              materialIndicators={entry.materials}
              onClick={() => setOpenId(entry.talent.id)}
            />
          ))}
        </div>
      </div>
      <TalentPreviewDrawer
        talent={active?.talent ?? null}
        open={!!active}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </>
  );
};



// ---------- Token helpers ----------
const useComputedVar = (name: string) => {
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${name}`)
      .trim();
    setValue(v);
  }, [name]);
  return value;
};

const ColorSwatch = ({ token, label }: { token: string; label?: string }) => {
  const value = useComputedVar(token);
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-20 w-full rounded-2xl border border-border/60 shadow-sm"
        style={{ background: value ? `hsl(${value})` : undefined }}
      />
      <div className="text-xs">
        <div className="font-medium text-foreground">{label ?? token}</div>
        <div className="text-muted-foreground font-mono">--{token}</div>
        <div className="text-muted-foreground font-mono">{value || "—"}</div>
      </div>
    </div>
  );
};

// ---------- Section wrapper ----------
const Section = ({
  id,
  title,
  caption,
  children,
}: {
  id: string;
  title: string;
  caption?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-8 space-y-6">
    <header className="space-y-1 border-b border-border/60 pb-3">
      <h2 className="text-2xl font-display uppercase tracking-wide">{title}</h2>
      {caption && (
        <p className="text-sm text-muted-foreground font-mono">{caption}</p>
      )}
    </header>
    {children}
  </section>
);

const SubBlock = ({
  title,
  source,
  children,
}: {
  title: string;
  source?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-baseline justify-between gap-4">
      <h3 className="text-sm font-display uppercase tracking-wider text-foreground">
        {title}
      </h3>
      {source && (
        <code className="text-[11px] text-muted-foreground font-mono">
          {source}
        </code>
      )}
    </div>
    <div className="rounded-2xl border border-border/60 bg-white p-6">
      {children}
    </div>
  </div>
);

// ---------- Sections ----------
const TokensSection = () => {
  const semantic = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "destructive-foreground",
    "border",
    "input",
    "ring",
    "success",
    "warning",
    "info",
    "olive",
    "charcoal",
  ];
  const sidebar = [
    "sidebar-background",
    "sidebar-foreground",
    "sidebar-primary",
    "sidebar-accent",
    "sidebar-border",
    "sidebar-ring",
  ];

  return (
    <Section
      id="tokens"
      title="Tokens"
      caption="src/index.css · CSS variables (HSL)"
    >
      <SubBlock title="Colori semantici" source="--{token}">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {semantic.map((t) => (
            <ColorSwatch key={t} token={t} />
          ))}
        </div>
      </SubBlock>

      <SubBlock title="Sidebar admin" source="--sidebar-*">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {sidebar.map((t) => (
            <ColorSwatch key={t} token={t} />
          ))}
        </div>
      </SubBlock>

      <SubBlock title="Border radius" source="--radius">
        <div className="flex flex-wrap gap-4">
          {[
            { label: "sm (calc-4)", cls: "rounded-sm" },
            { label: "md (calc-2)", cls: "rounded-md" },
            { label: "lg (--radius)", cls: "rounded-lg" },
            { label: "2xl", cls: "rounded-2xl" },
            { label: "3xl (dc-card)", cls: "rounded-3xl" },
            { label: "full (pill)", cls: "rounded-full" },
          ].map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "h-20 w-20 bg-primary/10 border border-primary/40",
                  r.cls,
                )}
              />
              <span className="text-xs text-muted-foreground">{r.label}</span>
            </div>
          ))}
        </div>
      </SubBlock>

      <SubBlock title="Shadow" source="tailwind shadow-*">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {["shadow-sm", "shadow", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl"].map(
            (s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className={cn("h-20 w-full rounded-2xl bg-white", s)} />
                <span className="text-xs text-muted-foreground font-mono">
                  {s}
                </span>
              </div>
            ),
          )}
        </div>
      </SubBlock>

      <SubBlock title="Spacing scale" source="p-1 … p-16">
        <div className="space-y-2">
          {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
            <div key={n} className="flex items-center gap-4">
              <span className="w-12 text-xs font-mono text-muted-foreground">
                p-{n}
              </span>
              <div className={`bg-primary/20 h-4`} style={{ width: `${n * 0.25}rem` }} />
              <span className="text-xs text-muted-foreground">
                {n * 0.25}rem
              </span>
            </div>
          ))}
        </div>
      </SubBlock>
    </Section>
  );
};

const TypographySection = () => (
  <Section
    id="typography"
    title="Typography"
    caption="src/index.css · Tenor Sans (display) + DM Sans (body)"
  >
    <SubBlock title="Display · Tenor Sans">
      <div className="space-y-3 font-display uppercase tracking-wide">
        <p className="text-5xl">Titolo hero 5xl</p>
        <p className="text-3xl">Titolo sezione 3xl</p>
        <p className="text-2xl">H1 pagina 2xl</p>
        <p className="text-xl">Sottotitolo xl</p>
        <p className="text-base">Etichetta base</p>
      </div>
    </SubBlock>

    <SubBlock title="Body · DM Sans">
      <div className="space-y-2">
        <p className="text-lg">Lorem ipsum dolor sit amet — text-lg regular</p>
        <p className="text-base">
          Lorem ipsum dolor sit amet — text-base regular
        </p>
        <p className="text-sm">Lorem ipsum dolor sit amet — text-sm regular</p>
        <p className="text-sm font-medium">
          Lorem ipsum dolor sit amet — text-sm medium
        </p>
        <p className="text-xs text-muted-foreground">
          Lorem ipsum — text-xs muted
        </p>
      </div>
    </SubBlock>

    <SubBlock title="Utility" source=".dc-link-action">
      <a href="#" className="dc-link-action">
        Vai al dettaglio <ChevronRight className="h-4 w-4" />
      </a>
    </SubBlock>
  </Section>
);

const PrimitivesSection = () => (
  <Section
    id="primitives"
    title="Primitive shadcn"
    caption="src/components/ui/*"
  >
    <SubBlock title="Button · Matrice completa" source="src/components/ui/button.tsx">
      {(() => {
        const variants: Array<{ v: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "olive" | "charcoal"; label: string }> = [
          { v: "default", label: "Default" },
          { v: "secondary", label: "Secondary" },
          { v: "outline", label: "Outline" },
          { v: "ghost", label: "Ghost" },
          { v: "link", label: "Link" },
          { v: "destructive", label: "Destructive" },
          { v: "olive", label: "Olive" },
          { v: "charcoal", label: "Charcoal" },
        ];
        const sizes: Array<{ s: "sm" | "md" | "lg"; label: string }> = [
          { s: "sm", label: "sm · 36" },
          { s: "md", label: "md · 40" },
          { s: "lg", label: "lg · 48" },
        ];
        const iconSizes: Array<{ s: "icon-sm" | "icon-md" | "icon-lg"; label: string }> = [
          { s: "icon-sm", label: "icon-sm · 36" },
          { s: "icon-md", label: "icon-md · 40" },
          { s: "icon-lg", label: "icon-lg · 48" },
        ];
        const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
          <div className="grid grid-cols-[160px_1fr] items-center gap-6 py-3 border-b border-border/40 last:border-b-0">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">{label}</span>
            <div className="flex flex-wrap items-center gap-3">{children}</div>
          </div>
        );
        return (
          <div className="space-y-8">
            <div>
              <h4 className="font-tenor uppercase tracking-widest text-xs text-muted-foreground mb-2">Varianti (size md)</h4>
              <div className="dc-card p-4">
                {variants.map((v) => (
                  <Row key={v.v} label={v.label}>
                    <Button variant={v.v}>Label</Button>
                    <Button variant={v.v} iconPosition="left"><Pencil /> Con icona</Button>
                    <Button variant={v.v} iconPosition="right">Con icona <ChevronRight /></Button>
                    <Button variant={v.v} disabled>Disabled</Button>
                  </Row>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-tenor uppercase tracking-widest text-xs text-muted-foreground mb-2">Sizes testo</h4>
              <div className="dc-card p-4">
                {sizes.map((s) => (
                  <Row key={s.s} label={s.label}>
                    <Button size={s.s}>Default</Button>
                    <Button size={s.s} variant="secondary">Secondary</Button>
                    <Button size={s.s} variant="outline">Outline</Button>
                  </Row>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-tenor uppercase tracking-widest text-xs text-muted-foreground mb-2">Icona a sinistra</h4>
              <div className="dc-card p-4">
                {sizes.map((s) => (
                  <Row key={s.s} label={s.label}>
                    <Button size={s.s} iconPosition="left"><Pencil /> Modifica</Button>
                    <Button size={s.s} variant="secondary" iconPosition="left"><Bell /> Notifiche</Button>
                    <Button size={s.s} variant="outline" iconPosition="left"><Trash2 /> Elimina</Button>
                  </Row>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-tenor uppercase tracking-widest text-xs text-muted-foreground mb-2">Icona a destra</h4>
              <div className="dc-card p-4">
                {sizes.map((s) => (
                  <Row key={s.s} label={s.label}>
                    <Button size={s.s} iconPosition="right">Prosegui <ChevronRight /></Button>
                    <Button size={s.s} variant="secondary" iconPosition="right">Apri <ChevronRight /></Button>
                    <Button size={s.s} variant="outline" iconPosition="right">Dettagli <ChevronRight /></Button>
                  </Row>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-tenor uppercase tracking-widest text-xs text-muted-foreground mb-2">Solo icona (quadrati)</h4>
              <div className="dc-card p-4">
                {iconSizes.map((s) => (
                  <Row key={s.s} label={s.label}>
                    <Button size={s.s} aria-label="Modifica"><Pencil /></Button>
                    <Button size={s.s} variant="secondary" aria-label="Elimina"><Trash2 /></Button>
                    <Button size={s.s} variant="outline" aria-label="Notifiche"><Bell /></Button>
                    <Button size={s.s} variant="ghost" aria-label="Preferito"><Star /></Button>
                    <Button size={s.s} variant="destructive" aria-label="Elimina"><Trash2 /></Button>
                  </Row>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </SubBlock>


    <SubBlock title="Form controls" source="input, textarea, select, checkbox, radio, switch, slider">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Input</Label>
          <Input placeholder="Scrivi qui…" />
          <Input placeholder="Disabled" disabled />
        </div>
        <div className="space-y-2">
          <Label>Textarea</Label>
          <Textarea placeholder="Testo lungo…" />
        </div>
        <div className="space-y-2">
          <Label>Select</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Opzione A</SelectItem>
              <SelectItem value="b">Opzione B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="ds-cb" defaultChecked />
            <Label htmlFor="ds-cb">Checkbox</Label>
          </div>
          <RadioGroup defaultValue="a" className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="a" id="ds-r-a" />
              <Label htmlFor="ds-r-a">Radio A</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="b" id="ds-r-b" />
              <Label htmlFor="ds-r-b">Radio B</Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-2">
            <Switch id="ds-sw" defaultChecked />
            <Label htmlFor="ds-sw">Switch</Label>
          </div>
          <div>
            <Label>Slider</Label>
            <Slider defaultValue={[40]} max={100} step={1} className="mt-3" />
          </div>
        </div>
      </div>
    </SubBlock>

    <SubBlock title="Badge">
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
    </SubBlock>

    <SubBlock title="Avatar · Sizes (32 · 48 · 64)">
      <div className="flex items-end gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar size="sm">
            <AvatarImage src="https://i.pravatar.cc/64?img=12" />
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">sm · 32px</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Avatar size="md">
            <AvatarImage src="https://i.pravatar.cc/96?img=22" />
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">md · 48px</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Avatar size="lg">
            <AvatarImage src="https://i.pravatar.cc/128?img=31" />
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">lg · 64px</span>
        </div>
        <div className="flex ml-6">
          {[15, 22, 31, 44].map((i, idx) => (
            <Avatar
              key={i}
              size="sm"
              className={cn("ring-2 ring-background", idx > 0 && "-ml-2")}
            >
              <AvatarImage src={`https://i.pravatar.cc/64?img=${i}`} />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          ))}
          <span className="ml-2 text-xs text-muted-foreground self-center">
            + altri 3
          </span>
        </div>
      </div>
    </SubBlock>

    <SubBlock title="Progress" source="Fondo neutro, primary di default, olive a 100%">
      <div className="space-y-4 max-w-md">
        <div>
          <p className="text-xs text-muted-foreground mb-1">0%</p>
          <Progress value={0} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">40%</p>
          <Progress value={40} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">100%</p>
          <Progress value={100} />
        </div>
      </div>
    </SubBlock>

    <SubBlock title="Tabs">
      <Tabs defaultValue="one" className="max-w-md">
        <TabsList>
          <TabsTrigger value="one">Uno</TabsTrigger>
          <TabsTrigger value="two">Due</TabsTrigger>
          <TabsTrigger value="three">Tre</TabsTrigger>
        </TabsList>
        <TabsContent value="one" className="text-sm text-muted-foreground pt-3">
          Contenuto uno
        </TabsContent>
        <TabsContent value="two" className="text-sm text-muted-foreground pt-3">
          Contenuto due
        </TabsContent>
        <TabsContent value="three" className="text-sm text-muted-foreground pt-3">
          Contenuto tre
        </TabsContent>
      </Tabs>
    </SubBlock>

    <SubBlock title="Overlays">
      <TooltipProvider>
        <div className="flex flex-wrap gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Tooltip</Button>
            </TooltipTrigger>
            <TooltipContent>Suggerimento</TooltipContent>
          </Tooltip>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm">
              Contenuto popover
            </PopoverContent>
          </Popover>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Titolo dialog</DialogTitle>
                <DialogDescription>
                  Descrizione del dialog di esempio.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Dropdown</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Azione uno</DropdownMenuItem>
              <DropdownMenuItem>Azione due</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Toast di esempio",
                description: "Attivato dal design system",
              })
            }
          >
            Toast
          </Button>
        </div>
      </TooltipProvider>
    </SubBlock>

    <SubBlock title="Skeleton / Separator / Accordion">
      <div className="space-y-6">
        <div className="space-y-2 max-w-md">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Separator />
        <Accordion type="single" collapsible className="max-w-md">
          <AccordionItem value="a">
            <AccordionTrigger>Domanda 1</AccordionTrigger>
            <AccordionContent>Risposta 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Domanda 2</AccordionTrigger>
            <AccordionContent>Risposta 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </SubBlock>

    <SubBlock title="Table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Selezione</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Casting Estate</TableCell>
            <TableCell>Attivo</TableCell>
            <TableCell>3/6</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Spot Autunno</TableCell>
            <TableCell>Bozza</TableCell>
            <TableCell>0/4</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </SubBlock>
  </Section>
);

const StatusDot = ({
  color,
  label,
  text,
}: {
  color: string;
  label: string;
  text: string;
}) => (
  <div className="inline-flex items-center gap-2">
    <span className={cn("h-2 w-2 rounded-full", color)} />
    <span className={cn("text-sm font-semibold", text)}>{label}</span>
  </div>
);

const PatternsSection = () => (
  <Section
    id="patterns"
    title="Pattern dotCasting"
    caption="src/index.css @layer components · classi dc-*"
  >
    <SubBlock title=".dc-card" source="rounded-3xl · shadow-sm · bg-white">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="dc-card p-6">
          <p className="text-sm text-muted-foreground">Card vuota</p>
        </div>
        <div className="dc-card p-6 space-y-2">
          <h3 className="text-lg font-display uppercase tracking-wide">
            Card con contenuto
          </h3>
          <p className="text-sm text-muted-foreground">
            Corpo card in DM Sans.
          </p>
        </div>
      </div>
    </SubBlock>

    <SubBlock
      title="Badge stati casting"
      source="src/components/castings/CastingRow.tsx"
    >
      <div className="flex flex-wrap gap-6">
        <StatusDot color="bg-amber-500" text="text-amber-600" label="Bozza" />
        <StatusDot
          color="bg-[#729128]"
          text="text-[#729128]"
          label="Attivo"
        />
        <StatusDot
          color="bg-muted-foreground/60"
          text="text-muted-foreground"
          label="Archiviato"
        />
      </div>
    </SubBlock>

    <SubBlock title="Badge stati talent" source="success · warning · olive · charcoal">
      <div className="flex flex-wrap gap-2">
        <span className="dc-badge-success">Confermato</span>
        <span className="dc-badge-warning">In attesa</span>
        <span className="dc-badge-destructive">Scartato</span>
        <span className="dc-badge bg-charcoal text-charcoal-foreground border-transparent">
          Neutro
        </span>
        <span className="dc-badge bg-olive text-olive-foreground border-transparent">
          Olive
        </span>
      </div>
    </SubBlock>

    <SubBlock title="Stella preferito (ambra)" source="FavoriteCastingStar variant=amber">
      <div className="flex items-center gap-4">
        <Star className="h-5 w-5 text-amber-400" fill="currentColor" />
        <Star className="h-5 w-5 text-muted-foreground" />
      </div>
    </SubBlock>

    <SubBlock title=".dc-link-action">
      <a href="#" className="dc-link-action">
        Apri il dettaglio <ChevronRight className="h-4 w-4" />
      </a>
    </SubBlock>

    <SubBlock title="Sidebar admin (mock)" source="src/components/layout/OwnerSidebar.tsx">
      <div className="w-64 rounded-2xl overflow-hidden bg-[#1A1A1A] text-white/90 shadow-md">
        <div className="p-6 flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-primary" />
          <span className="text-xs font-display uppercase tracking-widest text-white/60">
            Admin
          </span>
        </div>
        <nav className="px-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: Users, label: "Database talenti" },
            { icon: Film, label: "Casting" },
          ].map((it) => (
            <div
              key={it.label}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm",
                it.active
                  ? "bg-primary text-primary-foreground"
                  : "text-white/70 hover:bg-white/10",
              )}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </div>
          ))}
        </nav>
        <div className="mt-6">
          <div className="border-t border-white/10 mx-2 mb-3" />
          <div className="px-4 mb-2 text-xs uppercase tracking-wider text-white/40">
            Preferiti
          </div>
          <div className="px-4 py-1.5 flex items-center gap-2 text-sm text-white/70">
            <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
            <span className="truncate">Spot TV Brand di Moda</span>
          </div>
        </div>
        <div className="p-4 mt-6 border-t border-white/10 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              GA
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm text-white">Giulia</p>
            <p className="text-sm text-white">Ameglio</p>
          </div>
        </div>
      </div>
    </SubBlock>
  </Section>
);

const BlocksSection = () => (
  <Section
    id="blocks"
    title="Blocchi complessi"
    caption="Composizioni usate nelle pagine"
  >
    <SubBlock
      title="ActionableStatCard"
      source="src/components/owner/dashboard/ActionableStatCard.tsx"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* Neutro */}
        <div className="cursor-pointer border-0 shadow-sm rounded-3xl bg-white text-foreground p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Nuove candidature</p>
              <p className="text-3xl font-semibold mt-1">0</p>
            </div>
            <Bell className="h-8 w-8 text-muted-foreground/60" />
          </div>
        </div>
        {/* Attention */}
        <div className="cursor-pointer border-0 shadow-sm rounded-3xl bg-olive text-olive-foreground p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-olive-foreground/80">
                Nuove candidature
              </p>
              <p className="text-3xl font-semibold mt-1">7</p>
            </div>
            <Bell className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>
    </SubBlock>

    <SubBlock
      title="CastingRow"
      source="src/components/castings/CastingRow.tsx"
    >
      <div>
        <div className="grid grid-cols-[32px_1fr_180px_140px_120px] items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border/60">
          <span />
          <span>Titolo</span>
          <span>Selezione</span>
          <span>Stato</span>
          <span />
        </div>
        {[
          {
            title: "Spot TV Brand di Moda",
            status: "Attivo",
            dot: "bg-[#729128]",
            text: "text-[#729128]",
            confirmed: 3,
          },
          {
            title: "Editoriale Autunno",
            status: "Bozza",
            dot: "bg-amber-500",
            text: "text-amber-600",
            confirmed: 0,
          },
          {
            title: "Campagna Estate 25",
            status: "Archiviato",
            dot: "bg-muted-foreground/60",
            text: "text-muted-foreground",
            confirmed: 7,
          },
        ].map((c) => {
          const shown = Math.min(c.confirmed, 3);
          const extra = Math.max(0, c.confirmed - shown);
          return (
          <div
            key={c.title}
            className="group grid grid-cols-[32px_1fr_180px_140px_120px] items-center gap-4 px-4 h-20 border-b border-border/40 hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <span className="inline-flex items-center justify-center rounded-full p-1.5 text-amber-400">
              <Star size={16} fill="currentColor" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <span className="text-foreground font-medium truncate block">{c.title}</span>
            </div>
            <div className="flex items-center">
              {c.confirmed === 0 ? (
                <span className="text-sm text-muted-foreground/70">—</span>
              ) : (
                <div className="flex items-center">
                  {Array.from({ length: shown }).map((_, i) => (
                    <Avatar
                      key={i}
                      size="md"
                      className={cn("ring-2 ring-background", i > 0 && "-ml-3")}
                    >
                      <AvatarImage src={`https://i.pravatar.cc/96?img=${i + 10}`} />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                  ))}
                  {extra > 0 && (
                    <div className="-ml-3 h-12 w-12 rounded-full ring-2 ring-background bg-muted text-xs font-medium text-muted-foreground flex items-center justify-center">
                      +{extra}
                    </div>
                  )}
                </div>
              )}
            </div>
            <StatusDot color={c.dot} text={c.text} label={c.status} />
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="icon-md" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-md" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-4 w-4" />
              </Button>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </div>
          );
        })}
      </div>
    </SubBlock>

    <SubBlock
      title="Search & Filtri (pagina Casting)"
      source="src/components/castings/CastingFilters.tsx"
    >
      <CastingFiltersDemo />
    </SubBlock>

    <SubBlock
      title="Talent tile (pagina cliente)"
      source="src/pages/shared/TalentTile.tsx"
    >
      <div className="bg-[#0F0F0F] rounded-3xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MOCK_SHARED_ROUND.talents.slice(0, 4).map((row, idx) => (
            <TalentTile
              key={row.role_talent_id}
              row={row as any}
              selectable
              selected={idx === 1}
              showStatus={false}
              onToggle={() => {}}
              onOpenDetails={() => {}}
            />
          ))}
        </div>
      </div>
    </SubBlock>

    <SubBlock
      title="Talent board card + drawer (database talenti)"
      source="src/components/talents/TalentBoardCard.tsx · TalentPreviewDrawer.tsx"
    >
      <TalentDatabaseDemo />
    </SubBlock>
  </Section>
);


// ---------- Page ----------
const sections = [
  { id: "tokens", label: "Tokens" },
  { id: "typography", label: "Typography" },
  { id: "primitives", label: "Primitive shadcn" },
  { id: "patterns", label: "Pattern dotCasting" },
  { id: "blocks", label: "Blocchi complessi" },
];

const DesignSystemContent = () => {
  useEffect(() => {
    document.title = "Design System · dotCasting";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            dev · read-only
          </p>
          <h1 className="text-4xl font-display uppercase tracking-wide">
            Design System
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Vetrina centralizzata di token, tipografia, primitive shadcn,
            pattern dotCasting e blocchi complessi. Le modifiche si fanno
            editando <code className="font-mono">src/index.css</code> o i
            singoli componenti condivisi.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-8 space-y-1 text-sm">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-16 min-w-0">
            <TokensSection />
            <TypographySection />
            <PrimitivesSection />
            <PatternsSection />
            <BlocksSection />
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap in BrowserRouter fallback isn't needed — page is mounted inside App's router.
const DesignSystem = () => <DesignSystemContent />;

export default DesignSystem;
