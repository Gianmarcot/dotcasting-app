import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  castingId?: string;
  /** Livelli successivi al casting (ruolo, scheda, invio…); l'ultimo è la pagina corrente. */
  trail?: Crumb[];
}

/** Percorso progressivo dell'area casting: Casting › {casting} › {ruolo} › … */
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
  if (castingId) items.push({ label: title || "…", to: `/owner/castings/${castingId}` });
  items.push(...trail);

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1.5 sm:gap-2">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <BreadcrumbItem className="max-w-[220px]">
                {last || !c.to ? (
                  <BreadcrumbPage className="truncate">{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="truncate">
                    <Link to={c.to}>{c.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
