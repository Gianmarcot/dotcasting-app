import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Surface, type SurfaceVariant } from "@/components/ui/surface";
import { useState } from "react";
import {
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
} from "@/components/ui/field";

/** Riga con i campi standard (floating label) nei vari stati. */
const FloatingRow = () => {
  const [filled, setFilled] = useState("Gianmarco Varetti");
  const [empty, setEmpty] = useState("");
  const [city, setCity] = useState("Milano");
  const [note, setNote] = useState("");

  return (
    <div className="mt-8 grid max-w-[1000px] grid-cols-1 gap-6 md:grid-cols-4">
      <FloatingInput label="Nome e cognome" value={filled} onChange={setFilled} />
      <FloatingInput label="Nome e cognome" value={empty} onChange={setEmpty} />
      <FloatingInput label="Nome e cognome" value="Bloccato" onChange={() => {}} disabled />
      <FloatingSelect
        label="Città"
        value={city}
        onValueChange={setCity}
        options={[
          { value: "Milano", label: "Milano" },
          { value: "Torino", label: "Torino" },
          { value: "Roma", label: "Roma" },
        ]}
      />
      <FloatingInput
        label="Codice fiscale"
        value="ABC"
        onChange={() => {}}
        error="Codice fiscale non valido"
      />
      <FloatingTextarea label="Note" value={note} onChange={setNote} className="md:col-span-3" />
    </div>
  );
};

const SURFACES: { variant: SurfaceVariant; label: string }[] = [
  { variant: "base", label: "base — fondo bianco" },
  { variant: "muted", label: "muted — fondo crema" },
  { variant: "brand", label: "brand — fondo bordeaux" },
  { variant: "inverse", label: "inverse — fondo ink" },
];

const StateLabel = ({ children }: { children: string }) => (
  <p className="mb-2 text-xs uppercase tracking-wide opacity-70">{children}</p>
);

/** Campo con focus applicato al mount, per confrontare lo stato focused a colpo d'occhio. */
const FocusedInput = () => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return <Input ref={ref} defaultValue="Focused" />;
};

const Column = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <StateLabel>{title}</StateLabel>
    {children}
  </div>
);

const SelectField = ({
  disabled,
  placeholder,
}: {
  disabled?: boolean;
  placeholder?: boolean;
}) => (
  <Select defaultValue={placeholder ? undefined : "milano"} disabled={disabled}>
    <SelectTrigger>
      <SelectValue placeholder="Seleziona una città" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="milano">Milano</SelectItem>
      <SelectItem value="torino">Torino</SelectItem>
      <SelectItem value="roma">Roma</SelectItem>
    </SelectContent>
  </Select>
);

const Matrix = ({ variant, label }: { variant: SurfaceVariant; label: string }) => (
  <Surface variant={variant} className="rounded-3xl p-8">
    <p className="mb-6 font-display text-xl uppercase">{label}</p>

    <div className="grid max-w-[1000px] grid-cols-1 gap-6 md:grid-cols-4">
      <Column title="Filled">
        <Input defaultValue="Gianmarco Varetti" />
      </Column>
      <Column title="Placeholder">
        <Input placeholder="Nome e cognome" />
      </Column>
      <Column title="Disabled">
        <Input placeholder="Nome e cognome" disabled />
      </Column>
      <Column title="Focused">
        {variant === "base" ? <FocusedInput /> : <Input defaultValue="Focused" />}
      </Column>

      <Column title="Select filled">
        <SelectField />
      </Column>
      <Column title="Select placeholder">
        <SelectField placeholder />
      </Column>
      <Column title="Select disabled">
        <SelectField placeholder disabled />
      </Column>
      <Column title="Textarea">
        <Textarea placeholder="Note" />
      </Column>
    </div>
  </Surface>
);

export const FieldsMatrix = () => (
  <div className="min-h-screen bg-background p-6 md:p-10">
    <header className="mx-auto mb-8 max-w-[1080px]">
      <h1 className="font-display text-3xl uppercase">Campi surface-aware</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        4 contesti x 4 stati x tipi di campo. Nessuna prop di variante: il colore arriva dalla
        superficie.
      </p>
    </header>

    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      {SURFACES.map((s) => (
        <Matrix key={s.variant} {...s} />
      ))}

      {/* Ereditarietà: inverse annidata dentro muted, senza override */}
      <Surface variant="muted" className="rounded-3xl p-8">
        <p className="mb-4 font-display text-xl uppercase">Annidamento: inverse dentro muted</p>
        <Input placeholder="Campo su crema" className="max-w-[480px]" />
        <Surface variant="inverse" className="mt-6 rounded-3xl p-6">
          <Input placeholder="Campo su ink" className="max-w-[480px]" />
        </Surface>
      </Surface>
    </div>
  </div>
);

export default FieldsMatrix;
