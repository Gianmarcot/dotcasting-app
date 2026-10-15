import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clapperboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export interface Crumb {
  /** `null` = nome in caricamento (mostra uno skeleton). */
  label: string | null;
  to?: string;
}

interface Props {
  castingId?: string;
  /** Livelli successivi al casting (ruolo, scheda, invio…); l'ultimo è la pagina corrente. */
  trail?: Crumb[];
}

type Node = { kind: "crumb"; crumb: Crumb; index: number } | { kind: "more"; hidden: Crumb[] };

/** Desktop: oltre 4 voci tiene la prima e le ultime due. Mobile: solo le ultime due. */
function collapse(items: Crumb[], keepFirst: boolean, tail: number): Node[] {
  const max = keepFirst ? tail + 2 : tail;
  if (items.length <= max) return items.map((crumb, index) => ({ kind: "crumb", crumb, index }));
  const start = keepFirst ? 1 : 0;
  const nodes: Node[] = [];
  if (keepFirst) nodes.push({ kind: "crumb", crumb: items[0], index: 0 });
  nodes.push({ kind: "more", hidden: items.slice(start, items.length - tail) });
  items.slice(items.length - tail).forEach((crumb, i) =>
    nodes.push({ kind: "crumb", crumb, index: items.length - tail + i }),
  );
  return nodes;
}

function Label({ crumb, index }: { crumb: Crumb; index: number }) {
  if (crumb.label === null) return <Skeleton className="h-3.5 w-20 rounded-full" />;
  return (
    <>
      {index === 0 && <Clapperboard className="h-3.5 w-3.5 shrink-0" />}
      <span className="truncate">{crumb.label}</span>
    </>
  );
}

function Trail({ items, nodes, className }: { items: Crumb[]; nodes: Node[]; className?: string }) {
  return (
    <BreadcrumbList className={className}>
      {nodes.map((node, i) => {
        const last = i === nodes.length - 1;
        let content;
        if (node.kind === "more") {
          content = (
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Mostra percorso completo" className="rounded-full">
                <BreadcrumbEllipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {node.hidden.map((c, j) => (
                  <DropdownMenuItem key={j} asChild>
                    <Link to={c.to ?? "#"}>{c.label ?? "…"}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        } else {
          const { crumb, index } = node;
          const isCurrent = index === items.length - 1;
          const inner = isCurrent || !crumb.to ? (
            <BreadcrumbPage className="max-w-[240px]">
              <span className="truncate">{crumb.label ?? <Skeleton className="h-3.5 w-20 rounded-full" />}</span>
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild className="max-w-[200px]">
              <Link to={crumb.to}>
                <Label crumb={crumb} index={index} />
              </Link>
            </BreadcrumbLink>
          );
          content =
            crumb.label && crumb.label.length > 24 ? (
              <Tooltip>
                <TooltipTrigger asChild>{inner}</TooltipTrigger>
                <TooltipContent>{crumb.label}</TooltipContent>
              </Tooltip>
            ) : (
              inner
            );
        }
        return (
          <Fragment key={i}>
            <BreadcrumbItem>{content}</BreadcrumbItem>
            {!last && <BreadcrumbSeparator />}
          </Fragment>
        );
      })}
    </BreadcrumbList>
  );
}

/** Percorso progressivo dell'area casting: Casting / {casting} / {ruolo} / … */
export function CastingBreadcrumbs({ castingId, trail = [] }: Props) {
  const { data: title } = useQuery({
    queryKey: ["casting-title", castingId],
    enabled: !!castingId,
    queryFn: async () => {
      const { data } = await supabase.from("castings").select("title").eq("id", castingId!).maybeSingle();
      return data?.title ?? "";
    },
  });

  const items: Crumb[] = [{ label: "Casting", to: "/owner/castings" }];
  if (castingId) items.push({ label: title ?? null, to: `/owner/castings/${castingId}` });
  items.push(...trail);

  return (
    <Breadcrumb className="-ml-2">
      <Trail items={items} nodes={collapse(items, true, 2)} className="hidden flex-nowrap sm:flex" />
      <Trail items={items} nodes={collapse(items, false, 2)} className="flex-nowrap sm:hidden" />
    </Breadcrumb>
  );
}
